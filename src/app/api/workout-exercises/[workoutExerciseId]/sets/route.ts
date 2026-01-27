import { NextRequest, NextResponse } from "next/server";

import { getAuthUserId, getSupabaseAdmin } from "@/shared/libs/supabase";

const json = (status: number, body: unknown) => NextResponse.json(body, { status });

type Params = { workoutExerciseId: string };

export async function POST(request: NextRequest, context: { params: Params }) {
  const userId = await getAuthUserId(request);

  if (!userId) {
    return json(401, { error: { code: "UNAUTHORIZED", message: "missing or invalid token" } });
  }

  const body = (await request.json()) as { weight?: number; reps?: number; note?: string; order?: number };

  if (body?.order === undefined) {
    return json(400, { error: { code: "VALIDATION_ERROR", message: "order is required" } });
  }

  const supabase = getSupabaseAdmin();
  const { data: owner, error: ownerError } = await supabase
    .from("workout_exercises")
    .select("id, workouts!inner(user_id)")
    .eq("id", context.params.workoutExerciseId)
    .eq("workouts.user_id", userId)
    .maybeSingle();

  if (ownerError) {
    return json(500, { error: { code: "DB_ERROR", message: ownerError.message } });
  }

  if (!owner) {
    return json(404, { error: { code: "NOT_FOUND", message: "workout exercise not found" } });
  }

  const { data, error } = await supabase
    .from("sets")
    .insert({
      workout_exercise_id: context.params.workoutExerciseId,
      weight: body.weight ?? null,
      reps: body.reps ?? null,
      note: body.note ?? null,
      set_order: body.order,
    })
    .select("id, weight, reps, note, set_order")
    .single();

  if (error) {
    return json(500, { error: { code: "DB_ERROR", message: error.message } });
  }

  return json(201, data);
}
