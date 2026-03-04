import { NextRequest } from 'next/server';
import { getAuthUserId, getSupabaseAdmin } from '@/shared/libs/supabase';
import { randomUUID } from 'crypto';
import { json } from '@/shared/libs/api-route';

type ExerciseSet = {
  id: string;
  weight: number | null;
  reps: number | null;
};

type IExercise = {
  id: string;
  name: string | null;
  sets: ExerciseSet[] | null;
  order?: number;
};

type WorkoutRoutine = {
  id: string;
  routine_id: string;
  item_order: number;
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

type RequestBody = {
  date?: string;
  routines?: {
    routineId?: string;
    order?: number;
    note?: string;
  }[];
  standalone_exercises?: {
    id?: string;
    name?: string;
    order?: number;
  }[];
};

const mapRoutineExercises = (exercise: IExercise) => ({
  id: exercise.id,
  name: exercise.name ?? '',
  sets:
    exercise.sets?.map((set) => ({
      id: set.id,
      weight: set.weight,
      reps: set.reps,
    })) ?? [],
});

const mapStandaloneExercise = (exercise: IExercise) => ({
  id: exercise.id,
  name: exercise.name ?? '',
  order: exercise.order,
  sets: (exercise.sets ?? []).map((set) => ({
    id: set.id,
    weight: set.weight,
    reps: set.reps,
  })),
});

const mapWorkoutResponse = (workout: WorkoutResponse) => ({
  id: workout.id,
  date: workout.workout_date,
  routines: (workout.workout_routines ?? []).map((routine) => {
    const routineExercises = routine.workout_routine_items ?? [];

    return {
      id: routine.id,
      routineId: routine.routine_id,
      name: routine.routines?.name ?? null,
      note: routine.note,
      order: routine.item_order,
      exercises: routineExercises.map(mapRoutineExercises),
    };
  }),
  standalone_exercises: (workout.workout_standalone_exercises ?? []).map(mapStandaloneExercise),
});

const workoutSelect = `
  id,
  workout_date,
  workout_routines (
    id,
    routine_id,
    item_order,
    note,
    routines ( id, name ),
    workout_routine_items (
      id,
      name,
      sets (
      id,
      weight,
      reps
    )
    )
  ),
  workout_standalone_exercises (
    id,
    name,
    item_order,
    sets (
      id,
      weight,
      reps
    )
  )
`;

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

export async function POST(request: NextRequest) {
  const userId = await getAuthUserId(request);

  if (!userId) {
    return json(401, { error: { code: 'UNAUTHORIZED', message: 'missing or invalid token' } });
  }
  const body = (await request.json()) as RequestBody;

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

  for (const routine of routines) {
    if (!routine?.routineId) {
      return json(400, { error: { code: 'VALIDATION_ERROR', message: 'routineId is required' } });
    }
  }

  const supabase = getSupabaseAdmin();

  if (routines.length) {
    const routineIds = routines.map((routine) => routine.routineId).filter(Boolean) as string[];
    const { data: routineRows, error: routineError } = await supabase
      .from('routines')
      .select('id')
      .in('id', routineIds)
      .eq('user_id', userId);

    if (routineError) {
      return json(500, { error: { code: 'DB_ERROR', message: routineError.message } });
    }

    if ((routineRows?.length ?? 0) !== routineIds.length) {
      return json(404, { error: { code: 'NOT_FOUND', message: 'routine not found' } });
    }
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

  for (const [index, routine] of routines.entries()) {
    const order = routine.order ?? index + 1;
    const { data: createdRoutine, error: routineError } = await supabase
      .from('workout_routines')
      .insert({
        workout_id: workoutId,
        routine_id: routine.routineId,
        item_order: order,
        note: routine.note ?? '',
      })
      .select('id,workout_id, routine_id, item_order, note')
      .single();

    if (routineError) {
      return json(500, { error: { code: 'workout_routines insert DB_ERROR', message: routineError.message } });
    }

    const { data: routineItems, error: routineItemsError } = await supabase
      .from('routine_items')
      .select('id, name, item_order')
      .eq('routine_id', routine.routineId)
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

  for (const [index, exercise] of standalone_exercises.entries()) {
    const order = exercise.order ?? index + 1;
    if (!exercise.name?.trim()) {
      continue; // Skip exercises with empty or whitespace-only names
    }
    const { error: exerciseError } = await supabase.from('workout_standalone_exercises').insert({
      id: randomUUID(),
      workout_id: workoutId,
      name: exercise.name?.trim() ?? null,
      item_order: order,
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
