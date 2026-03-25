import { NextRequest } from 'next/server';
import { getAuthUserId, getSupabaseAdmin } from '@/shared/libs/supabase';

import { IWorkoutRoutineNotePayload, IWorkoutRoutineNoteResponse } from '@routine-note/package-shared';

import { json } from '@/shared/libs/api-route';

type Params = Promise<{ workoutRoutineId: string }>;

const mapper = (data: any): IWorkoutRoutineNoteResponse => ({
  id: data.id,
  routineId: data.routine_id,
  note: data.note,
});

export async function PATCH(request: NextRequest, context: { params: Params }) {
  const userId = await getAuthUserId(request);

  if (!userId) {
    return json(401, { error: { code: 'UNAUTHORIZED', message: 'missing or invalid token' } });
  }

  const body = (await request.json()) as IWorkoutRoutineNotePayload;

  if (body.note?.trim().length === 0) {
    return;
  }

  const { workoutRoutineId } = await Promise.resolve(context.params);

  const supabase = getSupabaseAdmin();
  const { data: owner, error: ownerError } = await supabase
    .from('workout_routines')
    .select('id, workouts!inner(user_id)')
    .eq('id', workoutRoutineId)
    .eq('workouts.user_id', userId)
    .maybeSingle();

  if (ownerError) {
    return json(500, { error: { code: 'workout_routines select DB_ERROR', message: ownerError.message } });
  }

  if (!owner) {
    return json(404, { error: { code: 'NOT_FOUND', message: 'workout routine not found' } });
  }

  const { data, error } = await supabase
    .from('workout_routines')
    .update({ note: body.note })
    .eq('id', workoutRoutineId)
    .select('id, routine_id, note')
    .maybeSingle();

  if (error) {
    return json(500, { error: { code: 'workout_routines update DB_ERROR', message: error.message } });
  }

  return json(200, mapper(data));
}

export async function DELETE(request: NextRequest, context: { params: Params }) {
  const { workoutRoutineId } = await Promise.resolve(context.params);
  const userId = await getAuthUserId(request);

  if (!userId) {
    return json(401, { error: { code: 'UNAUTHORIZED', message: 'missing or invalid token' } });
  }

  const supabase = getSupabaseAdmin();
  const { data: owner, error: ownerError } = await supabase
    .from('workout_routines')
    .select('id, workouts!inner(user_id)')
    .eq('id', workoutRoutineId)
    .eq('workouts.user_id', userId)
    .maybeSingle();

  if (ownerError) {
    return json(500, { error: { code: 'DB_ERROR', message: ownerError.message } });
  }

  if (!owner) {
    return json(404, { error: { code: 'NOT_FOUND', message: 'workout routine not found' } });
  }

  const { error } = await supabase.from('workout_routines').delete().eq('id', workoutRoutineId);

  if (error) {
    return json(500, { error: { code: 'DB_ERROR', message: error.message } });
  }

  return json(200, { ok: true });
}
