import { NextRequest, NextResponse } from 'next/server';

import { getAuthUserId, getSupabaseAdmin } from '@/shared/libs/supabase';

const json = (status: number, body: unknown) => NextResponse.json(body, { status });

type Params = { setId: string };

export async function PATCH(request: NextRequest, context: { params: Params }) {
  const userId = await getAuthUserId(request);

  if (!userId) {
    return json(401, { error: { code: 'UNAUTHORIZED', message: 'missing or invalid token' } });
  }

  const body = (await request.json()) as { weight?: number; reps?: number; note?: string; order?: number };

  const params = await Promise.resolve(context.params);
  const setId = params?.setId;

  const supabase = getSupabaseAdmin();
  const { data: owner, error: ownerError } = await supabase.from('sets').select('id').eq('id', setId).maybeSingle();

  if (ownerError) {
    return json(500, { error: { code: 'DB_ERROR', message: ownerError.message } });
  }

  if (!owner) {
    return json(404, { error: { code: 'NOT_FOUND', message: 'set not found' } });
  }

  const update: { weight?: number; reps?: number; order?: number } = {};

  if (body.weight !== undefined) {
    update.weight = body.weight;
  }

  if (body.reps !== undefined) {
    update.reps = body.reps;
  }

  if (body.order !== undefined) {
    update.order = body.order;
  }

  const { data, error } = await supabase
    .from('sets')
    .update(update)
    .eq('id', setId)
    .select('id, weight, reps, order')
    .maybeSingle();

  if (error) {
    return json(500, { error: { code: 'DB_ERROR', message: error.message } });
  }

  return json(200, data);
}

export async function DELETE(request: NextRequest, context: { params: Params }) {
  const userId = await getAuthUserId(request);

  if (!userId) {
    return json(401, { error: { code: 'UNAUTHORIZED', message: 'missing or invalid token' } });
  }

  const params = await Promise.resolve(context.params);
  const setId = params?.setId;

  const supabase = getSupabaseAdmin();
  const { data: owner, error: ownerError } = await supabase.from('sets').select('id').eq('id', setId).maybeSingle();

  if (ownerError) {
    return json(500, { error: { code: 'select sets DB_ERROR', message: ownerError.message } });
  }

  if (!owner) {
    return json(404, { error: { code: 'NOT_FOUND', message: 'set not found' } });
  }

  const { error } = await supabase.from('sets').delete().eq('id', setId);

  if (error) {
    return json(500, { error: { code: 'sets delete DB_ERROR', message: error.message } });
  }

  return json(200, { ok: true });
}
