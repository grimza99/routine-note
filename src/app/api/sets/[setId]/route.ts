import { NextRequest, NextResponse } from "next/server";

import { getAuthUserId, getSupabaseAdmin } from "@/shared/libs/supabase";

const json = (status: number, body: unknown) => NextResponse.json(body, { status });

type Params = { setId: string };

export async function PATCH(request: NextRequest, context: { params: Params }) {
  const userId = await getAuthUserId(request);

  if (!userId) {
    return json(401, { error: { code: "UNAUTHORIZED", message: "missing or invalid token" } });
  }

  const body = (await request.json()) as { weight?: number; reps?: number; note?: string; order?: number };

  const supabase = getSupabaseAdmin();
  const { data: owner, error: ownerError } = await supabase
    .from("sets")
    .select("id, workout_exercises!inner(workouts!inner(user_id))")
    .eq("id", context.params.setId)
    .eq("workout_exercises.workouts.user_id", userId)
    .maybeSingle();

  if (ownerError) {
    return json(500, { error: { code: "DB_ERROR", message: ownerError.message } });
  }

  if (!owner) {
    return json(404, { error: { code: "NOT_FOUND", message: "set not found" } });
  }

  const update: { weight?: number; reps?: number; note?: string; set_order?: number } = {};

  if (body.weight !== undefined) {
    update.weight = body.weight;
  }

  if (body.reps !== undefined) {
    update.reps = body.reps;
  }

  if (body.note !== undefined) {
    update.note = body.note;
  }

  if (body.order !== undefined) {
    update.set_order = body.order;
  }

  const { data, error } = await supabase
    .from("sets")
    .update(update)
    .eq("id", context.params.setId)
    .select("id, weight, reps, note, set_order")
    .maybeSingle();

  if (error) {
    return json(500, { error: { code: "DB_ERROR", message: error.message } });
  }

  return json(200, data);
}

export async function DELETE(request: NextRequest, context: { params: Params }) {
  const userId = await getAuthUserId(request);

  if (!userId) {
    return json(401, { error: { code: "UNAUTHORIZED", message: "missing or invalid token" } });
  }

  const supabase = getSupabaseAdmin();
  const { data: owner, error: ownerError } = await supabase
    .from("sets")
    .select("id, workout_exercises!inner(workouts!inner(user_id))")
    .eq("id", context.params.setId)
    .eq("workout_exercises.workouts.user_id", userId)
    .maybeSingle();

  if (ownerError) {
    return json(500, { error: { code: "DB_ERROR", message: ownerError.message } });
  }

  if (!owner) {
    return json(404, { error: { code: "NOT_FOUND", message: "set not found" } });
  }

  const { error } = await supabase
    .from("sets")
    .delete()
    .eq("id", context.params.setId);

  if (error) {
    return json(500, { error: { code: "DB_ERROR", message: error.message } });
  }

  return json(200, { ok: true });
}
