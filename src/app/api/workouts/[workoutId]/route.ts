import { NextRequest, NextResponse } from 'next/server';
import { getAuthUserId, getSupabaseAdmin } from '@/shared/libs/supabase';
import { randomUUID } from 'crypto';
import { IWorkoutPayload } from '@routine-note/package-shared';

import { WorkoutDBResponse } from '../route';

const json = (status: number, body: unknown) => NextResponse.json(body, { status });

type Params = Promise<{ workoutId: string }>;

const mapWorkoutResponse = (workout: WorkoutDBResponse) => ({
  id: workout.id,
  date: workout.workout_date,
  routines: (workout.workout_routines ?? []).map((routine) => {
    const routineExercises = routine.workout_routine_items ?? [];

    return {
      id: routine.id,
      name: routine.name,
      routineId: routine.routine_id,
      note: routine.note ?? '',
      exercises: routineExercises.map((exercise) => ({
        id: exercise.id,
        name: exercise.name ?? '',
        trainingType: exercise.training_type,
      })),
    };
  }),
  standalone_exercises: (workout.workout_standalone_exercises ?? []).map((exercise) => ({
    id: exercise.id,
    name: exercise.name ?? '',
    trainingType: exercise.training_type,
  })),
});

export async function PUT(request: NextRequest, context: { params: Params }) {
  const userId = await getAuthUserId(request);

  if (!userId) {
    return json(401, { error: { code: 'UNAUTHORIZED', message: 'missing or invalid token' } });
  }

  const body = (await request.json()) as IWorkoutPayload;

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

  const { data: workoutPrevRoutines, error: workoutRoutinesError } = await supabase
    .from('workout_routines')
    .select()
    .eq('workout_id', workoutId);

  if (workoutRoutinesError) {
    return json(500, {
      error: { code: 'workout_routines delete DB_ERROR', message: workoutRoutinesError.message },
    });
  }

  const bodyRoutines = new Set(routines.map((item) => item.id));

  const removed = workoutPrevRoutines.filter((item) => !bodyRoutines.has(item.routine_id));
  if (removed.length) {
    const { error: deleteWorkoutRoutinesError } = await supabase
      .from('workout_routines')
      .delete()
      .eq('workout_id', workoutId)
      .in(
        'routine_id',
        removed.map((routine) => routine.routine_id),
      );

    if (deleteWorkoutRoutinesError) {
      return json(500, {
        error: { code: 'workout_routines delete DB_ERROR', message: deleteWorkoutRoutinesError.message },
      });
    }
  }

  const newRoutineIds = routines
    .map((item) => item.id)
    .filter((id) => !workoutPrevRoutines.some((prev) => prev.routine_id === id));

  const targetRoutines = [];

  if (routines.length) {
    const { data: routineRows, error: routineError } = await supabase
      .from('routines')
      .select('id, name')
      .in('id', newRoutineIds)
      .eq('user_id', userId);

    if (routineError) {
      return json(500, { error: { code: 'routines table select DB_ERROR', message: routineError.message } });
    }
    targetRoutines.push(...routineRows);
  }

  const { data: existWorkouts, error } = await supabase
    .from('workouts')
    .select('id')
    .eq('workout_date', body.date)
    .eq('id', workoutId)
    .eq('user_id', userId)
    .maybeSingle();

  if (!existWorkouts) {
    return json(400, { error: { code: 'INVALID', message: 'workout with the same date,workoutId not exists' } });
  }
  if (error) {
    return json(500, {
      error: { code: 'workouts select DB_ERROR', message: error },
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

  const { error: deleteWorkoutRoutinesError } = await supabase
    .from('workout_routines')
    .delete()
    .eq('workout_id', workoutId)
    .in(
      'routine_id',
      targetRoutines.map((routine) => routine.id),
    );

  if (deleteWorkoutRoutinesError) {
    return json(500, {
      error: { code: 'workout_routines delete DB_ERROR', message: deleteWorkoutRoutinesError.message },
    });
  }

  for (const [_, routine] of targetRoutines.entries()) {
    const { data: createdRoutine, error: routineError } = await supabase
      .from('workout_routines')
      .insert({
        id: randomUUID(),
        workout_id: workoutId,
        routine_id: routine.id,
        date: body.date,
        note: '',
        name: routine.name ?? '',
      })
      .select('id, note')
      .single();

    if (routineError) {
      return json(500, { error: { code: 'workout_routines insert DB_ERROR', message: routineError.message } });
    }

    const { data: routineItems, error: routineItemsError } = await supabase
      .from('routine_items')
      .select('id, name, routine_id')
      .eq('routine_id', routine.id)
      .order('item_order', { ascending: true });

    if (routineItemsError) {
      return json(500, { error: { code: 'routine_items select DB_ERROR', message: routineItemsError.message } });
    }

    if (routineItems?.length) {
      const workoutRoutineItemsPayload = routineItems.map((item) => ({
        id: randomUUID(),
        workout_id: workoutId,
        workout_routine_id: createdRoutine.id,
        name: item.name ?? '',
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
    const { error: exerciseError } = await supabase.from('workout_standalone_exercises').insert({
      id: randomUUID(),
      workout_id: workoutId,
      name: exercise.name?.trim() ?? '',
      training_type: exercise.trainingType,
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
        note,
        name,
        workout_routine_items (
          id,
          name,
          training_type
        )
      ),
      workout_standalone_exercises (
        id,
        name,
        training_type
      )
      `,
    )
    .eq('id', workoutId)
    .eq('user_id', userId)
    .maybeSingle();

  if (workoutSelectError) {
    return json(500, { error: { code: 'DB_ERROR', message: workoutSelectError.message } });
  }

  return json(200, workout ? mapWorkoutResponse(workout as unknown as WorkoutDBResponse) : null);
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
