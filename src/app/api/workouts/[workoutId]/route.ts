import { NextRequest, NextResponse } from 'next/server';

import { getAuthUserId, getSupabaseAdmin } from '@/shared/libs/supabase';
import { randomUUID } from 'crypto';

const json = (status: number, body: unknown) => NextResponse.json(body, { status });

type Params = Promise<{ workoutId: string }>;

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

type RoutineRequest = {
  routineId?: string;
  order?: number;
  note?: string;
};

type ExerciseRequest = {
  id: string;
  name: string;
  order?: number;
  note?: string;
  routineIndex?: number;
};

type RequestBody = {
  date?: string;
  routines?: RoutineRequest[];
  standalone_exercises?: ExerciseRequest[];
};

const mapRoutineItem = (item: IExercise) => ({
  id: item.id,
  name: item.name ?? '',
  note: null,
  order: item.order,
  sets: [],
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
  routines: (workout.workout_routines ?? []).map((routine) => ({
    id: routine.id,
    routineId: routine.routine_id,
    name: routine.routines?.name ?? null,
    order: routine.item_order,
    note: routine.note,
    exercises: (routine.workout_routine_items ?? []).map(mapRoutineItem),
  })),
  standalone_exercises: (workout.workout_standalone_exercises ?? []).map(mapStandaloneExercise),
});

export async function GET(request: NextRequest, context: { params: Params }) {
  const { workoutId } = await Promise.resolve(context.params);
  const userId = await getAuthUserId(request);

  if (!userId) {
    return json(401, { error: { code: 'UNAUTHORIZED', message: 'missing or invalid token' } });
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('workouts')
    .select(
      `
      id,
      workout_date,
      workout_routines (
        id,
        routine_id,
        item_order,
        note,
        routines ( id, name ),
        workout_routine_items (
          name,
          item_order
        )
      ),
      workout_standalone_exercises (
        id,
        name,
        item_order,
        sets (
          id,
          weight,
          reps,
          note,
          set_order
        )
      )
      `,
    )
    .eq('id', workoutId)
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    return json(500, { error: { code: 'DB_ERROR', message: error.message } });
  }

  if (!data) {
    return json(404, { error: { code: 'NOT_FOUND', message: 'workout not found' } });
  }

  return json(200, mapWorkoutResponse(data as unknown as WorkoutResponse));
}

export async function PUT(request: NextRequest, context: { params: Params }) {
  const userId = await getAuthUserId(request);

  if (!userId) {
    return json(401, { error: { code: 'UNAUTHORIZED', message: 'missing or invalid token' } });
  }

  const body = (await request.json()) as RequestBody;

  if (!body?.date || !body?.routines || !body?.standalone_exercises) {
    return json(400, {
      error: { code: 'VALIDATION_ERROR', message: 'date or routines or exercises is required is required' },
    });
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

  for (const exercise of standalone_exercises) {
    if (!exercise.name?.trim()) {
      return json(400, {
        error: { code: 'VALIDATION_ERROR', message: 'exerciseName is required for exercises' },
      });
    }
  }

  const { workoutId } = await Promise.resolve(context.params);

  const supabase = getSupabaseAdmin();

  const { data: workoutRow, error: workoutError } = await supabase
    .from('workouts')
    .select('id')
    .eq('id', workoutId)
    .eq('user_id', userId)
    .maybeSingle();

  if (workoutError) {
    return json(500, { error: { code: 'workouts DB_ERROR', message: workoutError.message } });
  }

  if (!workoutRow) {
    return json(404, { error: { code: 'NOT_FOUND', message: 'workout not found' } });
  }

  if (routines.length) {
    const routineIds = routines.map((routine) => routine.routineId).filter(Boolean) as string[];
    const { data: routineRows, error: routineError } = await supabase
      .from('routines')
      .select('id')
      .in('id', routineIds)
      .eq('user_id', userId);

    if (routineError) {
      return json(500, { error: { code: 'routines table select DB_ERROR', message: routineError.message } });
    }

    if ((routineRows?.length ?? 0) !== routineIds.length) {
      return json(404, { error: { code: 'NOT_FOUND', message: 'routine not found' } });
    }
  }

  const { error: updateError } = await supabase
    .from('workouts')
    .update({ workout_date: body.date })
    .eq('id', workoutId)
    .eq('user_id', userId);

  if (updateError) {
    const isConflict = updateError.code === '23505';
    return json(isConflict ? 409 : 500, {
      error: { code: isConflict ? 'CONFLICT' : 'workouts update DB_ERROR', message: updateError.message },
    });
  }

  const { error: deleteWorkoutExercisesError } = await supabase
    .from('workout_standalone_exercises')
    .delete()
    .eq('workout_id', workoutId);

  if (deleteWorkoutExercisesError) {
    return json(500, {
      error: { code: 'workout_standalone_exercises delete DB_ERROR', message: deleteWorkoutExercisesError.message },
    });
  }

  const { data: workoutRoutineRows, error: workoutRoutineSelectError } = await supabase
    .from('workout_routines')
    .select('id')
    .eq('workout_id', workoutId);

  if (workoutRoutineSelectError) {
    return json(500, {
      error: { code: 'workout_routines select DB_ERROR', message: workoutRoutineSelectError.message },
    });
  }

  const workoutRoutineIds = (workoutRoutineRows ?? []).map((row) => row.id);

  if (workoutRoutineIds.length) {
    const { error: deleteWorkoutRoutineItemsError } = await supabase
      .from('workout_routine_items')
      .delete()
      .in('workout_routine_id', workoutRoutineIds);

    if (deleteWorkoutRoutineItemsError) {
      return json(500, {
        error: { code: 'workout_routine_items delete DB_ERROR', message: deleteWorkoutRoutineItemsError.message },
      });
    }
  }

  const { error: deleteWorkoutRoutinesError } = await supabase
    .from('workout_routines')
    .delete()
    .eq('workout_id', workoutId);

  if (deleteWorkoutRoutinesError) {
    return json(500, {
      error: { code: 'workout_routines delete DB_ERROR', message: deleteWorkoutRoutinesError.message },
    });
  }

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
      .select('id, name, item_order')
      .eq('routine_id', routine.routineId)
      .order('item_order', { ascending: true });

    if (routineItemsError) {
      return json(500, { error: { code: 'routine_items select DB_ERROR', message: routineItemsError.message } });
    }

    if (routineItems?.length) {
      const workoutRoutineItemsPayload = routineItems.map((item) => ({
        id: item.id,
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

    createdRoutines.push({
      id: createdRoutine.id,
      routineId: createdRoutine.routine_id,
      order: createdRoutine.item_order,
      note: createdRoutine.note,
    });
  }

  for (const [index, exercise] of standalone_exercises.entries()) {
    const order = exercise.order ?? index + 1;

    const { error: exerciseError } = await supabase.from('workout_standalone_exercises').insert({
      id: exercise.id,
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

  const { data: workout, error: workoutSelectError } = await supabase
    .from('workouts')
    .select(
      `
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
          name
        )
      ),
      workout_standalone_exercises (
        id,
        name,
        item_order,
        sets (
          id,
          weight,
          reps,
          order
        )
      )
      `,
    )
    .eq('id', workoutId)
    .eq('user_id', userId)
    .maybeSingle();

  if (workoutSelectError) {
    return json(500, { error: { code: 'DB_ERROR', message: workoutSelectError.message } });
  }

  return json(200, workout ? mapWorkoutResponse(workout as unknown as WorkoutResponse) : null);
}

export async function DELETE(request: NextRequest, context: { params: Params }) {
  const userId = await getAuthUserId(request);

  if (!userId) {
    return json(401, { error: { code: 'UNAUTHORIZED', message: 'missing or invalid token' } });
  }

  const { workoutId } = await Promise.resolve(context.params);

  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from('workouts').delete().eq('id', workoutId).eq('user_id', userId);

  if (error) {
    return json(500, { error: { code: 'DB_ERROR', message: error.message } });
  }

  return json(200, { ok: true });
}
