import { NextRequest, NextResponse } from 'next/server';

import { getAuthUserId, getSupabaseAdmin } from '@/shared/libs/supabase';

const json = (status: number, body: unknown) => NextResponse.json(body, { status });

export async function GET(request: NextRequest) {
  const userId = await getAuthUserId(request);
  const month = request.nextUrl.searchParams.get('month');

  if (!userId) {
    return json(401, { error: { code: 'UNAUTHORIZED', message: 'missing or invalid token' } });
  }

  if (!month) {
    return json(400, { error: { code: 'VALIDATION_ERROR', message: 'month is required' } });
  }

  const [yearText, monthText] = month.split('-');
  const yearNumber = Number(yearText);
  const monthNumber = Number(monthText);
  if (!Number.isInteger(yearNumber) || !Number.isInteger(monthNumber) || monthNumber < 1 || monthNumber > 12) {
    return json(400, { error: { code: 'VALIDATION_ERROR', message: 'month must be in YYYY-MM format' } });
  }

  const start = `${month}-01`;
  const end = new Date(Date.UTC(yearNumber, monthNumber, 0)).toISOString().slice(0, 10);

  const supabase = getSupabaseAdmin();
  const { data: goal, error: goalError } = await supabase
    .from('monthly_goals')
    .select('goal_workout_days')
    .eq('user_id', userId)
    .eq('report_month', start)
    .maybeSingle();

  if (goalError) {
    return json(500, { error: { code: 'DB_ERROR', message: goalError.message } });
  }

  const { data: workouts, error: workoutsError } = await supabase
    .from('workouts')
    .select('id, workout_date')
    .eq('user_id', userId)
    .gte('workout_date', start)
    .lte('workout_date', end);

  if (workoutsError) {
    return json(500, { error: { code: 'DB_ERROR', message: workoutsError.message } });
  }

  const workoutIds = workouts?.map((workout) => workout.id) ?? [];
  const workoutDays = workouts?.length ?? 0;
  const workoutDates = workouts?.map((workout) => workout.workout_date).filter(Boolean) ?? [];
  const maxConsecutiveWorkoutDays = getMaxConsecutiveDays(workoutDates);
  const goalWorkoutDays = goal?.goal_workout_days ?? null;
  const goalAchievementRate =
    goalWorkoutDays && goalWorkoutDays > 0 ? Number(((workoutDays / goalWorkoutDays) * 100).toFixed(1)) : null;

  let totalSets = 0;
  if (workoutIds.length) {
    const { data: workoutExercises, error: weError } = await supabase
      .from('workout_exercises')
      .select('id')
      .in('workout_id', workoutIds);

    if (weError) {
      return json(500, { error: { code: 'DB_ERROR', message: weError.message } });
    }

    const workoutExerciseIds = workoutExercises?.map((we) => we.id) ?? [];

    if (workoutExerciseIds.length) {
      const { count, error: setsError } = await supabase
        .from('sets')
        .select('id', { count: 'exact', head: true })
        .in('workout_exercise_id', workoutExerciseIds);

      if (setsError) {
        return json(500, { error: { code: 'DB_ERROR', message: setsError.message } });
      }

      totalSets = count ?? 0;
    }
  }

  const { data: inbody, error: inbodyError } = await supabase
    .from('inbody_records')
    .select('measured_at, weight, skeletal_muscle_mass, body_fat_mass')
    .eq('user_id', userId)
    .gte('measured_at', start)
    .lte('measured_at', end)
    .order('measured_at', { ascending: true });

  if (inbodyError) {
    return json(500, { error: { code: 'DB_ERROR', message: inbodyError.message } });
  }

  const inbodyList = inbody ?? [];
  const first = inbodyList[0];
  const last = inbodyList[inbodyList.length - 1];

  const weightChange = first && last ? Number(last.weight ?? 0) - Number(first.weight ?? 0) : null;
  const skeletalMuscleMassChange =
    first && last ? Number(last.skeletal_muscle_mass ?? 0) - Number(first.skeletal_muscle_mass ?? 0) : null;
  const bodyFatMassChange = first && last ? Number(last.body_fat_mass ?? 0) - Number(first.body_fat_mass ?? 0) : null;

  return json(200, {
    month,
    workoutDays,
    totalSets,
    maxConsecutiveWorkoutDays,
    goalWorkoutDays,
    goalAchievementRate,
    weightChange,
    skeletalMuscleMassChange,
    bodyFatMassChange,
    workoutDates,
  });
}

function getMaxConsecutiveDays(dates: string[]) {
  if (!dates.length) return 0;

  const uniqueDates = Array.from(new Set(dates));
  const dayNumbers = uniqueDates
    .map((date) => Date.parse(`${date}T00:00:00Z`))
    .filter((value) => Number.isFinite(value))
    .sort((a, b) => a - b)
    .map((value) => Math.floor(value / 86400000));

  if (!dayNumbers.length) return 0;

  let maxStreak = 1;
  let currentStreak = 1;

  for (let i = 1; i < dayNumbers.length; i += 1) {
    if (dayNumbers[i] - dayNumbers[i - 1] === 1) {
      currentStreak += 1;
    } else {
      currentStreak = 1;
    }
    if (currentStreak > maxStreak) {
      maxStreak = currentStreak;
    }
  }

  return maxStreak;
}
