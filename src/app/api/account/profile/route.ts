import { NextRequest } from 'next/server';

import { getAuthUserId, getSupabaseAdmin } from '@/shared/libs/supabase';
import { json } from '@/shared/libs/api-route';

interface IProfilePayload {
  nickname: string | null;
  goalWorkoutDays: number | null;
}
export async function PATCH(request: NextRequest) {
  const userId = await getAuthUserId(request);

  if (!userId) {
    return json(401, { error: { code: 'UNAUTHORIZED', message: 'missing or invalid token' } });
  }

  const body = (await request.json()) as IProfilePayload;

  const hasNickname = typeof body?.nickname === 'string';
  const hasGoal = Number.isFinite(body?.goalWorkoutDays);

  if (!hasNickname && !hasGoal) {
    return json(400, {
      error: { code: 'VALIDATION_ERROR', message: '닉네임이나 월 목표일 둘중에 하나는 필수로 입력해야 합니다.' },
    });
  }

  const supabase = getSupabaseAdmin();

  //nickname 업데이트
  let nextNickname: string | null = null;
  if (hasNickname) {
    const normalizedNickname = body.nickname?.trim() ?? '';

    if (!normalizedNickname) {
      return json(400, {
        error: { code: 'VALIDATION_ERROR', message: '닉네임은 빈값일 수 없습니다' },
      });
    }

    const { data: existingNickname, error: existingNicknameError } = await supabase
      .from('users')
      .select('nickname, id')
      .eq('nickname', normalizedNickname)
      .maybeSingle();

    if (existingNicknameError) {
      return json(500, { error: { code: 'DB_ERROR', message: 'users table: ' + existingNicknameError.message } });
    }

    if (existingNickname && existingNickname.id !== userId) {
      return json(409, {
        error: { code: 'NICKNAME_TAKEN', message: `${existingNickname}은 이미 존재하는 닉네임 입니다.` },
      });
    }

    const { data: authUser, error: authUserError } = await supabase.auth.admin.getUserById(userId);

    if (authUserError || !authUser?.user) {
      return json(500, {
        error: { code: 'DB_ERROR', message: authUserError?.message || 'failed to load user' },
      });
    }

    const { error: updateAuthError } = await supabase.auth.admin.updateUserById(userId, {
      user_metadata: {
        ...(authUser.user.user_metadata ?? {}),
        nickname: normalizedNickname,
      },
    });

    if (updateAuthError) {
      return json(500, { error: { code: 'DB_ERROR', message: updateAuthError.message } });
    }

    const { error: updateProfileError } = await supabase
      .from('users')
      .update({ nickname: normalizedNickname })
      .eq('id', userId);

    if (updateProfileError) {
      return json(500, { error: { code: 'DB_ERROR', message: 'users update error:' + updateProfileError.message } });
    }

    nextNickname = normalizedNickname;
  }

  let goalWorkoutDays: number | null = null;

  //goal 업데이트
  if (hasGoal) {
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
        },
        { onConflict: 'user_id,report_month' },
      )
      .select('goal_workout_days')
      .single();

    if (goalError) {
      return json(500, { error: { code: 'DB_ERROR', message: goalError.message } });
    }

    goalWorkoutDays = goalData?.goal_workout_days ?? normalizedGoal;
  }

  return json(200, {
    nickname: nextNickname,
    goalWorkoutDays,
  });
}
