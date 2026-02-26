import { NextRequest, NextResponse } from 'next/server';
import { TOKEN } from '@/shared/constants';
import { json } from '@/shared/libs/api-route';
import { getAuthUserId, getSupabaseAdmin } from '@/shared/libs/supabase';

export async function POST(request: NextRequest) {
  const userId = await getAuthUserId(request);

  if (!userId) {
    return json(401, { error: { code: 'AUTH_ERROR', message: 'unauthorized' } });
  }

  const supabaseAdmin = getSupabaseAdmin();
  const deletedAt = new Date().toISOString();
  const { error: softDeleteError } = await supabaseAdmin.from('users').update({ deleted_at: deletedAt }).eq('id', userId);

  if (softDeleteError) {
    return json(500, { error: { code: 'DB_ERROR', message: softDeleteError.message } });
  }

  const { error: authDeleteError } = await supabaseAdmin.auth.admin.deleteUser(userId);

  if (authDeleteError) {
    await supabaseAdmin.from('users').update({ deleted_at: null }).eq('id', userId);
    return json(500, { error: { code: 'AUTH_ERROR', message: authDeleteError.message } });
  }

  const response = NextResponse.json({ ok: true }, { status: 200 });

  response.cookies.delete(TOKEN.REFRESH);
  response.cookies.delete(TOKEN.ACCESS);

  return response;
}
