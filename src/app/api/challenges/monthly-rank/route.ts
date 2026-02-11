import { NextRequest } from 'next/server';
import { getSupabaseAdmin } from '@/shared/libs/supabase';
import { getMonthRange, json } from '@/shared/libs/api-route';

export async function GET(request: NextRequest) {
  const month = request.nextUrl.searchParams.get('month');

  if (!month) {
    return json(400, { error: { code: 'VALIDATION_ERROR', message: 'month is required' } });
  }

  const { start, end } = getMonthRange(month);
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from('workouts')
    .select('user_id, workout_date')
    .gte('workout_date', start)
    .lte('workout_date', end);

  if (error) {
    return json(500, { error: { code: 'DB_ERROR', message: error.message } });
  }

  const counts = new Map<string, Set<string>>();

  for (const row of data ?? []) {
    const set = counts.get(row.user_id) ?? new Set<string>();
    set.add(row.workout_date);
    counts.set(row.user_id, set);
  }

  const userIds = Array.from(counts.keys());
  let nicknameById = new Map<string, string>();

  if (userIds.length > 0) {
    const { data: users, error: usersError } = await supabase.from('users').select('id, nickname').in('id', userIds);

    if (usersError) {
      return json(500, { error: { code: 'DB_ERROR', message: usersError.message } });
    }

    nicknameById = new Map((users ?? []).map((user) => [user.id, user.nickname ?? user.id]));
  }

  const ranking = Array.from(counts.entries())
    .map(([userId, dates]) => ({
      nickname: nicknameById.get(userId) ?? userId,
      workoutDays: dates.size,
    }))
    .sort((a, b) => b.workoutDays - a.workoutDays || a.nickname.localeCompare(b.nickname))
    .map((entry, index) => ({ ...entry, rank: index + 1 }));

  return json(200, ranking);
}
