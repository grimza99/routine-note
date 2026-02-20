import { NextRequest } from 'next/server';
import { getAuthUserId, getSupabaseAdmin, getSupabaseAnon } from '@/shared/libs/supabase';
import { json } from '@/shared/libs/api-route';
import { PATHS } from '@/shared/constants';

export async function POST(request: NextRequest) {
  const supabaseAnon = getSupabaseAnon();

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

  let email = authUser.user.email;

  const { error } = await supabaseAnon.auth.resetPasswordForEmail(email, {
    redirectTo: new URL(PATHS.ACCOUNT.PASSWORD_RESET, 'https://routine-note.vercel.app').toString(),
  });

  if (error) {
    return json(400, { error: { code: 'AUTH_ERROR', message: error.message } });
  }

  return json(200, { ok: true });
}
