import { NextRequest, NextResponse } from "next/server";

import { getAuthUserId, getSupabaseAdmin } from "@/shared/libs/supabase";

const json = (status: number, body: unknown) => NextResponse.json(body, { status });

type Params = { routineId: string };

type RoutineItem = {
  id: string;
  exercise_id: string;
  item_order: number;
};

type RoutineResponse = {
  id: string;
  name: string;
  routine_items: RoutineItem[] | null;
};

const mapRoutine = (routine: RoutineResponse) => ({
  routineId: routine.id,
  routineName: routine.name,
  exercises: (routine.routine_items ?? []).map((item) => ({
    id: item.id,
    exerciseId: item.exercise_id,
    order: item.item_order,
  })),
});

export async function GET(request: NextRequest, context: { params: Params }) {
  const userId = await getAuthUserId(request);

  if (!userId) {
    return json(401, { error: { code: "UNAUTHORIZED", message: "missing or invalid token" } });
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("routines")
    .select(
      `
      id,
      name,
      routine_items (
        id,
        exercise_id,
        item_order
      )
      `
    )
    .eq("id", context.params.routineId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    return json(500, { error: { code: "DB_ERROR", message: error.message } });
  }

  if (!data) {
    return json(404, { error: { code: "NOT_FOUND", message: "routine not found" } });
  }

  return json(200, mapRoutine(data as RoutineResponse));
}

export async function PATCH(request: NextRequest, context: { params: Params }) {
  const userId = await getAuthUserId(request);

  if (!userId) {
    return json(401, { error: { code: "UNAUTHORIZED", message: "missing or invalid token" } });
  }

  const body = (await request.json()) as {
    name?: string;
    items?: { exerciseId: string; order: number }[];
  };

  if (!body?.name && !body?.items) {
    return json(400, { error: { code: "VALIDATION_ERROR", message: "name or items is required" } });
  }

  const supabase = getSupabaseAdmin();
  const { data: routine, error: routineError } = await supabase
    .from("routines")
    .update({ name: body.name })
    .eq("id", context.params.routineId)
    .eq("user_id", userId)
    .select("id, name")
    .maybeSingle();

  if (routineError) {
    return json(500, { error: { code: "DB_ERROR", message: routineError.message } });
  }

  if (!routine) {
    return json(404, { error: { code: "NOT_FOUND", message: "routine not found" } });
  }

  if (body.items) {
    const { error: deleteError } = await supabase
      .from("routine_items")
      .delete()
      .eq("routine_id", context.params.routineId);

    if (deleteError) {
      return json(500, { error: { code: "DB_ERROR", message: deleteError.message } });
    }

    const items = body.items.map((item) => ({
      routine_id: context.params.routineId,
      exercise_id: item.exerciseId,
      item_order: item.order,
    }));

    const { error: insertError } = await supabase.from("routine_items").insert(items);

    if (insertError) {
      return json(500, { error: { code: "DB_ERROR", message: insertError.message } });
    }
  }

  return json(200, { routineId: routine.id, routineName: routine.name });
}

export async function DELETE(request: NextRequest, context: { params: Params }) {
  const userId = await getAuthUserId(request);

  if (!userId) {
    return json(401, { error: { code: "UNAUTHORIZED", message: "missing or invalid token" } });
  }

  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from("routines")
    .delete()
    .eq("id", context.params.routineId)
    .eq("user_id", userId);

  if (error) {
    return json(500, { error: { code: "DB_ERROR", message: error.message } });
  }

  return json(200, { ok: true });
}
