import { NextRequest } from 'next/server';
import { getSupabaseAdmin } from '@/shared/libs/supabase';
import { json } from '@/shared/libs/api-route';
import { TOKEN } from '@/shared/constants';

export async function POST(request: NextRequest) {
  const body = (await request.json()) as { newPassword?: string };

  if (!body?.newPassword) {
    return json(400, {
      error: { code: 'VALIDATION_ERROR', message: 'accessToken and newPassword are required' },
    });
  }
  const accessToken = request.cookies.get(TOKEN.ACCESS)?.value;
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.auth.getUser(accessToken);

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
