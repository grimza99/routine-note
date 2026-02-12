import { randomUUID } from 'crypto';
import { NextRequest } from 'next/server';
import { getAuthUserId, getSupabaseAdmin } from '@/shared/libs/supabase';
import { json } from '@/shared/libs/api-route';

type Params = Promise<{ routineId?: string }>;

type RoutineItem = {
  id: string;
  exercise_id: string;
  item_order: number;
  exercise_name?: string;
};

type RoutineResponse = {
  id: string;
  name: string;
  routine_items: RoutineItem[] | null;
};

type RoutineExerciseRequest = {
  exerciseId?: string;
  exerciseName?: string;
  order?: number;
  setCount?: number;
};

const mapRoutine = (routine: RoutineResponse) => ({
  routineId: routine.id,
  routineName: routine.name,
  exercises: (routine.routine_items ?? []).map((item) => ({
    id: item.id,
    exerciseId: item.exercise_id,
    order: item.item_order,
    exerciseName: item.exercise_name ?? '',
  })),
});

const parseExercises = (items?: RoutineExerciseRequest[]) =>
  (items ?? []).map((item, index) => ({
    exerciseId: item.exerciseId,
    exerciseName: item.exerciseName?.trim(),
    order: Number(item.order) > 0 ? Number(item.order) : index + 1,
  }));

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
        exercise_id,
        item_order,
        exercise_name
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

  return json(200, mapRoutine(data as unknown as RoutineResponse));
}

interface RoutinePayload {
  routineName?: string;
  exercises?: RoutineExerciseRequest[];
}

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

  const routineName = body.routineName;
  const exercises = body.exercises;

  if (!routineName && !exercises) {
    return json(400, { error: { code: 'VALIDATION_ERROR', message: 'routineName or exercises is required' } });
  }

  const supabase = getSupabaseAdmin();
  const { data: routine, error: routineError } = await supabase
    .from('routines')
    .update({ name: routineName })
    .eq('id', routineId)
    .eq('user_id', userId)
    .select('id, name')
    .maybeSingle();

  if (routineError) {
    return json(500, { error: { code: 'DB_ERROR', message: routineError.message } });
  }

  if (!routine) {
    return json(404, { error: { code: 'NOT_FOUND', message: 'routine not found' } });
  }

  const { error: deleteError } = await supabase.from('routine_items').delete().eq('routine_id', routineId);

  if (deleteError) {
    return json(500, { error: { code: 'DB_ERROR', message: deleteError.message } });
  }

  const parsedExercises = parseExercises(exercises);
  const items = parsedExercises.map((exercise) => ({
    id: randomUUID(),
    routine_id: routineId,
    exercise_id: exercise.exerciseId ?? randomUUID(),
    item_order: exercise.order,
    exercise_name: exercise.exerciseName,
  }));

  const invalidExercise = items.find((item) => !item.exercise_name);

  if (invalidExercise) {
    return json(400, { error: { code: 'VALIDATION_ERROR', message: 'exerciseName is required' } });
  }

  const { error: insertError } = await supabase.from('routine_items').insert(items);

  if (insertError) {
    return json(500, { error: { code: 'DB_ERROR', message: insertError.message } });
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
  const { error } = await supabase.from('routines').delete().eq('id', routineId).eq('user_id', userId);

  if (error) {
    return json(500, { error: { code: 'DB_ERROR', message: error.message } });
  }

  return json(200, { ok: true });
}
