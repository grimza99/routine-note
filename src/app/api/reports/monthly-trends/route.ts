import { NextRequest, NextResponse } from "next/server";

import { getAuthUserId, getSupabaseAdmin } from "@/shared/libs/supabase";

const json = (status: number, body: unknown) => NextResponse.json(body, { status });

type MonthReport = {
  month: string;
  workoutDays: number;
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
  data: { x: string; y: number | null }[];
};

export async function GET(request: NextRequest) {
  const userId = await getAuthUserId(request);

  if (!userId) {
    return json(401, { error: { code: "UNAUTHORIZED", message: "missing or invalid token" } });
  }

  try {
    const reports = await getMonthlyReports(userId);
    const sortedReports = reports.sort((a, b) => a.month.localeCompare(b.month));

    const metricMap = [{ id: "goalAchievementRate", accessor: (report: MonthReport) => report.goalAchievementRate }];

    const series: LineSeries[] = metricMap.map((metric) => ({
      id: metric.id,
      data: sortedReports.map((report) => ({
        x: report.month,
        y: metric.accessor(report),
      })),
    }));

    return json(200, series);
  } catch (error) {
    return json(500, {
      error: { code: "DB_ERROR", message: error instanceof Error ? error.message : "unknown error" },
    });
  }
}

async function getMonthlyReports(userId: string) {
  const supabase = getSupabaseAdmin();
  const { data: workouts, error: workoutsError } = await supabase
    .from("workouts")
    .select("id, workout_date")
    .eq("user_id", userId)
    .order("workout_date", { ascending: true });

  if (workoutsError) {
    throw new Error(workoutsError.message);
  }

  const { data: goals, error: goalsError } = await supabase
    .from("monthly_goals")
    .select("report_month, goal_workout_days")
    .eq("user_id", userId);

  if (goalsError) {
    throw new Error(goalsError.message);
  }

  const { data: inbody, error: inbodyError } = await supabase
    .from("inbody_records")
    .select("measured_at, weight, skeletal_muscle_mass, body_fat_mass")
    .eq("user_id", userId)
    .order("measured_at", { ascending: true });

  if (inbodyError) {
    throw new Error(inbodyError.message);
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

  const inbodyByMonth = new Map<string, (typeof inbody)[number][]>();
  (inbody ?? []).forEach((record) => {
    if (!record?.measured_at) return;
    const month = record.measured_at.slice(0, 7);
    monthSet.add(month);
    const list = inbodyByMonth.get(month) ?? [];
    list.push(record);
    inbodyByMonth.set(month, list);
  });

  const totalSetsByMonth = new Map<string, number>();

  if (workoutIds.length) {
    const { data: workoutExercises, error: workoutExerciseError } = await supabase
      .from("workout_exercises")
      .select("id, workout_id")
      .in("workout_id", workoutIds);

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
        .from("sets")
        .select("id, workout_exercise_id")
        .in("workout_exercise_id", workoutExerciseIds);

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
        goalWorkoutDays && goalWorkoutDays > 0
          ? Number(((workoutDays / goalWorkoutDays) * 100).toFixed(1))
          : null;
      const inbodyList = inbodyByMonth.get(month) ?? [];
      const first = inbodyList[0];
      const last = inbodyList[inbodyList.length - 1];

      return {
        month,
        workoutDays,
        totalSets: totalSetsByMonth.get(month) ?? 0,
        maxConsecutiveWorkoutDays: getMaxConsecutiveDays(workoutDates),
        goalWorkoutDays,
        goalAchievementRate,
        weightChange: first && last ? Number(last.weight ?? 0) - Number(first.weight ?? 0) : null,
        skeletalMuscleMassChange:
          first && last ? Number(last.skeletal_muscle_mass ?? 0) - Number(first.skeletal_muscle_mass ?? 0) : null,
        bodyFatMassChange:
          first && last ? Number(last.body_fat_mass ?? 0) - Number(first.body_fat_mass ?? 0) : null,
      };
    })
    .sort((a, b) => (a.month < b.month ? 1 : -1));

  const currentMonth = new Date().toISOString().slice(0, 7);
  return reports.filter((report) => report.month < currentMonth);
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
