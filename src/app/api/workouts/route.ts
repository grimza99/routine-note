import { NextRequest, NextResponse } from 'next/server';

import { getAuthUserId, getSupabaseAdmin } from '@/shared/libs/supabase';
import { randomUUID } from 'crypto';

const json = (status: number, body: unknown) => NextResponse.json(body, { status });

type WorkoutSet = {
  id: string;
  weight: number | null;
  reps: number | null;
  note: string | null;
  set_order: number;
};

type WorkoutExercise = {
  id: string;
  exercise_id: string;
  exercise_name?: string | null;
  note: string | null;
  item_order: number;
  workout_routine_id: string | null;
  sets: WorkoutSet[] | null;
};

type WorkoutRoutine = {
  id: string;
  routine_id: string;
  item_order: number;
  note: string | null;
  routines: { id: string; name: string; routine_items: RoutineItem[] | null } | null;
  workout_exercises: WorkoutExercise[] | null;
};

type RoutineItem = {
  exercise_id: string;
  exercise_name: string | null;
  item_order: number;
};

type WorkoutResponse = {
  id: string;
  workout_date: string;
  workout_routines: WorkoutRoutine[] | null;
  workout_exercises: WorkoutExercise[] | null;
};

type RoutineRequest = {
  routineId?: string;
  order?: number;
  note?: string;
};

type ExerciseRequest = {
  exerciseId?: string;
  exerciseName?: string;
  order?: number;
  note?: string;
  routineIndex?: number;
};

type RequestBody = {
  date?: string;
  routines?: RoutineRequest[];
  exercises?: ExerciseRequest[];
};

const mapRoutineExercise = (exercise: WorkoutExercise, name: string | null = null) => ({
  id: exercise.exercise_id,
  name,
  note: exercise.note,
  order: exercise.item_order,
  sets: (exercise.sets ?? []).map((set) => ({
    id: set.id,
    weight: set.weight,
    reps: set.reps,
    note: set.note,
    order: set.set_order,
  })),
});

const mapStandaloneExercise = (exercise: WorkoutExercise) => ({
  id: exercise.id,
  name: exercise.exercise_name ?? '',
  note: exercise.note,
  order: exercise.item_order,
  sets: (exercise.sets ?? []).map((set) => ({
    id: set.id,
    weight: set.weight,
    reps: set.reps,
    note: set.note,
    order: set.set_order,
  })),
});

const mapWorkoutResponse = (workout: WorkoutResponse) => ({
  id: workout.id,
  date: workout.workout_date,
  routines: (workout.workout_routines ?? []).map((routine) => {
    const routineItems = routine.routines?.routine_items ?? [];
    const routineItemMap = new Map(routineItems.map((item) => [item.exercise_id, item.exercise_name ?? null]));

    return {
      id: routine.routine_id,
      routineName: routine.routines?.name ?? null,
      order: routine.item_order,
      note: routine.note,
      exercises: (routine.workout_exercises ?? []).map((exercise) =>
        mapRoutineExercise(exercise, routineItemMap.get(exercise.exercise_id) ?? null),
      ),
    };
  }),
  exercises: (workout.workout_exercises ?? []).map(mapStandaloneExercise),
});
const workoutSelect = `
  id,
  workout_date,
  workout_routines (
    id,
    routine_id,
    item_order,
    note,
    routines ( id, name, routine_items ( exercise_id, exercise_name ) ),
    workout_exercises (
      id,
      workout_routine_id,
      exercise_id,
      exercise_name,
      note,
      item_order,
      workout_routine_id,
      sets (
        id,
        weight,
        reps,
        note,
        set_order
      )
    )
  ),
  workout_exercises (
    id,
    exercise_id,
    exercise_name,
    note,
    item_order,
    workout_routine_id,
    sets (
      id,
      weight,
      reps,
      note,
      set_order
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

  return json(200, data ? mapWorkoutResponse(data as unknown as WorkoutResponse) : null);
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
  if (!body?.routines || !body?.exercises) {
    return json(400, { error: { code: 'VALIDATION_ERROR', message: 'routines or exercises is required' } });
  }

  const routines = body.routines ?? [];
  const exercises = body.exercises ?? [];

  if (!Array.isArray(routines) || !Array.isArray(exercises)) {
    return json(400, { error: { code: 'VALIDATION_ERROR', message: 'routines/exercises must be arrays' } });
  }

  for (const routine of routines) {
    if (!routine?.routineId) {
      return json(400, { error: { code: 'VALIDATION_ERROR', message: 'routineId is required' } });
    }
  }

  for (const exercise of exercises) {
    if (exercise.routineIndex === undefined && !exercise.exerciseName?.trim()) {
      return json(400, {
        error: { code: 'VALIDATION_ERROR', message: 'exerciseName is required for standalone exercises' },
      });
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
  const createdRoutines: { id: string; routineId: string; order: number; note: string | null }[] = [];

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
      .select('id, routine_id, item_order, note')
      .single();

    if (routineError) {
      return json(500, { error: { code: 'workout_routines insert DB_ERROR', message: routineError.message } });
    }

    const { data: routineItems, error: routineItemsError } = await supabase
      .from('routine_items')
      .select('exercise_id, exercise_name, item_order')
      .eq('routine_id', routine.routineId)
      .order('item_order', { ascending: true });

    if (routineItemsError) {
      return json(500, { error: { code: 'routine_items select DB_ERROR', message: routineItemsError.message } });
    }

    if (routineItems?.length) {
      const workoutExercisesPayload = routineItems.map((item) => ({
        id: randomUUID(),
        workout_id: workoutId,
        workout_routine_id: createdRoutine.id,
        exercise_id: item.exercise_id,
        exercise_name: item.exercise_name ?? null,
        item_order: item.item_order,
      }));

      const { error: workoutExercisesError } = await supabase.from('workout_exercises').insert(workoutExercisesPayload);

      if (workoutExercisesError) {
        return json(500, {
          error: { code: 'workout_exercises insert DB_ERROR', message: workoutExercisesError.message },
        });
      }
    }

    createdRoutines.push({
      id: createdRoutine.id,
      routineId: createdRoutine.routine_id,
      order: createdRoutine.item_order,
      note: createdRoutine.note,
    });
  }

  for (const [index, exercise] of exercises.entries()) {
    const order = exercise.order ?? index + 1;
    const routineIndex = exercise.routineIndex;
    const workoutRoutineId = routineIndex !== undefined ? (createdRoutines[routineIndex]?.id ?? null) : null;

    const { error: exerciseError } = await supabase.from('workout_exercises').insert({
      id: randomUUID(),
      workout_id: workoutId,
      workout_routine_id: workoutRoutineId,
      exercise_id: randomUUID(),
      exercise_name: exercise.exerciseName?.trim() ?? null,
      item_order: order,
      note: exercise.note ?? '',
    });

    if (exerciseError) {
      return json(500, { error: { code: 'insert workout_exercises Table DB_ERROR', message: exerciseError.message } });
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
