import { NextRequest } from 'next/server';
import { getAuthUserId, getSupabaseAdmin } from '@/shared/libs/supabase';
import { json } from '@/shared/libs/api-route';

export async function POST(request: NextRequest) {
  const userId = await getAuthUserId(request);

  if (!userId) {
    return json(401, { error: { code: 'UNAUTHORIZED', message: 'missing or invalid token' } });
  }

  const body = (await request.json()) as { month?: string; goalWorkoutDays?: number };

  if (!body?.month) {
    return json(400, { error: { code: 'VALIDATION_ERROR', message: 'month is required' } });
  }

  if (!Number.isFinite(body.goalWorkoutDays) || Number(body.goalWorkoutDays) <= 0) {
    return json(400, {
      error: { code: 'VALIDATION_ERROR', message: 'goalWorkoutDays must be a positive number' },
    });
  }

  const reportMonth = `${body.month}-01`;
  const goalWorkoutDays = Math.trunc(Number(body.goalWorkoutDays));

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('monthly_goals')
    .upsert(
      {
        user_id: userId,
        report_month: reportMonth,
        goal_workout_days: goalWorkoutDays,
      },
      { onConflict: 'user_id,report_month' },
    )
    .select('id, report_month, goal_workout_days')
    .single();

  if (error) {
    return json(500, { error: { code: 'DB_ERROR', message: error.message } });
  }

  return json(200, {
    id: data?.id,
    month: body.month,
    goalWorkoutDays: data?.goal_workout_days ?? goalWorkoutDays,
  });
}
