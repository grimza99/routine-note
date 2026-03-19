import { NextRequest, NextResponse } from 'next/server';

import { getClientMeta } from '@/shared/libs/api-route';
import { getSupabaseAnon } from '@/shared/libs/supabase';
import { CLIENT_PLATFORM, MOBILE_META_HEADERS, TOKEN } from '@routine-note/package-shared';

const json = (status: number, body: unknown) => NextResponse.json(body, { status });

export async function POST(request: NextRequest) {
  const supabase = getSupabaseAnon();
  const clientMeta = getClientMeta(request);
  if (clientMeta.missingHeaders.includes(MOBILE_META_HEADERS.PLATFORM)) {
    return json(400, {
      error: { code: 'VALIDATION_ERROR', message: `${MOBILE_META_HEADERS.PLATFORM} header is required` },
    });
  }
  const cookieStore = request.cookies;
  const requestBody = (await request.json().catch(() => null)) as { refreshToken?: string } | null;
  const bodyRefreshToken = requestBody?.refreshToken?.trim() ? requestBody.refreshToken.trim() : null;
  const { platform } = clientMeta;
  const cookieRefreshToken = cookieStore.get(TOKEN.REFRESH)?.value;

  const refreshToken =
    platform === CLIENT_PLATFORM.WEB
      ? cookieRefreshToken
      : bodyRefreshToken ?? cookieRefreshToken;

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
    },
    { status: 200 },
  );

  response.cookies.set(TOKEN.REFRESH, data.session.refresh_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 3,
  });

  return response;
}
