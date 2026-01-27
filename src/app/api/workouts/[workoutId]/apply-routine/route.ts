import { NextRequest, NextResponse } from "next/server";

import { getAuthUserId, getSupabaseAdmin } from "@/shared/libs/supabase";

const json = (status: number, body: unknown) => NextResponse.json(body, { status });

type Params = { workoutId: string };

export async function POST(request: NextRequest, context: { params: Params }) {
  const userId = await getAuthUserId(request);

  if (!userId) {
    return json(401, { error: { code: "UNAUTHORIZED", message: "missing or invalid token" } });
  }

  const body = (await request.json()) as { routineId?: string };

  if (!body?.routineId) {
    return json(400, { error: { code: "VALIDATION_ERROR", message: "routineId is required" } });
  }

  const supabase = getSupabaseAdmin();
  const { data: workout, error: workoutError } = await supabase
    .from("workouts")
    .select("id")
    .eq("id", context.params.workoutId)
    .eq("user_id", userId)
    .maybeSingle();

  if (workoutError) {
    return json(500, { error: { code: "DB_ERROR", message: workoutError.message } });
  }

  if (!workout) {
    return json(404, { error: { code: "NOT_FOUND", message: "workout not found" } });
  }

  const { data: items, error: itemsError } = await supabase
    .from("routine_items")
    .select("exercise_id, item_order")
    .eq("routine_id", body.routineId);

  if (itemsError) {
    return json(500, { error: { code: "DB_ERROR", message: itemsError.message } });
  }

  if (!items?.length) {
    return json(200, { workoutId: context.params.workoutId, createdExercises: [] });
  }

  const insertPayload = items.map((item) => ({
    workout_id: context.params.workoutId,
    exercise_id: item.exercise_id,
    item_order: item.item_order,
  }));

  const { data, error } = await supabase
    .from("workout_exercises")
    .insert(insertPayload)
    .select("id, exercise_id, item_order");

  if (error) {
    return json(500, { error: { code: "DB_ERROR", message: error.message } });
  }

  return json(200, { workoutId: context.params.workoutId, createdExercises: data ?? [] });
}
