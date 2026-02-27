import { NextRequest } from 'next/server';

import { json } from '@/shared/libs/api-route';
import { getAuthUserId, getSupabaseAdmin } from '@/shared/libs/supabase';

//이번달 목표 조회 API
export async function GET(request: NextRequest) {
  const userId = await getAuthUserId(request);
  if (!userId) {
    return json(401, { error: { code: 'UNAUTHORIZED', message: 'missing or invalid token' } });
  }
  const month = new Date().toISOString().slice(0, 7); // YYYY-MM
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from('monthly_goals')
    .select('report_month, goal_workout_days')
    .eq('user_id', userId)
    .eq('report_month', `${month}-01`)
    .single();

  if (error) {
    return json(500, { error: { code: 'DB_ERROR', message: 'monthly_goals DB:' + error.message } });
  }

  if (!data) {
    return json(200, null);
  }

  return json(200, {
    month: data.report_month,
    goalWorkoutDays: data?.goal_workout_days,
  });
}
