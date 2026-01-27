import { NextRequest, NextResponse } from "next/server";

import { getAuthUserId, getSupabaseAdmin } from "@/shared/libs/supabase";

const json = (status: number, body: unknown) => NextResponse.json(body, { status });

type Params = { workoutId: string };

export async function GET(request: NextRequest, context: { params: Params }) {
  const userId = await getAuthUserId(request);

  if (!userId) {
    return json(401, { error: { code: "UNAUTHORIZED", message: "missing or invalid token" } });
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("workouts")
    .select(
      `
      id,
      workout_date,
      workout_exercises (
        id,
        exercise_id,
        note,
        item_order,
        sets (
          id,
          weight,
          reps,
          note,
          set_order
        )
      )
      `
    )
    .eq("id", context.params.workoutId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    return json(500, { error: { code: "DB_ERROR", message: error.message } });
  }

  if (!data) {
    return json(404, { error: { code: "NOT_FOUND", message: "workout not found" } });
  }

  return json(200, data);
}

export async function PATCH(request: NextRequest, context: { params: Params }) {
  const userId = await getAuthUserId(request);

  if (!userId) {
    return json(401, { error: { code: "UNAUTHORIZED", message: "missing or invalid token" } });
  }

  const body = (await request.json()) as { date?: string };

  if (!body?.date) {
    return json(400, { error: { code: "VALIDATION_ERROR", message: "date is required" } });
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("workouts")
    .update({ workout_date: body.date })
    .eq("id", context.params.workoutId)
    .eq("user_id", userId)
    .select("id, workout_date")
    .maybeSingle();

  if (error) {
    return json(500, { error: { code: "DB_ERROR", message: error.message } });
  }

  if (!data) {
    return json(404, { error: { code: "NOT_FOUND", message: "workout not found" } });
  }

  return json(200, data);
}

export async function DELETE(request: NextRequest, context: { params: Params }) {
  const userId = await getAuthUserId(request);

  if (!userId) {
    return json(401, { error: { code: "UNAUTHORIZED", message: "missing or invalid token" } });
  }

  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from("workouts")
    .delete()
    .eq("id", context.params.workoutId)
    .eq("user_id", userId);

  if (error) {
    return json(500, { error: { code: "DB_ERROR", message: error.message } });
  }

  return json(200, { ok: true });
}
