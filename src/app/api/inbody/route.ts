import { NextRequest, NextResponse } from 'next/server';

import { getAuthUserId, getSupabaseAdmin } from '@/shared/libs/supabase';
import { getMonthRange } from '@/shared';

const json = (status: number, body: unknown) => NextResponse.json(body, { status });

export async function GET(request: NextRequest) {
  const userId = await getAuthUserId(request);
  const month = request.nextUrl.searchParams.get('month');

  if (!userId) {
    return json(401, { error: { code: 'UNAUTHORIZED', message: 'missing or invalid token' } });
  }

  if (!month) {
    return json(400, { error: { code: 'VALIDATION_ERROR', message: 'month is required' } });
  }

  const { start, end } = getMonthRange(month);

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('inbody_records')
    .select('id, measured_at, weight, skeletal_muscle_mass, body_fat_mass')
    .eq('user_id', userId)
    .gte('measured_at', start)
    .lte('measured_at', end)
    .order('measured_at', { ascending: true });

  if (error) {
    return json(500, { error: { code: 'DB_ERROR', message: error.message } });
  }

  return json(200, data ?? []);
}

export async function POST(request: NextRequest) {
  const userId = await getAuthUserId(request);

  if (!userId) {
    return json(401, { error: { code: 'UNAUTHORIZED', message: 'missing or invalid token' } });
  }

  const body = (await request.json()) as {
    measuredAt?: string;
    weight?: number;
    skeletalMuscleMass?: number;
    bodyFatMass?: number;
  };

  if (!body?.measuredAt) {
    return json(400, { error: { code: 'VALIDATION_ERROR', message: 'measuredAt is required' } });
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('inbody_records')
    .insert({
      user_id: userId,
      measured_at: body.measuredAt,
      weight: body.weight ?? null,
      skeletal_muscle_mass: body.skeletalMuscleMass ?? null,
      body_fat_mass: body.bodyFatMass ?? null,
    })
    .select('id, measured_at, weight, skeletal_muscle_mass, body_fat_mass')
    .single();

  if (error) {
    return json(500, { error: { code: 'DB_ERROR', message: error.message } });
  }

  return json(201, data);
}
