import { NextRequest, NextResponse } from 'next/server';
import { getClientMeta, json } from '@/shared/libs/api-route';
import { getSupabaseAdmin, getSupabaseAnon } from '@/shared/libs/supabase';
import {
  CLIENT_PLATFORM,
  IAuthResponse,
  ISignupPayload,
  IAuthMobileResponse,
  MOBILE_META_HEADERS,
  TOKEN,
} from '@routine-note/package-shared';

export async function POST(request: NextRequest) {
  const clientMeta = getClientMeta(request);
  if (clientMeta.missingHeaders.includes(MOBILE_META_HEADERS.PLATFORM)) {
    return json(400, {
      error: { code: 'VALIDATION_ERROR', message: `${MOBILE_META_HEADERS.PLATFORM} header is required` },
    });
  }

  const body = (await request.json()) as ISignupPayload;

  if (!body?.email || !body?.password || !body?.username) {
    return json(400, { error: { code: 'VALIDATION_ERROR', message: '이메일, 이름, 비밀번호는 필수 입력입니다.' } });
  }

  const normalizedNickname = body.nickname?.trim() ? body.nickname.trim() : body.username.trim();

  const supabaseAdmin = getSupabaseAdmin();
  const { data: existingNickname, error: existingNicknameError } = await supabaseAdmin
    .from('users')
    .select('id')
    .eq('nickname', normalizedNickname)
    .is('deleted_at', null)
    .limit(1);

  const { data: existingEmail, error: existingEmailError } = await supabaseAdmin
    .from('users')
    .select('id')
    .eq('email', body.email)
    .maybeSingle();

  if (existingNicknameError || existingEmailError) {
    return json(500, {
      error: { code: 'DB_ERROR', message: existingNicknameError?.message || existingEmailError?.message },
    });
  }
  if (existingEmail) {
    return json(409, { error: { code: 'EMAIL_TAKEN', message: '이미 존재하는 이메일 입니다.' } });
  }
  if (existingNickname.length > 0) {
    return json(409, { error: { code: 'NICKNAME_TAKEN', message: '이미 존재하는 닉네임 입니다.' } });
  }

  const supabase = getSupabaseAnon();

  const { data, error } = await supabase.auth.signUp({
    email: body.email,
    password: body.password,
    options: {
      data: {
        email: body.email,
        username: body.username.trim(),
        nickname: normalizedNickname,
        age: body.age ?? null,
        privacy_policy: body.policy_policy,
      },
    },
  });

  if (error) {
    return json(400, { error: { code: 'AUTH_ERROR', message: error.message } });
  }

  const { platform } = clientMeta;
  const baseResponse: IAuthResponse = {
    id: data.user?.id || '',
    email: data.user?.email || '',
    username: body.username.trim(),
    nickname: normalizedNickname,
    age: body.age ?? null,
    privacy_policy: body.policy_policy,
    access_token: data.session?.access_token ?? null,
    profile_image: null,
  };

  const responseBody: IAuthResponse | IAuthMobileResponse =
    platform === CLIENT_PLATFORM.IOS || platform === CLIENT_PLATFORM.ANDROID
      ? {
          ...baseResponse,
          refresh_token: data.session?.refresh_token ?? null,
        }
      : baseResponse;

  const response: NextResponse<IAuthResponse | IAuthMobileResponse> = NextResponse.json(responseBody, {
    status: 201,
  });

  if (data.session?.refresh_token) {
    response.cookies.set(TOKEN.REFRESH, data.session.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 3,
    });
  }

  return response;
}
