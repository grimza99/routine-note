import { NextRequest, NextResponse } from "next/server";

import { getAuthUserId, getSupabaseAdmin } from "@/shared/libs/supabase";

const json = (status: number, body: unknown) => NextResponse.json(body, { status });

type Params = Promise<{ workoutId: string }>;

type RequestBody = {
  routineId?: string;
  order?: number;
  note?: string;
};

export async function POST(request: NextRequest, context: { params: Params }) {
  const { workoutId } = await Promise.resolve(context.params);
  const userId = await getAuthUserId(request);

  if (!userId) {
    return json(401, { error: { code: "UNAUTHORIZED", message: "missing or invalid token" } });
  }

  const body = (await request.json()) as RequestBody;

  if (!body?.routineId) {
    return json(400, { error: { code: "VALIDATION_ERROR", message: "routineId is required" } });
  }

  if (body.order !== undefined && body.order < 1) {
    return json(400, { error: { code: "VALIDATION_ERROR", message: "order must be >= 1" } });
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

  let nextOrder = body.order ?? 0;

  if (!nextOrder) {
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

    nextOrder = (lastRoutine?.item_order ?? 0) + 1;
  }

  const { data, error } = await supabase
    .from("workout_routines")
    .insert({
      workout_id: workoutId,
      routine_id: body.routineId,
      item_order: nextOrder,
      note: body.note ?? null,
    })
    .select("id, routine_id, item_order, note")
    .single();

  if (error) {
    return json(500, { error: { code: "DB_ERROR", message: error.message } });
  }

  return json(201, {
    id: data.id,
    routineId: data.routine_id,
    order: data.item_order,
    note: data.note,
  });
}
