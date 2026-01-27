import { NextRequest, NextResponse } from "next/server";

import { getAuthUserId, getSupabaseAdmin } from "@/shared/libs/supabase";

const json = (status: number, body: unknown) => NextResponse.json(body, { status });

export async function GET(request: NextRequest) {
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
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    return json(500, { error: { code: "DB_ERROR", message: error.message } });
  }

  return json(200, data ?? []);
}

export async function POST(request: NextRequest) {
  const userId = await getAuthUserId(request);

  if (!userId) {
    return json(401, { error: { code: "UNAUTHORIZED", message: "missing or invalid token" } });
  }

  const body = (await request.json()) as {
    name?: string;
    items?: { exerciseId: string; order: number }[];
  };

  if (!body?.name) {
    return json(400, { error: { code: "VALIDATION_ERROR", message: "name is required" } });
  }

  const supabase = getSupabaseAdmin();
  const { data: routine, error: routineError } = await supabase
    .from("routines")
    .insert({ user_id: userId, name: body.name })
    .select("id, name")
    .single();

  if (routineError) {
    return json(500, { error: { code: "DB_ERROR", message: routineError.message } });
  }

  if (body.items?.length) {
    const items = body.items.map((item) => ({
      routine_id: routine.id,
      exercise_id: item.exerciseId,
      item_order: item.order,
    }));

    const { error: itemsError } = await supabase.from("routine_items").insert(items);

    if (itemsError) {
      return json(500, { error: { code: "DB_ERROR", message: itemsError.message } });
    }
  }

  return json(201, routine);
}
