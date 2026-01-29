import { NextRequest, NextResponse } from "next/server";

import { getAuthUserId, getSupabaseAdmin } from "@/shared/libs/supabase";

const json = (status: number, body: unknown) => NextResponse.json(body, { status });

type Params = { workoutRoutineId: string };

type RequestBody = {
  order?: number;
  note?: string;
};

export async function PATCH(request: NextRequest, context: { params: Params }) {
  const userId = await getAuthUserId(request);

  if (!userId) {
    return json(401, { error: { code: "UNAUTHORIZED", message: "missing or invalid token" } });
  }

  const body = (await request.json()) as RequestBody;

  if (body.order !== undefined && body.order < 1) {
    return json(400, { error: { code: "VALIDATION_ERROR", message: "order must be >= 1" } });
  }

  const supabase = getSupabaseAdmin();
  const { data: owner, error: ownerError } = await supabase
    .from("workout_routines")
    .select("id, workouts!inner(user_id)")
    .eq("id", context.params.workoutRoutineId)
    .eq("workouts.user_id", userId)
    .maybeSingle();

  if (ownerError) {
    return json(500, { error: { code: "DB_ERROR", message: ownerError.message } });
  }

  if (!owner) {
    return json(404, { error: { code: "NOT_FOUND", message: "workout routine not found" } });
  }

  const update: { item_order?: number; note?: string | null } = {};

  if (body.order !== undefined) {
    update.item_order = body.order;
  }

  if (body.note !== undefined) {
    update.note = body.note;
  }

  const { data, error } = await supabase
    .from("workout_routines")
    .update(update)
    .eq("id", context.params.workoutRoutineId)
    .select("id, routine_id, item_order, note")
    .maybeSingle();

  if (error) {
    return json(500, { error: { code: "DB_ERROR", message: error.message } });
  }

  return json(200, {
    id: data?.id,
    routineId: data?.routine_id,
    order: data?.item_order,
    note: data?.note,
  });
}

export async function DELETE(request: NextRequest, context: { params: Params }) {
  const userId = await getAuthUserId(request);

  if (!userId) {
    return json(401, { error: { code: "UNAUTHORIZED", message: "missing or invalid token" } });
  }

  const supabase = getSupabaseAdmin();
  const { data: owner, error: ownerError } = await supabase
    .from("workout_routines")
    .select("id, workouts!inner(user_id)")
    .eq("id", context.params.workoutRoutineId)
    .eq("workouts.user_id", userId)
    .maybeSingle();

  if (ownerError) {
    return json(500, { error: { code: "DB_ERROR", message: ownerError.message } });
  }

  if (!owner) {
    return json(404, { error: { code: "NOT_FOUND", message: "workout routine not found" } });
  }

  const { error } = await supabase
    .from("workout_routines")
    .delete()
    .eq("id", context.params.workoutRoutineId);

  if (error) {
    return json(500, { error: { code: "DB_ERROR", message: error.message } });
  }

  return json(200, { ok: true });
}
