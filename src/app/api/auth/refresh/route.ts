import { NextRequest, NextResponse } from 'next/server';

import { getSupabaseAnon } from '@/shared/libs/supabase';

const json = (status: number, body: unknown) => NextResponse.json(body, { status });

export async function POST(request: NextRequest) {
  const supabase = getSupabaseAnon();
  const cookieStore = request.cookies;
  const requestBody = (await request.json().catch(() => null)) as { refreshToken?: string } | null;
  const bodyRefreshToken = requestBody?.refreshToken?.trim() ? requestBody.refreshToken.trim() : null;
  const refreshToken = bodyRefreshToken ?? cookieStore.get('sb_refresh_token')?.value;

  if (!refreshToken) {
    return json(401, { error: { code: 'UNAUTHORIZED', message: 'missing refresh token' } });
  }

  const { data, error } = await supabase.auth.refreshSession({ refresh_token: refreshToken });

  if (error || !data.session) {
    return json(401, { error: { code: 'AUTH_ERROR', message: error?.message ?? 'invalid refresh token' } });
  }

  const response = NextResponse.json(
    {
      user: data.user ? { id: data.user.id, email: data.user.email } : null,
      token: data.session.access_token,
      refresh_token: data.session.refresh_token,
    },
    { status: 200 },
  );

  response.cookies.set('sb_refresh_token', data.session.refresh_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 3,
  });

  return response;
}
