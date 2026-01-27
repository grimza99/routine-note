import { NextRequest, NextResponse } from "next/server";

import { getAuthUserId, getSupabaseAdmin } from "@/shared/libs/supabase";

const json = (status: number, body: unknown) =>
  NextResponse.json(body, { status });

export async function GET(request: NextRequest) {
  const date = request.nextUrl.searchParams.get("date");
  const userId = await getAuthUserId(request);

  if (!date) {
    return json(400, { error: { code: "VALIDATION_ERROR", message: "date is required" } });
  }

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
    .eq("user_id", userId)
    .eq("workout_date", date)
    .maybeSingle();

  if (error) {
    return json(500, { error: { code: "DB_ERROR", message: error.message } });
  }

  return json(200, data ?? null);
}

export async function POST(request: NextRequest) {
  const body = (await request.json()) as { date?: string };
  const userId = await getAuthUserId(request);

  if (!body?.date) {
    return json(400, { error: { code: "VALIDATION_ERROR", message: "date is required" } });
  }

  if (!userId) {
    return json(401, { error: { code: "UNAUTHORIZED", message: "missing or invalid token" } });
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("workouts")
    .insert({ workout_date: body.date, user_id: userId })
    .select("id, workout_date")
    .single();

  if (error) {
    const isConflict = error.code === "23505";
    return json(isConflict ? 409 : 500, {
      error: { code: isConflict ? "CONFLICT" : "DB_ERROR", message: error.message },
    });
  }

  return json(201, data);
}
