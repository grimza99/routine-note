import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAnon } from '@/shared/libs/supabase';
import { json } from '@/shared/libs/api-route';

export async function POST(request: NextRequest) {
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

  const response = NextResponse.json(
    {
      id: data.user.id,
      email: data.user.email,
      username: data.user.user_metadata.username,
      nickname: data.user.user_metadata.nickname,
      age: data.user.user_metadata.age,
      privacy_policy: data.user.user_metadata.privacy_policy,
      access_token: data.session?.access_token ?? null,
      profile_image: data.user.user_metadata.profile_image ?? null,
    },
    { status: 200 },
  );

  if (data.session?.refresh_token) {
    response.cookies.set('sb_refresh_token', data.session.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 3, // 3 days
    });
  }

  return response;
}
