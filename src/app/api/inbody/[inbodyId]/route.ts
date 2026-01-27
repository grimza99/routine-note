import { NextRequest, NextResponse } from "next/server";

import { getAuthUserId, getSupabaseAdmin } from "@/shared/libs/supabase";

const json = (status: number, body: unknown) => NextResponse.json(body, { status });

type Params = { inbodyId: string };

export async function PATCH(request: NextRequest, context: { params: Params }) {
  const userId = await getAuthUserId(request);

  if (!userId) {
    return json(401, { error: { code: "UNAUTHORIZED", message: "missing or invalid token" } });
  }

  const body = (await request.json()) as {
    measuredAt?: string;
    weight?: number;
    skeletalMuscleMass?: number;
    bodyFatMass?: number;
  };

  const update: {
    measured_at?: string;
    weight?: number;
    skeletal_muscle_mass?: number;
    body_fat_mass?: number;
  } = {};

  if (body.measuredAt !== undefined) {
    update.measured_at = body.measuredAt;
  }

  if (body.weight !== undefined) {
    update.weight = body.weight;
  }

  if (body.skeletalMuscleMass !== undefined) {
    update.skeletal_muscle_mass = body.skeletalMuscleMass;
  }

  if (body.bodyFatMass !== undefined) {
    update.body_fat_mass = body.bodyFatMass;
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("inbody_records")
    .update(update)
    .eq("id", context.params.inbodyId)
    .eq("user_id", userId)
    .select("id, measured_at, weight, skeletal_muscle_mass, body_fat_mass")
    .maybeSingle();

  if (error) {
    return json(500, { error: { code: "DB_ERROR", message: error.message } });
  }

  if (!data) {
    return json(404, { error: { code: "NOT_FOUND", message: "inbody record not found" } });
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
    .from("inbody_records")
    .delete()
    .eq("id", context.params.inbodyId)
    .eq("user_id", userId);

  if (error) {
    return json(500, { error: { code: "DB_ERROR", message: error.message } });
  }

  return json(200, { ok: true });
}
