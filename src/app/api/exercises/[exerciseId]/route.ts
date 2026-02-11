import { NextRequest, NextResponse } from "next/server";

import { getAuthUserId, getSupabaseAdmin } from "@/shared/libs/supabase";

const json = (status: number, body: unknown) => NextResponse.json(body, { status });

type Params = { exerciseId: string };

export async function PATCH(request: NextRequest, context: { params: Params }) {
  const userId = await getAuthUserId(request);

  if (!userId) {
    return json(401, { error: { code: "UNAUTHORIZED", message: "missing or invalid token" } });
  }

  const body = (await request.json()) as { name?: string };

  if (!body?.name) {
    return json(400, { error: { code: "VALIDATION_ERROR", message: "name is required" } });
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("exercise_catalogs")
    .update({ name: body.name })
    .eq("id", context.params.exerciseId)
    .eq("user_id", userId)
    .select("id, name")
    .maybeSingle();

  if (error) {
    const status = error.code === "23505" ? 409 : 500;
    const code = error.code === "23505" ? "CONFLICT" : "DB_ERROR";
    return json(status, { error: { code, message: error.message } });
  }

  if (!data) {
    return json(404, { error: { code: "NOT_FOUND", message: "exercise not found" } });
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
    .from("exercise_catalogs")
    .delete()
    .eq("id", context.params.exerciseId)
    .eq("user_id", userId);

  if (error) {
    return json(500, { error: { code: "DB_ERROR", message: error.message } });
  }

  return json(200, { ok: true });
}
