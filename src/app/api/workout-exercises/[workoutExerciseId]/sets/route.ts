import { NextRequest } from 'next/server';
import { getAuthUserId, getSupabaseAdmin } from '@/shared/libs/supabase';
import { randomUUID } from 'crypto';
import { json } from '@/shared/libs/api-route';
import { TSetPayload } from '@routine-note/package-shared';

type Params = Promise<{ workoutExerciseId: string }>;

const mapSetResponse = (set: any) => {
  if (set.cardio_record_type && set.cardio_record_value) {
    return {
      id: set.id,
      type: set.cardio_record_type,
      value: set.cardio_record_value,
    } as TSetPayload;
  } else {
    return {
      id: set.id,
      weight: set.weight,
      reps: set.reps,
    } as TSetPayload;
  }
};
export async function POST(request: NextRequest, context: { params: Params }) {
  const userId = await getAuthUserId(request);

  if (!userId) {
    return json(401, { error: { code: 'UNAUTHORIZED', message: 'missing or invalid token' } });
  }

  const body = (await request.json()) as TSetPayload;

  const { workoutExerciseId } = await Promise.resolve(context.params);

  const supabase = getSupabaseAdmin();
  const { data: standalone, error: standaloneError } = await supabase
    .from('workout_standalone_exercises')
    .select('id, workouts!inner(user_id)')
    .eq('id', workoutExerciseId)
    .eq('workouts.user_id', userId)
    .maybeSingle();

  if (standaloneError) {
    return json(500, {
      error: { code: 'DB_ERROR', message: 'workout_standalone_exercises DB select:' + standaloneError.message },
    });
  }

  if (standalone) {
    const { data, error } = await supabase
      .from('sets')
      .insert({
        id: randomUUID(),
        workout_exercise_id: workoutExerciseId,
        weight: 'weight' in body ? body.weight : null,
        reps: 'reps' in body ? body.reps : null,
        cardio_record_type: 'type' in body ? body.type : null,
        cardio_record_value: 'value' in body ? body.value : null,
        type: 'STANDALONE_EXERCISE',
        created_at: new Date(),
      })
      .select('id, weight, reps,cardio_record_type,cardio_record_value')
      .single();

    if (error) {
      return json(500, { error: { code: 'DB_ERROR', message: 'sets DB insert :' + error.message } });
    }

    return json(201, mapSetResponse(data));
  } else {
    const { data: routineExercise, error: rouineItemsDataError } = await supabase
      .from('workout_routine_items')
      .select('id, workout_routines!inner(workout_id, workouts!inner(user_id))')
      .eq('id', workoutExerciseId)
      .eq('workout_routines.workouts.user_id', userId)
      .maybeSingle();

    if (rouineItemsDataError) {
      return json(500, {
        error: { code: 'DB_ERROR', message: 'workout_routine_items DB select' + rouineItemsDataError.message },
      });
    }
    if (!routineExercise) {
      return json(404, { error: { code: 'NOT_FOUND', message: 'workout routine item not found' } });
    }
    const { data, error } = await supabase
      .from('sets')
      .insert({
        id: randomUUID(),
        workout_routine_item_id: workoutExerciseId,
        weight: 'weight' in body ? body.weight : null,
        reps: 'reps' in body ? body.reps : null,
        cardio_record_type: 'type' in body ? body.type : null,
        cardio_record_value: 'value' in body ? body.value : null,
        type: 'ROUTINE_EXERCISE',
        created_at: new Date(),
      })
      .select('id, weight, reps,cardio_record_type,cardio_record_value')
      .single();

    if (error) {
      return json(500, { error: { code: 'DB_ERROR', message: 'sets DB insert' + error.message } });
    }

    return json(201, mapSetResponse(data));
  }
}
