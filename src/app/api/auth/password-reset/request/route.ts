import { NextRequest, NextResponse } from 'next/server';

import { getAuthUserId, getSupabaseAdmin, getSupabaseAnon } from '@/shared/libs/supabase';

const json = (status: number, body: unknown) => NextResponse.json(body, { status });

export async function POST(request: NextRequest) {
  const body = (await request.json()) as { email?: string; redirectTo?: string };
  const supabaseAnon = getSupabaseAnon();

  let email = body?.email?.trim() ?? '';

  if (!email) {
    const userId = await getAuthUserId(request);

    if (!userId) {
      return json(400, { error: { code: 'VALIDATION_ERROR', message: 'email is required' } });
    }

    const supabaseAdmin = getSupabaseAdmin();
    const { data: authUser, error: authUserError } = await supabaseAdmin.auth.admin.getUserById(userId);

    if (authUserError || !authUser?.user?.email) {
      return json(500, {
        error: { code: 'DB_ERROR', message: authUserError?.message || 'failed to load user email' },
      });
    }

    email = authUser.user.email;
  }

  const { error } = await supabaseAnon.auth.resetPasswordForEmail(
    email,
    body?.redirectTo ? { redirectTo: body.redirectTo } : undefined,
  );

  if (error) {
    return json(400, { error: { code: 'AUTH_ERROR', message: error.message } });
  }

  return json(200, { ok: true });
}
