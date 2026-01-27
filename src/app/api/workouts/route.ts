import { NextRequest, NextResponse } from "next/server";

import { getSupabaseAdmin } from "@/shared/libs/supabase";

const json = (status: number, body: unknown) =>
  NextResponse.json(body, { status });

export async function GET(request: NextRequest) {
  const date = request.nextUrl.searchParams.get("date");
  const userId = request.nextUrl.searchParams.get("userId");

  if (!date || !userId) {
    return json(400, { error: { code: "VALIDATION_ERROR", message: "date and userId are required" } });
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
  const body = (await request.json()) as { date?: string; userId?: string };

  if (!body?.date || !body?.userId) {
    return json(400, { error: { code: "VALIDATION_ERROR", message: "date and userId are required" } });
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("workouts")
    .insert({ workout_date: body.date, user_id: body.userId })
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
