import { NextRequest, NextResponse } from 'next/server';

import { getSupabaseAdmin, getSupabaseAnon } from '@/shared/libs/supabase';

const json = (status: number, body: unknown) => NextResponse.json(body, { status });

export async function POST(request: NextRequest) {
  const body = (await request.json()) as {
    email?: string;
    password?: string;
    username?: string;
    nickname?: string | null;
    age?: number;
    policy?: boolean;
  };

  if (!body?.email || !body?.password || !body?.username) {
    return json(400, { error: { code: 'VALIDATION_ERROR', message: 'email, password, username are required' } });
  }

  const normalizedNickname = body.nickname?.trim() ? body.nickname.trim() : body.username.trim();

  const supabaseAdmin = getSupabaseAdmin();
  const { data: existingUser, error: existingUserError } = await supabaseAdmin
    .from('users')
    .select('id')
    .eq('nickname', normalizedNickname)
    .maybeSingle();

  if (existingUserError) {
    return json(500, { error: { code: 'DB_ERROR', message: existingUserError.message } });
  }

  if (existingUser) {
    return json(409, { error: { code: 'NICKNAME_TAKEN', message: 'nickname already exists' } });
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
        privacy_policy: Boolean(body.policy),
      },
    },
  });

  if (error) {
    return json(400, { error: { code: 'AUTH_ERROR', message: error.message } });
  }

  const response = NextResponse.json(
    {
      id: data.user?.id || null,
      email: data.user?.email || null,
      username: body.username.trim(),
      nickname: normalizedNickname,
      age: body.age ?? null,
      privacy_policy: Boolean(body.policy),
      token: data.session?.access_token ?? null,
    },
    { status: 201 },
  );

  if (data.session?.refresh_token) {
    response.cookies.set('sb_refresh_token', data.session.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 3,
    });
  }

  return response;
}
