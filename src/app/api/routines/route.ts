import { NextRequest } from 'next/server';
import { IRoutine, RoutinePayload, TTraining } from '@routine-note/package-shared';
import { randomUUID } from 'crypto';

import { getAuthUserId, getSupabaseAdmin } from '@/shared/libs/supabase';
import { json } from '@/shared/libs/api-route';

type IDBExercise = {
  id: string;
  name: string;
  training_type: TTraining;
};

type RoutineDBResponse = {
  id: string;
  name: string;
  routine_items: IDBExercise[] | null;
};

const mapRoutine = (routine: RoutineDBResponse): IRoutine => ({
  routineId: routine.id,
  name: routine.name,
  exercises: (routine.routine_items ?? []).map((item) => ({
    id: item.id,
    name: item?.name ?? '',
    trainingType: item.training_type,
  })),
});

const isRoutineResponse = (value: unknown): value is RoutineDBResponse => {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as {
    id?: unknown;
    name?: unknown;
    routine_items?: unknown;
  };

  if (typeof candidate.id !== 'string' || typeof candidate.name !== 'string') {
    return false;
  }

  if (candidate.routine_items === null || candidate.routine_items === undefined) {
    return true;
  }

  return Array.isArray(candidate.routine_items);
};

//------------------ GET /api/routines -routines list
export async function GET(request: NextRequest) {
  const userId = await getAuthUserId(request);

  if (!userId) {
    return json(401, { error: { code: 'UNAUTHORIZED', message: 'missing or invalid token' } });
  }

  const supabase = getSupabaseAdmin();
  const routineSelect: string = `
      id,
      name,
      routine_items (
        id,
        routine_id,
        item_order,
        name,
        training_type
      )
      `;

  const { data, error } = await supabase
    .from('routines')
    .select(routineSelect)
    .eq('user_id', userId)
    .is('deleted_at', null)
    .is('updated_at', null)
    .order('created_at', { ascending: false });

  if (error) {
    return json(500, { error: { code: 'DB_ERROR', message: error.message } });
  }

  const routineRows: unknown[] = Array.isArray(data) ? data : [];
  const routines = routineRows.filter(isRoutineResponse).map((routine) => mapRoutine(routine));

  return json(200, routines);
}

// ---------------------------------POST /api/routines -create routine

export async function POST(request: NextRequest) {
  const userId = await getAuthUserId(request);

  if (!userId) {
    return json(401, { error: { code: 'UNAUTHORIZED', message: 'missing or invalid token' } });
  }

  const body = (await request.json()) as RoutinePayload;

  if (!body.name || !body.exercises || body.exercises.length === 0) {
    return json(400, { error: { code: 'VALIDATION_ERROR', message: '루틴이름과 운동은 필수로 입력해야 합니다.' } });
  }
  const isDuplicateExerciseNames = body.exercises.length !== new Set(body.exercises.map((ex) => ex.name?.trim())).size;

  if (isDuplicateExerciseNames) {
    return json(400, { error: { code: 'VALIDATION_ERROR', message: '중복된 운동 이름이 있습니다.' } });
  }

  const supabase = getSupabaseAdmin();

  const { data: existingRoutine, error } = await supabase.from('routines').select('id, name').eq('user_id', userId);

  if (error) {
    return json(500, { error: { code: 'DB_ERROR', message: error.message } });
  }

  // check duplicate routine name
  const routine_name = body.name.trim();

  const duplicateRoutine = existingRoutine?.find((routine) => routine.name === routine_name);

  if (duplicateRoutine) {
    return json(409, { error: { code: 'CONFLICT', message: '중복된 루틴 이름 입니다.' } });
  }

  const { data: routine, error: routineError } = await supabase
    .from('routines')
    .insert({ user_id: userId, name: routine_name, id: randomUUID() })
    .select('id, name')
    .single();

  if (routineError) {
    return json(500, { error: { code: 'routines DB_ERROR', message: routineError.message } });
  }

  if (body.exercises.length) {
    const items = body.exercises.map((exercise, index) => ({
      id: randomUUID(),
      routine_id: routine.id,
      item_order: Number(exercise.order) > 0 ? Number(exercise.order) : index + 1,
      name: exercise.name?.trim(),
      training_type: exercise.trainingType,
    }));

    const invalidExercise = items.find((item) => !item.name);

    if (invalidExercise) {
      return json(400, {
        error: { code: 'VALIDATION_ERROR', message: 'exerciseName is required' },
      });
    }

    const { error: itemsError } = await supabase.from('routine_items').insert(items);

    if (itemsError) {
      return json(500, { error: { code: 'DB_ERROR', message: itemsError.message } });
    }
  }

  return json(201, { routineId: routine.id, name: routine.name });
}
