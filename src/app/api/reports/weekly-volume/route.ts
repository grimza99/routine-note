import { NextRequest } from 'next/server';
import { getAuthUserId, getSupabaseAdmin } from '@/shared/libs/supabase';
import { getCurrentWeekRange, getDayLabel, json } from '@/shared/libs/api-route';

type WeeklyVolumeItem = {
  day: string;
  volume: number;
};

export async function GET(request: NextRequest) {
  const userId = await getAuthUserId(request);

  if (!userId) {
    return json(401, { error: { code: 'UNAUTHORIZED', message: 'missing or invalid token' } });
  }

  const { startDate, endDate, start, end } = getCurrentWeekRange();
  const supabase = getSupabaseAdmin();

  const { data: workouts, error: workoutsError } = await supabase
    .from('workouts')
    .select('id, workout_date')
    .eq('user_id', userId)
    .gte('workout_date', start)
    .lte('workout_date', end);

  if (workoutsError) {
    return json(500, { error: { code: 'DB_ERROR', message: workoutsError.message } });
  }

  const workoutIdByDate = new Map<string, string>();
  const workoutIds = (workouts ?? []).map((workout) => {
    if (workout?.workout_date) {
      workoutIdByDate.set(workout.id, workout.workout_date);
    }
    return workout.id;
  });

  if (!workoutIds.length) {
    return json(200, buildWeeklyVolumes(startDate, endDate, new Map()));
  }

  const { data: workoutExercises, error: workoutExercisesError } = await supabase
    .from('workout_exercises')
    .select('id, workout_id')
    .in('workout_id', workoutIds);

  if (workoutExercisesError) {
    return json(500, { error: { code: 'DB_ERROR', message: `workout_exercises : ${workoutExercisesError.message}` } });
  }
  const { data: routineItems, error: routineItemsError } = await supabase
    .from('workout_routine_items')
    .select('id, workout_id')
    .in('workout_id', workoutIds);

  if (routineItemsError) {
    return json(500, { error: { code: 'DB_ERROR', message: `workout_routine_items : ${routineItemsError.message}` } });
  }

  const workoutIdByExerciseId = new Map<string, string>();
  (workoutExercises ?? []).forEach((exercise) => {
    workoutIdByExerciseId.set(exercise.id, exercise.workout_id);
  });

  const workoutIdByRoutineItemId = new Map<string, string>();
  (routineItems ?? []).forEach((item) => {
    workoutIdByRoutineItemId.set(item.id, item.workout_id);
  });

  const workoutExerciseIds = workoutExercises?.map((exercise) => exercise.id) ?? [];
  const routineItemIds = routineItems?.map((item) => item.id) ?? [];

  if (!workoutExerciseIds.length && !routineItemIds.length) {
    return json(200, buildWeeklyVolumes(startDate, endDate, new Map()));
  }

  const { data: sets, error: setsError } = await supabase
    .from('sets')
    .select('weight, reps, workout_exercise_id, workout_routine_item_id, type')
    .or(
      `workout_exercise_id.in.(${workoutExerciseIds.join(',')}),workout_routine_item_id.in.(${routineItemIds.join(',')})`,
    );

  if (setsError) {
    return json(500, { error: { code: 'DB_ERROR', message: setsError.message } });
  }
  const dailyVolume = new Map<string, number>();
  (sets ?? []).forEach((set) => {
    const workoutId =
      set.type === 'ROUTINE_EXERCISE'
        ? workoutIdByRoutineItemId.get(set.workout_routine_item_id!)
        : workoutIdByExerciseId.get(set.workout_exercise_id!);
    const workoutDate = workoutId ? workoutIdByDate.get(workoutId) : null;

    if (!workoutDate) return;
    const weight = Number(set.weight ?? 0);
    const reps = Number(set.reps ?? 0);
    const volume = weight * reps;
    dailyVolume.set(workoutDate, (dailyVolume.get(workoutDate) ?? 0) + volume);
  });

  return json(200, buildWeeklyVolumes(startDate, endDate, dailyVolume));
}

function buildWeeklyVolumes(startDate: Date, endDate: Date, dailyVolume: Map<string, number>) {
  const result: WeeklyVolumeItem[] = [];
  const cursor = new Date(startDate);

  while (cursor <= endDate) {
    const key = cursor.toISOString().slice(0, 10);
    result.push({
      day: getDayLabel(cursor),
      volume: dailyVolume.get(key) ?? 0,
    });
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }

  return result;
}
