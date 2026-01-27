import { NextRequest, NextResponse } from "next/server";

import { getAuthUserId, getSupabaseAdmin } from "@/shared/libs/supabase";

const json = (status: number, body: unknown) => NextResponse.json(body, { status });

export async function GET(request: NextRequest) {
  const userId = await getAuthUserId(request);
  const month = request.nextUrl.searchParams.get("month");

  if (!userId) {
    return json(401, { error: { code: "UNAUTHORIZED", message: "missing or invalid token" } });
  }

  if (!month) {
    return json(400, { error: { code: "VALIDATION_ERROR", message: "month is required" } });
  }

  const start = `${month}-01`;
  const end = `${month}-31`;

  const supabase = getSupabaseAdmin();
  const { data: workouts, error: workoutsError } = await supabase
    .from("workouts")
    .select("id")
    .eq("user_id", userId)
    .gte("workout_date", start)
    .lte("workout_date", end);

  if (workoutsError) {
    return json(500, { error: { code: "DB_ERROR", message: workoutsError.message } });
  }

  const workoutIds = workouts?.map((workout) => workout.id) ?? [];
  const workoutDays = workouts?.length ?? 0;

  let totalSets = 0;
  if (workoutIds.length) {
    const { data: workoutExercises, error: weError } = await supabase
      .from("workout_exercises")
      .select("id")
      .in("workout_id", workoutIds);

    if (weError) {
      return json(500, { error: { code: "DB_ERROR", message: weError.message } });
    }

    const workoutExerciseIds = workoutExercises?.map((we) => we.id) ?? [];

    if (workoutExerciseIds.length) {
      const { count, error: setsError } = await supabase
        .from("sets")
        .select("id", { count: "exact", head: true })
        .in("workout_exercise_id", workoutExerciseIds);

      if (setsError) {
        return json(500, { error: { code: "DB_ERROR", message: setsError.message } });
      }

      totalSets = count ?? 0;
    }
  }

  const { data: inbody, error: inbodyError } = await supabase
    .from("inbody_records")
    .select("measured_at, weight, skeletal_muscle_mass, body_fat_mass")
    .eq("user_id", userId)
    .gte("measured_at", start)
    .lte("measured_at", end)
    .order("measured_at", { ascending: true });

  if (inbodyError) {
    return json(500, { error: { code: "DB_ERROR", message: inbodyError.message } });
  }

  const inbodyList = inbody ?? [];
  const first = inbodyList[0];
  const last = inbodyList[inbodyList.length - 1];

  const weightChange = first && last ? Number(last.weight ?? 0) - Number(first.weight ?? 0) : null;
  const skeletalMuscleMassChange =
    first && last ? Number(last.skeletal_muscle_mass ?? 0) - Number(first.skeletal_muscle_mass ?? 0) : null;
  const bodyFatMassChange =
    first && last ? Number(last.body_fat_mass ?? 0) - Number(first.body_fat_mass ?? 0) : null;

  return json(200, {
    month,
    workoutDays,
    totalSets,
    weightChange,
    skeletalMuscleMassChange,
    bodyFatMassChange,
  });
}
