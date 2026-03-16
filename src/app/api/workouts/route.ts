import { NextRequest } from 'next/server';
import { getAuthUserId, getSupabaseAdmin } from '@/shared/libs/supabase';
import { randomUUID } from 'crypto';
import { json } from '@/shared/libs/api-route';
import { ICardioSet, IStrengthSet, IWorkoutExercise, IWorkoutPayload, TTraining } from '@routine-note/package-shared';

interface IExercise extends Omit<IWorkoutExercise, 'trainingType'> {
  training_type: TTraining;
}

type WorkoutRoutine = {
  id: string;
  name: string;
  routine_id: string;
  note: string | null;
  routines: { id: string; name: string } | null;
  workout_routine_items: IExercise[] | null;
};

type WorkoutResponse = {
  id: string;
  workout_date: string;
  workout_routines: WorkoutRoutine[] | null;
  workout_standalone_exercises: IExercise[] | null;
};

const mapSetResponse = (sets: any) => {
  const returnSets = [];
  for (const set of sets) {
    if (set.cardio_record_type && set.cardio_record_value) {
      returnSets.push({
        id: set.id,
        type: set.cardio_record_type,
        value: set.cardio_record_value,
      } as ICardioSet);
    } else {
      returnSets.push({
        id: set.id,
        weight: set.weight,
        reps: set.reps,
      } as IStrengthSet);
    }
  }
  return returnSets;
};
const mapExercises = (exercise: IExercise) => ({
  id: exercise.id,
  name: exercise.name ?? '',
  trainingType: exercise.training_type,
  sets: mapSetResponse(exercise.sets) ?? [],
});

const mapWorkoutResponse = (workout: WorkoutResponse) => ({
  id: workout.id,
  date: workout.workout_date,
  routines: (workout.workout_routines ?? []).map((routine) => {
    const routineExercises = routine.workout_routine_items ?? [];

    return {
      id: routine.id,
      routineId: routine.routine_id,
      name: routine.name ?? null,
      note: routine.note,
      exercises: routineExercises.map(mapExercises),
    };
  }),
  standalone_exercises: (workout.workout_standalone_exercises ?? []).map(mapExercises),
});

const workoutSelect = `
  id,
  workout_date,
  workout_routines (
    id,
    name,
    note,
    workout_routine_items (
      id,
      name,
      training_type,
      sets (
      id,
      weight,
      reps,
      cardio_record_type,
      cardio_record_value
      )
    )
  ),
  workout_standalone_exercises (
    id,
    name,
    training_type,
    sets (
      id,
      weight,
      reps,
      cardio_record_type,
      cardio_record_value
    )
  )
`;
//---------------------------------------------yyyy-mm-dd에 따른 workout 조회 ----------------------------------------------

export async function GET(request: NextRequest) {
  const userId = await getAuthUserId(request);

  if (!userId) {
    return json(401, { error: { code: 'UNAUTHORIZED', message: 'missing or invalid token' } });
  }

  const date = request.nextUrl.searchParams.get('date');

  if (!date) {
    return json(400, { error: { code: 'VALIDATION_ERROR', message: 'date is required' } });
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('workouts')
    .select(workoutSelect)
    .eq('user_id', userId)
    .eq('workout_date', date)
    .maybeSingle();

  if (error) {
    return json(500, { error: { code: 'DB_ERROR', message: error.message } });
  }

  return json(
    200,
    data
      ? mapWorkoutResponse(data as unknown as WorkoutResponse)
      : {
          routines: [],
          standalone_exercises: [],
        },
  );
}

//---------------------------------------------workout 생성 ----------------------------------------------
export async function POST(request: NextRequest) {
  const userId = await getAuthUserId(request);

  if (!userId) {
    return json(401, { error: { code: 'UNAUTHORIZED', message: 'missing or invalid token' } });
  }
  const body = (await request.json()) as IWorkoutPayload;

  if (!body?.date) {
    return json(400, { error: { code: 'VALIDATION_ERROR', message: 'date is required' } });
  }
  if (!body?.routines || !body?.standalone_exercises) {
    return json(400, { error: { code: 'VALIDATION_ERROR', message: 'routines or exercises is required' } });
  }

  const routines = body.routines ?? [];
  const standalone_exercises = body.standalone_exercises ?? [];

  if (!Array.isArray(routines) || !Array.isArray(standalone_exercises)) {
    return json(400, { error: { code: 'VALIDATION_ERROR', message: 'routines/exercises must be arrays' } });
  }

  if (routines.length === 0 && standalone_exercises.length === 0) {
    return json(400, { error: { code: 'VALIDATION_ERROR', message: 'at least one routine or exercise is required' } });
  }

  const supabase = getSupabaseAdmin();

  const targetRoutines = [];

  if (routines.length) {
    const routineIds = routines.map((routine) => routine.id).filter(Boolean) as string[];
    const { data: routineRows, error: routineError } = await supabase
      .from('routines')
      .select('id, name')
      .in('id', routineIds)
      .eq('user_id', userId);

    if (routineError) {
      return json(500, { error: { code: 'DB_ERROR', message: routineError.message } });
    }

    if ((routineRows?.length ?? 0) !== routineIds.length) {
      return json(404, { error: { code: 'NOT_FOUND', message: 'routine not found' } });
    }
    targetRoutines.push(...routineRows);
  }

  const { data, error } = await supabase
    .from('workouts')
    .insert({ workout_date: body.date, user_id: userId, id: randomUUID() })
    .select('id, workout_date')
    .single();

  if (error) {
    const isConflict = error.code === '23505';
    return json(isConflict ? 409 : 500, {
      error: { code: isConflict ? 'CONFLICT' : 'workouts insert DB_ERROR', message: error.message },
    });
  }

  const workoutId = data.id;

  for (const [_, routine] of targetRoutines.entries()) {
    const note = routines.find((r) => r.id === routine.id)?.note ?? '';
    const { data: createdRoutine, error: routineError } = await supabase
      .from('workout_routines')
      .insert({
        workout_id: workoutId,
        name: routine?.name ?? '',
        note,
        date: body.date,
      })
      .select('id,workout_id,name,note')
      .single();

    if (routineError) {
      return json(500, { error: { code: 'workout_routines insert DB_ERROR', message: routineError.message } });
    }

    const { data: routineItems, error: routineItemsError } = await supabase
      .from('routine_items')
      .select('id, name')
      .eq('routine_id', routine.id)
      .order('item_order', { ascending: true });

    if (routineItemsError) {
      return json(500, { error: { code: 'routine_items select DB_ERROR', message: routineItemsError.message } });
    }

    if (routineItems?.length) {
      const workoutRoutineItemsPayload = routineItems.map((item) => ({
        id: randomUUID(),
        workout_id: createdRoutine.workout_id,
        workout_routine_id: createdRoutine.id,
        name: item.name ?? null,
      }));

      const { error: workoutRoutineItemsError } = await supabase
        .from('workout_routine_items')
        .insert(workoutRoutineItemsPayload);

      if (workoutRoutineItemsError) {
        return json(500, {
          error: { code: 'workout_routine_items insert DB_ERROR', message: workoutRoutineItemsError.message },
        });
      }
    }
  }

  for (const [_, exercise] of standalone_exercises.entries()) {
    if (!exercise.name?.trim()) {
      continue; // Skip exercises with empty or whitespace-only names
    }
    const { error: exerciseError } = await supabase.from('workout_standalone_exercises').insert({
      id: randomUUID(),
      workout_id: workoutId,
      name: exercise.name?.trim() ?? null,
      training_type: exercise.trainingType,
    });

    if (exerciseError) {
      return json(500, {
        error: { code: 'insert workout_standalone_exercises Table DB_ERROR', message: exerciseError.message },
      });
    }
  }

  const { data: workout, error: workoutError } = await supabase
    .from('workouts')
    .select(workoutSelect)
    .eq('id', workoutId)
    .eq('user_id', userId)
    .maybeSingle();

  if (workoutError) {
    return json(500, { error: { code: 'DB_ERROR', message: workoutError.message } });
  }

  return json(201, workout ? mapWorkoutResponse(workout as unknown as WorkoutResponse) : null);
}
