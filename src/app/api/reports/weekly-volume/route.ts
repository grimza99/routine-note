import { NextRequest, NextResponse } from "next/server";

import { getAuthUserId, getSupabaseAdmin } from "@/shared/libs/supabase";

const json = (status: number, body: unknown) => NextResponse.json(body, { status });

type WeeklyVolumeItem = {
  week: string;
  volume: number;
};

export async function GET(request: NextRequest) {
  const userId = await getAuthUserId(request);
  const month = request.nextUrl.searchParams.get("month");

  if (!userId) {
    return json(401, { error: { code: "UNAUTHORIZED", message: "missing or invalid token" } });
  }

  if (!month) {
    return json(400, { error: { code: "VALIDATION_ERROR", message: "month is required" } });
  }

  const range = getMonthRange(month);
  if (!range) {
    return json(400, { error: { code: "VALIDATION_ERROR", message: "month must be in YYYY-MM format" } });
  }

  const { startDate, endDate, start, end } = range;
  const supabase = getSupabaseAdmin();

  const { data: workouts, error: workoutsError } = await supabase
    .from("workouts")
    .select("id, workout_date")
    .eq("user_id", userId)
    .gte("workout_date", start)
    .lte("workout_date", end);

  if (workoutsError) {
    return json(500, { error: { code: "DB_ERROR", message: workoutsError.message } });
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
    .from("workout_exercises")
    .select("id, workout_id")
    .in("workout_id", workoutIds);

  if (workoutExercisesError) {
    return json(500, { error: { code: "DB_ERROR", message: workoutExercisesError.message } });
  }

  const workoutIdByExerciseId = new Map<string, string>();
  (workoutExercises ?? []).forEach((exercise) => {
    workoutIdByExerciseId.set(exercise.id, exercise.workout_id);
  });

  const workoutExerciseIds = workoutExercises?.map((exercise) => exercise.id) ?? [];
  if (!workoutExerciseIds.length) {
    return json(200, buildWeeklyVolumes(startDate, endDate, new Map()));
  }

  const { data: sets, error: setsError } = await supabase
    .from("sets")
    .select("weight, reps, workout_exercise_id")
    .in("workout_exercise_id", workoutExerciseIds);

  if (setsError) {
    return json(500, { error: { code: "DB_ERROR", message: setsError.message } });
  }

  const dailyVolume = new Map<string, number>();
  (sets ?? []).forEach((set) => {
    const workoutId = workoutIdByExerciseId.get(set.workout_exercise_id);
    const workoutDate = workoutId ? workoutIdByDate.get(workoutId) : null;
    if (!workoutDate) return;
    const weight = Number(set.weight ?? 0);
    const reps = Number(set.reps ?? 0);
    const volume = weight * reps;
    dailyVolume.set(workoutDate, (dailyVolume.get(workoutDate) ?? 0) + volume);
  });

  return json(200, buildWeeklyVolumes(startDate, endDate, dailyVolume));
}

function getMonthRange(month: string) {
  const [yearText, monthText] = month.split("-");
  const yearNumber = Number(yearText);
  const monthNumber = Number(monthText);
  if (!Number.isInteger(yearNumber) || !Number.isInteger(monthNumber) || monthNumber < 1 || monthNumber > 12) {
    return null;
  }
  const startDate = new Date(Date.UTC(yearNumber, monthNumber - 1, 1));
  const endDate = new Date(Date.UTC(yearNumber, monthNumber, 0));
  const start = `${month}-01`;
  const end = endDate.toISOString().slice(0, 10);
  return { startDate, endDate, start, end };
}

function buildWeeklyVolumes(startDate: Date, endDate: Date, dailyVolume: Map<string, number>) {
  const result: WeeklyVolumeItem[] = [];
  const cursor = new Date(startDate);
  cursor.setUTCDate(cursor.getUTCDate() - getWeekdayOffset(cursor));

  while (cursor <= endDate) {
    const weekStart = new Date(cursor);
    const weekEnd = new Date(cursor);
    weekEnd.setUTCDate(weekEnd.getUTCDate() + 6);

    let volume = 0;
    const dayCursor = new Date(weekStart);
    while (dayCursor <= weekEnd) {
      const key = dayCursor.toISOString().slice(0, 10);
      if (dayCursor >= startDate && dayCursor <= endDate) {
        volume += dailyVolume.get(key) ?? 0;
      }
      dayCursor.setUTCDate(dayCursor.getUTCDate() + 1);
    }

    result.push({
      week: `${weekStart.toISOString().slice(0, 10)}~${weekEnd.toISOString().slice(0, 10)}`,
      volume,
    });

    cursor.setUTCDate(cursor.getUTCDate() + 7);
  }

  return result;
}

function getWeekdayOffset(date: Date) {
  const day = date.getUTCDay();
  return day === 0 ? 6 : day - 1;
}
