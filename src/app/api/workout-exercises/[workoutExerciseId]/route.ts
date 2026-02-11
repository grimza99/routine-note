import { NextRequest, NextResponse } from "next/server";

import { getAuthUserId, getSupabaseAdmin } from "@/shared/libs/supabase";

const json = (status: number, body: unknown) => NextResponse.json(body, { status });

type Params = Promise<{ workoutExerciseId: string }>;

export async function PATCH(request: NextRequest, context: { params: Params }) {
  const { workoutExerciseId } = await Promise.resolve(context.params);
  const userId = await getAuthUserId(request);

  if (!userId) {
    return json(401, { error: { code: "UNAUTHORIZED", message: "missing or invalid token" } });
  }

  const body = (await request.json()) as { note?: string; order?: number };

  const supabase = getSupabaseAdmin();
  const { data: owner, error: ownerError } = await supabase
    .from("workout_exercises")
    .select("id, workout_id, workouts!inner(user_id)")
    .eq("id", workoutExerciseId)
    .eq("workouts.user_id", userId)
    .maybeSingle();

  if (ownerError) {
    return json(500, { error: { code: "DB_ERROR", message: ownerError.message } });
  }

  if (!owner) {
    return json(404, { error: { code: "NOT_FOUND", message: "workout exercise not found" } });
  }

  const update: { note?: string; item_order?: number } = {};

  if (body.note !== undefined) {
    update.note = body.note;
  }

  if (body.order !== undefined) {
    update.item_order = body.order;
  }

  const { data, error } = await supabase
    .from("workout_exercises")
    .update(update)
    .eq("id", workoutExerciseId)
    .select("id, exercise_id, item_order, note")
    .maybeSingle();

  if (error) {
    return json(500, { error: { code: "DB_ERROR", message: error.message } });
  }

  return json(200, data);
}

export async function DELETE(request: NextRequest, context: { params: Params }) {
  const { workoutExerciseId } = await Promise.resolve(context.params);
  const userId = await getAuthUserId(request);

  if (!userId) {
    return json(401, { error: { code: "UNAUTHORIZED", message: "missing or invalid token" } });
  }

  const supabase = getSupabaseAdmin();
  const { data: owner, error: ownerError } = await supabase
    .from("workout_exercises")
    .select("id, workouts!inner(user_id)")
    .eq("id", workoutExerciseId)
    .eq("workouts.user_id", userId)
    .maybeSingle();

  if (ownerError) {
    return json(500, { error: { code: "DB_ERROR", message: ownerError.message } });
  }

  if (!owner) {
    return json(404, { error: { code: "NOT_FOUND", message: "workout exercise not found" } });
  }

  const { error } = await supabase
    .from("workout_exercises")
    .delete()
    .eq("id", workoutExerciseId);

  if (error) {
    return json(500, { error: { code: "DB_ERROR", message: error.message } });
  }

  return json(200, { ok: true });
}
