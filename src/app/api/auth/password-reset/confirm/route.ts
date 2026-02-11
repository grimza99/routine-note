import { NextRequest, NextResponse } from 'next/server';

import { getSupabaseAdmin } from '@/shared/libs/supabase';

const json = (status: number, body: unknown) => NextResponse.json(body, { status });

export async function POST(request: NextRequest) {
  const body = (await request.json()) as { accessToken?: string; newPassword?: string };

  if (!body?.accessToken || !body?.newPassword) {
    return json(400, {
      error: { code: 'VALIDATION_ERROR', message: 'accessToken and newPassword are required' },
    });
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.auth.getUser(body.accessToken);

  if (error || !data?.user?.id) {
    return json(401, { error: { code: 'AUTH_ERROR', message: error?.message || 'invalid token' } });
  }

  const { error: updateError } = await supabase.auth.admin.updateUserById(data.user.id, {
    password: body.newPassword,
  });

  if (updateError) {
    return json(400, { error: { code: 'AUTH_ERROR', message: updateError.message } });
  }

  return json(200, { ok: true });
}
