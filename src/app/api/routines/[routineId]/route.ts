import { NextRequest } from 'next/server';
import { getAuthUserId, getSupabaseAdmin } from '@/shared/libs/supabase';
import { json } from '@/shared/libs/api-route';
import { IRoutine, RoutinePayload, TTraining } from '@routine-note/package-shared';
import { randomUUID } from 'crypto';

type Params = Promise<{ routineId?: string }>;

type RoutineItem = {
  id: string;
  item_order: number;
  name?: string;
  training_type: TTraining;
};

type DBRoutineResponse = {
  id: string;
  name: string;
  routine_items: RoutineItem[] | null;
};

const mapRoutine = (routine: DBRoutineResponse): IRoutine => ({
  routineId: routine.id,
  name: routine.name,
  exercises: (routine.routine_items ?? []).map((ex) => ({
    id: ex.id,
    order: ex.item_order,
    name: ex.name ?? '',
    trainingType: ex.training_type,
  })),
});

//------------------ GET /api/routines?routineId='' -detail routine --------------------------------------------

export async function GET(request: NextRequest, context: { params: Params }) {
  const userId = await getAuthUserId(request);

  if (!userId) {
    return json(401, { error: { code: 'UNAUTHORIZED', message: 'missing or invalid token' } });
  }

  const params = await Promise.resolve(context.params);
  const routineId = params?.routineId;

  if (!routineId) {
    return json(400, { error: { code: 'VALIDATION_ERROR', message: 'routineId is invalid' } });
  }

  const supabase = getSupabaseAdmin();
  const routineSelect: string = `
      id,
      name,
      routine_items (
        id,
        item_order,
        name,
        training_type
      )
      `;

  const { data, error } = await supabase
    .from('routines')
    .select(routineSelect)
    .eq('id', routineId)
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    return json(500, { error: { code: 'DB_ERROR', message: error.message } });
  }

  if (!data) {
    return json(404, { error: { code: 'NOT_FOUND', message: 'routine not found' } });
  }

  return json(200, mapRoutine(data as unknown as DBRoutineResponse));
}

//------------------ PATCH /api/routines?routineId='' - routine 수정 --------------------------------------------

export async function PATCH(request: NextRequest, context: { params: Params }) {
  const userId = await getAuthUserId(request);

  if (!userId) {
    return json(401, { error: { code: 'UNAUTHORIZED', message: 'missing or invalid token' } });
  }

  const params = await Promise.resolve(context.params);
  const routineId = params?.routineId;

  if (!routineId) {
    return json(400, { error: { code: 'VALIDATION_ERROR', message: 'routineId is invalid' } });
  }

  const body = (await request.json()) as RoutinePayload;

  const routineName = body.name;
  const exercises = body.exercises;

  if (!routineName && !exercises) {
    return json(400, { error: { code: 'VALIDATION_ERROR', message: 'routineName or exercises is required' } });
  }

  const supabase = getSupabaseAdmin();
  const { error: prevRoutineUpdateError } = await supabase
    .from('routines')
    .update({ updated_at: new Date() })
    .eq('id', routineId)
    .eq('user_id', userId)
    .select('id, name')
    .maybeSingle();

  if (prevRoutineUpdateError) {
    return json(500, { error: { code: 'routines DB_ERROR', message: prevRoutineUpdateError.message } });
  }

  const { data: routine, error: routineError } = await supabase
    .from('routines')
    .insert({ user_id: userId, name: routineName, id: randomUUID() })
    .select('id, name')
    .single();

  if (routineError) {
    return json(500, { error: { code: 'routines DB_ERROR', message: routineError.message } });
  }

  if (!routine) {
    return json(404, { error: { code: 'NOT_FOUND', message: 'routine not found' } });
  }

  const items = exercises.map((ex) => ({
    id: randomUUID(),
    routine_id: routine.id,
    item_order: ex.order,
    name: ex.name,
    training_type: ex.trainingType,
  }));

  const invalidExercise = items.find((item) => !item.name);

  if (invalidExercise) {
    return json(400, { error: { code: 'VALIDATION_ERROR', message: 'exerciseName is required' } });
  }

  const { error: insertError } = await supabase.from('routine_items').insert(items);

  if (insertError) {
    return json(500, { error: { code: 'routine_items table insert DB_ERROR', message: insertError.message } });
  }

  return json(200, { routineId: routine.id, routineName: routine.name });
}

export async function DELETE(request: NextRequest, context: { params: Params }) {
  const userId = await getAuthUserId(request);

  if (!userId) {
    return json(401, { error: { code: 'UNAUTHORIZED', message: 'missing or invalid token' } });
  }

  const params = await Promise.resolve(context.params);
  const routineId = params?.routineId;

  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(routineId ?? '');

  if (!routineId || !isUuid) {
    return json(400, { error: { code: 'VALIDATION_ERROR', message: 'routineId is invalid' } });
  }

  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from('routines')
    .update({ deleted_at: new Date() })
    .eq('id', routineId)
    .eq('user_id', userId);

  if (error) {
    return json(500, { error: { code: 'DB_ERROR', message: error.message } });
  }

  return json(200, { ok: true });
}
