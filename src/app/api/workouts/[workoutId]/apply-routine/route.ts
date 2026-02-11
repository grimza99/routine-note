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

  const body = (await request.json()) as { routineId?: string };

  if (!body?.routineId) {
    return json(400, { error: { code: "VALIDATION_ERROR", message: "routineId is required" } });
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

  const { data: routine, error: routineError } = await supabase
    .from("routines")
    .select("id")
    .eq("id", body.routineId)
    .eq("user_id", userId)
    .maybeSingle();

  if (routineError) {
    return json(500, { error: { code: "DB_ERROR", message: routineError.message } });
  }

  if (!routine) {
    return json(404, { error: { code: "NOT_FOUND", message: "routine not found" } });
  }

  const { data: lastRoutine, error: lastRoutineError } = await supabase
    .from("workout_routines")
    .select("item_order")
    .eq("workout_id", workoutId)
    .order("item_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (lastRoutineError) {
    return json(500, { error: { code: "DB_ERROR", message: lastRoutineError.message } });
  }

  const nextOrder = (lastRoutine?.item_order ?? 0) + 1;

  const { data: workoutRoutine, error: workoutRoutineError } = await supabase
    .from("workout_routines")
    .insert({
      workout_id: workoutId,
      routine_id: body.routineId,
      item_order: nextOrder,
    })
    .select("id")
    .single();

  if (workoutRoutineError) {
    return json(500, { error: { code: "DB_ERROR", message: workoutRoutineError.message } });
  }

  const { data: items, error: itemsError } = await supabase
    .from("routine_items")
    .select("exercise_id, item_order")
    .eq("routine_id", body.routineId);

  if (itemsError) {
    return json(500, { error: { code: "DB_ERROR", message: itemsError.message } });
  }

  if (!items?.length) {
    return json(200, {
      workoutId,
      workoutRoutineId: workoutRoutine.id,
      createdExercises: [],
    });
  }

  const insertPayload = items.map((item) => ({
    id: randomUUID(),
    workout_id: workoutId,
    workout_routine_id: workoutRoutine.id,
    exercise_id: item.exercise_id,
    item_order: item.item_order,
  }));

  const { data, error } = await supabase
    .from("workout_exercises")
    .insert(insertPayload)
    .select("id, exercise_id, item_order, workout_routine_id");

  if (error) {
    return json(500, { error: { code: "DB_ERROR", message: error.message } });
  }

  return json(200, {
    workoutId,
    workoutRoutineId: workoutRoutine.id,
    createdExercises: data ?? [],
  });
}
