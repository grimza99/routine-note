import { NextRequest, NextResponse } from 'next/server';
import { getClientMeta, json } from '@/shared/libs/api-route';
import { getSupabaseAnon } from '@/shared/libs/supabase';
import { CLIENT_PLATFORM, IAuthResponse, IAuthMobileResponse, MOBILE_META_HEADERS, TOKEN } from '@routine-note/package-shared';

export async function POST(request: NextRequest) {
  const clientMeta = getClientMeta(request);
  if (clientMeta.missingHeaders.includes(MOBILE_META_HEADERS.PLATFORM)) {
    return json(400, {
      error: { code: 'VALIDATION_ERROR', message: `${MOBILE_META_HEADERS.PLATFORM} header is required` },
    });
  }

  const body = (await request.json()) as { email?: string; password?: string };

  if (!body?.email || !body?.password) {
    return json(400, { error: { code: 'VALIDATION_ERROR', message: '이메일과 비밀번호는 필수 입니다.' } });
  }

  const supabase = getSupabaseAnon();
  const { data, error } = await supabase.auth.signInWithPassword({
    email: body.email,
    password: body.password,
  });

  if (error) {
    return json(401, { error: { code: 'AUTH_ERROR', message: '이메일, 혹은 비밀번호가 일치하지 않습니다.' } });
  }

  const { platform } = clientMeta;
  const baseResponse: IAuthResponse = {
    id: data.user.id,
    email: data.user.email ?? '',
    username: data.user.user_metadata.username,
    nickname: data.user.user_metadata.nickname,
    age: data.user.user_metadata.age,
    privacy_policy: data.user.user_metadata.privacy_policy,
    access_token: data.session?.access_token ?? null,
    profile_image: data.user.user_metadata.profile_image ?? null,
  };

  const responseBody: IAuthResponse | IAuthMobileResponse =
    platform === CLIENT_PLATFORM.IOS || platform === CLIENT_PLATFORM.ANDROID
      ? {
          ...baseResponse,
          refresh_token: data.session?.refresh_token ?? null,
        }
      : baseResponse;

  const response: NextResponse<IAuthResponse | IAuthMobileResponse> = NextResponse.json(responseBody, { status: 200 });

  if (data.session?.refresh_token) {
    response.cookies.set(TOKEN.REFRESH, data.session.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 3, // 3 days
    });
  }

  return response;
}
