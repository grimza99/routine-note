import { NextRequest, NextResponse } from "next/server";

import { getAuthUserId, getSupabaseAdmin } from "@/shared/libs/supabase";

const json = (status: number, body: unknown) => NextResponse.json(body, { status });

type WeeklyVolumeItem = {
  day: string;
  volume: number;
};

export async function GET(request: NextRequest) {
  const userId = await getAuthUserId(request);

  if (!userId) {
    return json(401, { error: { code: "UNAUTHORIZED", message: "missing or invalid token" } });
  }

  const { startDate, endDate, start, end } = getCurrentWeekRange();
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

function getCurrentWeekRange() {
  const today = new Date();
  const startDate = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));
  startDate.setUTCDate(startDate.getUTCDate() - getWeekdayOffset(startDate));
  const endDate = new Date(startDate);
  endDate.setUTCDate(endDate.getUTCDate() + 6);
  const start = startDate.toISOString().slice(0, 10);
  const end = endDate.toISOString().slice(0, 10);
  return { startDate, endDate, start, end };
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

function getWeekdayOffset(date: Date) {
  const day = date.getUTCDay();
  return day === 0 ? 6 : day - 1;
}

function getDayLabel(date: Date) {
  const day = date.getUTCDay();
  switch (day) {
    case 1:
      return '월';
    case 2:
      return '화';
    case 3:
      return '수';
    case 4:
      return '목';
    case 5:
      return '금';
    case 6:
      return '토';
    default:
      return '일';
  }
}
