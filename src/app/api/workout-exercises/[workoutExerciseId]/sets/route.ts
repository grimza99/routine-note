import { NextRequest, NextResponse } from 'next/server';

import { getAuthUserId, getSupabaseAdmin } from '@/shared/libs/supabase';
import { randomUUID } from 'crypto';

const json = (status: number, body: unknown) => NextResponse.json(body, { status });

type Params = Promise<{ workoutExerciseId: string }>;

export async function POST(request: NextRequest, context: { params: Params }) {
  const userId = await getAuthUserId(request);

  if (!userId) {
    return json(401, { error: { code: 'UNAUTHORIZED', message: 'missing or invalid token' } });
  }

  const body = (await request.json()) as { weight?: number; reps?: number; note?: string };

  const { workoutExerciseId } = await Promise.resolve(context.params);

  const supabase = getSupabaseAdmin();
  const { data: standalone, error: standaloneError } = await supabase
    .from('workout_exercises')
    .select('id, workouts!inner(user_id)')
    .eq('exercise_id', workoutExerciseId)
    .eq('workouts.user_id', userId)
    .maybeSingle();

  if (standaloneError) {
    return json(500, { error: { code: 'workout_exercises DB_ERROR', message: standaloneError.message } });
  }

  if (standalone) {
    const { data, error } = await supabase
      .from('sets')
      .insert({
        id: randomUUID(),
        workout_exercise_id: workoutExerciseId,
        weight: body.weight ?? null,
        reps: body.reps ?? null,
        type: 'STANDALONE_EXERCISE',
        created_at: new Date(),
      })
      .select('id, weight, reps')
      .single();

    if (error) {
      return json(500, { error: { code: 'sets insert DB_ERROR', message: error.message } });
    }

    return json(201, data);
  } else {
    const { data: routineExercise, error: rouineItemsDataError } = await supabase
      .from('workout_routine_items')
      .select('id, workout_routines!inner(workout_id, workouts!inner(user_id))')
      .eq('id', workoutExerciseId)
      .eq('workout_routines.workouts.user_id', userId)
      .maybeSingle();

    if (rouineItemsDataError) {
      return json(500, { error: { code: 'workout_routine_items DB_ERROR', message: rouineItemsDataError.message } });
    }
    if (!routineExercise) {
      return json(404, { error: { code: 'NOT_FOUND', message: 'workout routine item not found' } });
    }
    const { data, error } = await supabase
      .from('sets')
      .insert({
        id: randomUUID(),
        workout_routine_item_id: workoutExerciseId,
        weight: body.weight ?? null,
        reps: body.reps ?? null,
        type: 'ROUTINE_EXERCISE',
        created_at: new Date(),
      })
      .select('id, weight, reps')
      .single();

    if (error) {
      return json(500, { error: { code: 'sets insert DB_ERROR', message: error.message } });
    }

    return json(201, data);
  }
}
