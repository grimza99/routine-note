import { NextRequest } from 'next/server';

import { json } from '@/shared/libs/api-route';
import { getAuthUserId, getSupabaseAdmin } from '@/shared/libs/supabase';

//------------------ GET /api/account/goal  current month goal row data in monthly_goals table  ------------------//

export async function GET(request: NextRequest) {
  const userId = await getAuthUserId(request);
  if (!userId) {
    return json(401, { error: { code: 'UNAUTHORIZED', message: 'missing or invalid token' } });
  }
  const month = new Date().toISOString().slice(0, 7); // YYYY-MM
  const supabase = getSupabaseAdmin();

  const { data } = await supabase
    .from('monthly_goals')
    .select('report_month, goal_workout_days,hidden_setup_prompt')
    .eq('user_id', userId)
    .eq('report_month', `${month}-01`)
    .single();

  if (!data) {
    return json(200, null);
  }

  return json(200, {
    month: data.report_month,
    goalWorkoutDays: data?.goal_workout_days,
    hidden_setup_prompt: data?.hidden_setup_prompt,
  });
}

//------------------ POST /api/account/goal  hidden goal-setup-prompt ------------------//

export async function POST(request: NextRequest) {
  const userId = await getAuthUserId(request);
  if (!userId) {
    return json(401, { error: { code: 'UNAUTHORIZED', message: 'missing or invalid token' } });
  }
  const month = new Date().toISOString().slice(0, 7) + '-01'; // YYYY-MM
  const supabase = getSupabaseAdmin();

  const { data: existGoalData, error: existGoalDataError } = await supabase
    .from('monthly_goals')
    .select('report_month, goal_workout_days,hidden_setup_prompt')
    .eq('user_id', userId)
    .eq('report_month', `${month}`)
    .maybeSingle();

  if (existGoalDataError) {
    return json(500, { error: { code: 'DB_ERROR', message: 'Failed to fetch existing goal data' } });
  }

  if (!existGoalData) {
    const { data, error } = await supabase
      .from('monthly_goals')
      .insert({
        user_id: userId,
        report_month: month,
        goal_workout_days: 0,
        hidden_setup_prompt: true,
      })
      .select('report_month, goal_workout_days,hidden_setup_prompt')
      .maybeSingle();
    if (error) {
      return json(500, {
        error: { code: 'DB_ERROR', message: 'Failed to insert the goal setup prompt status:' + error.message },
      });
    }
    if (!data) {
      return json(500, null);
    }
    return json(201, {
      month: data.report_month,
      goalWorkoutDays: data?.goal_workout_days,
      hidden_setup_prompt: data?.hidden_setup_prompt,
    });
  } else {
    const { data, error } = await supabase
      .from('monthly_goals')
      .update({ hidden_setup_prompt: true })
      .eq('user_id', userId)
      .eq('report_month', month)
      .select('report_month, goal_workout_days,hidden_setup_prompt')
      .maybeSingle();

    if (error) {
      return json(500, { error: { code: 'DB_ERROR', message: 'Failed to update the goal setup prompt status' } });
    }
    if (!data) {
      return json(500, null);
    }

    return json(201, {
      month: data.report_month,
      goalWorkoutDays: data?.goal_workout_days,
      hidden_setup_prompt: data?.hidden_setup_prompt,
    });
  }
}

//------------------ PATCH /api/account/goal monthly goal update ------------------//
export async function PATCH(request: NextRequest) {
  const userId = await getAuthUserId(request);

  if (!userId) {
    return json(401, { error: { code: 'UNAUTHORIZED', message: 'missing or invalid token' } });
  }

  const body = (await request.json()) as { goalWorkoutDays: number };

  if (!body.goalWorkoutDays) {
    return json(400, {
      error: { code: 'VALIDATION_ERROR', message: '월 목표일은 필수로 입력해야 합니다.' },
    });
  }

  const supabase = getSupabaseAdmin();

  let goalWorkoutDays: number | null = null;

  const goalValue = Number(body.goalWorkoutDays);

  if (!Number.isFinite(goalValue) || goalValue <= 0) {
    return json(400, {
      error: { code: 'VALIDATION_ERROR', message: 'goalWorkoutDays must be a positive number' },
    });
  }

  const date = new Date().toISOString().slice(0, 7) + '-01'; // 'YYYY-MM-01';
  const normalizedGoal = Math.trunc(goalValue);

  const { data: goalData, error: goalError } = await supabase
    .from('monthly_goals')
    .upsert(
      {
        user_id: userId,
        report_month: date,
        goal_workout_days: normalizedGoal,
        hidden_setup_prompt: true,
      },
      { onConflict: 'user_id,report_month' },
    )
    .select('goal_workout_days')
    .single();

  if (goalError) {
    return json(500, { error: { code: 'DB_ERROR', message: goalError.message } });
  }

  goalWorkoutDays = goalData?.goal_workout_days ?? normalizedGoal;

  return json(200, {
    goalWorkoutDays,
  });
}
