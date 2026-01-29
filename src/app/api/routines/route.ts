import { NextRequest, NextResponse } from 'next/server';

import { getAuthUserId, getSupabaseAdmin } from '@/shared/libs/supabase';
import { randomUUID } from 'crypto';

const json = (status: number, body: unknown) => NextResponse.json(body, { status });

type RoutineItem = {
  id: string;
  exercise_id: string;
  item_order: number;
  set_count: number | null;
  exercise_catalogs: { name: string } | null;
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
    exerciseName: item.exercise_catalogs?.name ?? '',
    setCount: item.set_count ?? 1,
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
        exercise_id,
        item_order,
        exercise_catalogs ( name )
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
    return json(400, { error: { code: 'VALIDATION_ERROR', message: 'routineName is required' } });
  }

  const supabase = getSupabaseAdmin();
  const { data: routine, error: routineError } = await supabase
    .from('routines')
    .insert({ user_id: userId, name: body.routineName, id: randomUUID() })
    .select('id, name')
    .single();

  if (routineError) {
    return json(500, { error: { code: 'DB_ERROR', message: routineError.message } });
  }

  if (body.exercises.length) {
    const exerciseNames = body.exercises.map((exercise) => exercise.exerciseName as string);

    let nameToId = new Map<string, string>();

    if (exerciseNames.length) {
      const uniqueNames = Array.from(new Set(exerciseNames));
      const { data: existing, error: existingError } = await supabase
        .from('exercise_catalogs')
        .select('id, name')
        .eq('user_id', userId)
        .in('name', uniqueNames);

      if (existingError) {
        return json(500, { error: { code: 'DB_ERROR', message: existingError.message } });
      }

      const existingMap = new Map((existing ?? []).map((exercise) => [exercise.name, exercise.id]));
      const missingNames = uniqueNames.filter((name) => !existingMap.has(name));

      if (missingNames.length) {
        const { data: inserted, error: insertError } = await supabase
          .from('exercise_catalogs')
          .insert(missingNames.map((name) => ({ id: randomUUID(), user_id: userId, name })))
          .select('id, name');

        if (insertError) {
          return json(500, { error: { code: 'DB_ERROR', message: insertError.message } });
        }

        for (const exercise of inserted ?? []) {
          existingMap.set(exercise.name, exercise.id);
        }
      }

      nameToId = existingMap;
    }
    const items = body.exercises.map((exercise) => ({
      id: randomUUID(),
      routine_id: routine.id,
      exercise_id: nameToId.get(exercise.exerciseName ?? '') ?? '',
      exercise_name: exercise.exerciseName?.trim() || '',
      item_order: exercise.order || 0,
    }));

    const invalidExercise = items.find((item) => !item.exercise_id);

    if (invalidExercise) {
      return json(400, { error: { code: 'VALIDATION_ERROR', message: 'exerciseName is required' } });
    }

    const { error: itemsError } = await supabase.from('routine_items').insert(items);

    if (itemsError) {
      return json(500, { error: { code: 'DB_ERROR', message: itemsError.message } });
    }
  }

  return json(201, { routineId: routine.id, routineName: routine.name });
}
