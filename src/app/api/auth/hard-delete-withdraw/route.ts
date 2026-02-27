import { NextRequest, NextResponse } from 'next/server';
import { TOKEN } from '@/shared/constants';
import { json } from '@/shared/libs/api-route';
import { getAuthUserId, getSupabaseAdmin } from '@/shared/libs/supabase';

export async function DELETE(request: NextRequest) {
  const userId = await getAuthUserId(request);

  if (!userId) {
    return json(401, { error: { code: 'AUTH_ERROR', message: 'unauthorized' } });
  }

  const supabaseAdmin = getSupabaseAdmin();
  const { error: hardDeleteError } = await supabaseAdmin.from('users').delete().eq('id', userId);

  if (hardDeleteError) {
    return json(500, { error: { code: 'DB_ERROR', message: hardDeleteError.message } });
  }

  const { error: authDeleteError } = await supabaseAdmin.auth.admin.deleteUser(userId);

  if (authDeleteError) {
    return json(500, { error: { code: 'AUTH_ERROR', message: authDeleteError.message } });
  }

  const response = NextResponse.json({ ok: true }, { status: 200 });

  response.cookies.delete(TOKEN.REFRESH);
  response.cookies.delete(TOKEN.ACCESS);

  return response;
}
