import { NextRequest, NextResponse } from 'next/server';

import { getAuthUserId, getSupabaseAdmin } from '@/shared/libs/supabase';
import { getCurrentMonthInfo } from '@/shared';
import { getMonthRange } from '@/shared/libs/api-route';

const json = (status: number, body: unknown) => NextResponse.json(body, { status });

type MonthReport = {
  month: string;
  workoutDays: number;
  workoutDates: string[];
  totalSets: number;
  maxConsecutiveWorkoutDays: number;
  goalWorkoutDays: number | null;
  goalAchievementRate: number | null;
  weightChange: number | null;
  skeletalMuscleMassChange: number | null;
  bodyFatMassChange: number | null;
};

type LineSeries = {
  id: string;
  name: string;
  data: { x: string; y: number | null }[];
};

export async function GET(request: NextRequest) {
  const userId = await getAuthUserId(request);

  if (!userId) {
    return json(401, { error: { code: 'UNAUTHORIZED', message: 'missing or invalid token' } });
  }

  try {
    const { year, month, weeksInMonth } = getCurrentMonthInfo();

    const reports = await getMonthlyReports(userId, `${year}-${month}`);
    const report = reports.find((item) => item.month === `${year}-${month}`);

    if (!report) {
      return json(200, []);
    }

    //현재는 목표 달성률 라인 차트만 반환, 표시
    const uniqueDates = Array.from(new Set(report.workoutDates));
    const weeklyCounts = Array.from({ length: weeksInMonth }, () => 0);

    uniqueDates.forEach((date) => {
      const day = Number(date.slice(8, 10));
      if (!Number.isFinite(day)) return;
      const weekIndex = Math.min(weeksInMonth, Math.ceil(day / 7));
      weeklyCounts[weekIndex - 1] += 1;
    });

    let cumulative = 0;
    const series: LineSeries[] = [
      {
        id: 'goalAchievementRate',
        name: '목표 달성률',
        data: weeklyCounts.map((count, index) => {
          cumulative += count;
          const goal = report.goalWorkoutDays ?? 0;
          const rate = goal > 0 ? Number(((cumulative / goal) * 100).toFixed(1)) : null;

          return {
            x: `${index + 1}주차`,
            y: rate,
          };
        }),
      },
    ];

    return json(200, series);
  } catch (error) {
    return json(500, {
      error: { code: 'DB_ERROR', message: error instanceof Error ? error.message : 'unknown error' },
    });
  }
}

async function getMonthlyReports(userId: string, date: string): Promise<MonthReport[]> {
  const supabase = getSupabaseAdmin();
  const { start, end } = getMonthRange(date);
  const { data: workouts, error: workoutsError } = await supabase
    .from('workouts')
    .select('id, workout_date')
    .eq('user_id', userId)
    .gte('workout_date', start)
    .lte('workout_date', end)
    .order('workout_date', { ascending: true });

  if (workoutsError) {
    throw new Error(workoutsError.message);
  }

  const { data: goals, error: goalsError } = await supabase
    .from('monthly_goals')
    .select('report_month, goal_workout_days')
    .eq('report_month', `${date}-01`)
    .eq('user_id', userId);

  if (goalsError) {
    throw new Error(goalsError.message);
  }

  const monthSet = new Set<string>();
  const workoutIds: string[] = [];
  const workoutDatesByMonth = new Map<string, string[]>();
  const workoutMonthById = new Map<string, string>();

  (workouts ?? []).forEach((workout) => {
    if (!workout?.workout_date) return;
    const month = workout.workout_date.slice(0, 7);
    monthSet.add(month);
    workoutIds.push(workout.id);
    workoutMonthById.set(workout.id, month);
    const list = workoutDatesByMonth.get(month) ?? [];
    list.push(workout.workout_date);
    workoutDatesByMonth.set(month, list);
  });

  (goals ?? []).forEach((goal) => {
    if (!goal?.report_month) return;
    monthSet.add(goal.report_month.slice(0, 7));
  });

  const totalSetsByMonth = new Map<string, number>();

  if (workoutIds.length) {
    const { data: workoutExercises, error: workoutExerciseError } = await supabase
      .from('workout_exercises')
      .select('id, workout_id')
      .in('workout_id', workoutIds);

    if (workoutExerciseError) {
      throw new Error(workoutExerciseError.message);
    }

    const workoutExerciseMonthById = new Map<string, string>();
    (workoutExercises ?? []).forEach((we) => {
      const month = workoutMonthById.get(we.workout_id);
      if (!month) return;
      workoutExerciseMonthById.set(we.id, month);
    });

    const workoutExerciseIds = workoutExercises?.map((we) => we.id) ?? [];
    if (workoutExerciseIds.length) {
      const { data: sets, error: setsError } = await supabase
        .from('sets')
        .select('id, workout_exercise_id')
        .in('workout_exercise_id', workoutExerciseIds);

      if (setsError) {
        throw new Error(setsError.message);
      }

      (sets ?? []).forEach((set) => {
        const month = workoutExerciseMonthById.get(set.workout_exercise_id);
        if (!month) return;
        totalSetsByMonth.set(month, (totalSetsByMonth.get(month) ?? 0) + 1);
      });
    }
  }

  const goalsByMonth = new Map<string, number>();
  (goals ?? []).forEach((goal) => {
    if (!goal?.report_month) return;
    const month = goal.report_month.slice(0, 7);
    if (Number.isFinite(goal.goal_workout_days)) {
      goalsByMonth.set(month, Number(goal.goal_workout_days));
    }
  });

  const reports: MonthReport[] = Array.from(monthSet)
    .sort()
    .map((month) => {
      const workoutDates = workoutDatesByMonth.get(month) ?? [];
      const workoutDays = workoutDates.length;
      const goalWorkoutDays = goalsByMonth.get(month) ?? null;
      const goalAchievementRate =
        goalWorkoutDays && goalWorkoutDays > 0 ? Number(((workoutDays / goalWorkoutDays) * 100).toFixed(1)) : null;

      return {
        month,
        workoutDays,
        workoutDates,
        totalSets: totalSetsByMonth.get(month) ?? 0,
        maxConsecutiveWorkoutDays: getMaxConsecutiveDays(workoutDates),
        goalWorkoutDays,
        goalAchievementRate,
        weightChange: null,
        skeletalMuscleMassChange: null,
        bodyFatMassChange: null,
      };
    })
    .sort((a, b) => (a.month < b.month ? 1 : -1));

  const currentMonth = new Date().toISOString().slice(0, 7);

  return reports.filter((report) => report.month <= currentMonth);
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
