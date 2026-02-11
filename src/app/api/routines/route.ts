import { NextRequest, NextResponse } from 'next/server';

import { getAuthUserId, getSupabaseAdmin } from '@/shared/libs/supabase';
import { randomUUID } from 'crypto';

const json = (status: number, body: unknown) => NextResponse.json(body, { status });

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
  exerciseName?: string;
  order?: number;
};

const mapRoutine = (routine: RoutineResponse) => ({
  routineId: routine.id,
  routineName: routine.name,
  exercises: (routine.routine_items ?? []).map((item) => ({
    id: item.id,
    exerciseId: item.exercise_id,
    order: item.item_order,
    exerciseName: item?.exercise_name ?? '',
  })),
});

const isRoutineResponse = (value: unknown): value is RoutineResponse => {
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
        exercise_id,
        item_order,
        exercise_name
      )
      `;

  const { data, error } = await supabase
    .from('routines')
    .select(routineSelect)
    .eq('user_id', userId)
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

  const body = (await request.json()) as {
    routineName?: string;
    exercises?: RoutineExerciseRequest[];
  };

  if (!body.routineName || !body.exercises || body.exercises.length === 0) {
    return json(400, { error: { code: 'VALIDATION_ERROR', message: 'routineName &exercises is required' } });
  }
  const isDuplicateExerciseNames =
    body.exercises.length !== new Set(body.exercises.map((ex) => ex.exerciseName?.trim())).size;

  if (isDuplicateExerciseNames) {
    return json(400, { error: { code: 'VALIDATION_ERROR', message: '중복된 운동 이름이 있습니다.' } });
  }

  const supabase = getSupabaseAdmin();

  const { data: existingRoutine, error } = await supabase.from('routines').select('id, name').eq('user_id', userId);

  if (error) {
    return json(500, { error: { code: 'DB_ERROR', message: error.message } });
  }

  // check duplicate routine name
  const duplicateRoutine = existingRoutine?.find((routine) => routine.name === body.routineName);

  if (duplicateRoutine) {
    return json(409, { error: { code: 'CONFLICT', message: '중복된 루틴 이름 입니다.' } });
  }

  const { data: routine, error: routineError } = await supabase
    .from('routines')
    .insert({ user_id: userId, name: body.routineName, id: randomUUID() })
    .select('id, name')
    .single();

  if (routineError) {
    return json(500, { error: { code: 'routines DB_ERROR', message: routineError.message } });
  }

  if (body.exercises.length) {
    const items = body.exercises.map((exercise, index) => ({
      id: randomUUID(),
      routine_id: routine.id,
      exercise_id: randomUUID(),
      item_order: Number(exercise.order) > 0 ? Number(exercise.order) : index + 1,
      exercise_name: exercise.exerciseName?.trim(),
    }));

    const invalidExercise = items.find((item) => !item.exercise_name);

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

  return json(201, { routineId: routine.id, routineName: routine.name });
}
