import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";

import { getAuthUserId, getSupabaseAdmin } from "@/shared/libs/supabase";

const json = (status: number, body: unknown) => NextResponse.json(body, { status });

type Params = Promise<{ workoutId: string }>;

export async function POST(request: NextRequest, context: { params: Params }) {
  const { workoutId } = await Promise.resolve(context.params);
  const userId = await getAuthUserId(request);

  if (!userId) {
    return json(401, { error: { code: "UNAUTHORIZED", message: "missing or invalid token" } });
  }

  const body = (await request.json()) as {
    exerciseId?: string;
    order?: number;
    note?: string;
    workoutRoutineId?: string;
  };

  if (!body?.exerciseId || !body?.order) {
    return json(400, { error: { code: "VALIDATION_ERROR", message: "exerciseId and order are required" } });
  }

  const supabase = getSupabaseAdmin();
  const { data: workout, error: workoutError } = await supabase
    .from("workouts")
    .select("id")
    .eq("id", workoutId)
    .eq("user_id", userId)
    .maybeSingle();

  if (workoutError) {
    return json(500, { error: { code: "DB_ERROR", message: workoutError.message } });
  }

  if (!workout) {
    return json(404, { error: { code: "NOT_FOUND", message: "workout not found" } });
  }

  if (body.workoutRoutineId) {
    const { data: workoutRoutine, error: workoutRoutineError } = await supabase
      .from("workout_routines")
      .select("id, workout_id, workouts!inner(user_id)")
      .eq("id", body.workoutRoutineId)
      .eq("workouts.user_id", userId)
      .maybeSingle();

    if (workoutRoutineError) {
      return json(500, { error: { code: "DB_ERROR", message: workoutRoutineError.message } });
    }

    if (!workoutRoutine || workoutRoutine.workout_id !== workoutId) {
      return json(404, { error: { code: "NOT_FOUND", message: "workout routine not found" } });
    }
  }

  const { data, error } = await supabase
    .from("workout_exercises")
    .insert({
      id: randomUUID(),
      workout_id: workoutId,
      workout_routine_id: body.workoutRoutineId ?? null,
      exercise_id: body.exerciseId,
      item_order: body.order,
      note: body.note ?? null,
    })
    .select("id, workout_id, workout_routine_id, exercise_id, item_order, note")
    .single();

  if (error) {
    return json(500, { error: { code: "DB_ERROR", message: error.message } });
  }

  return json(201, data);
}
