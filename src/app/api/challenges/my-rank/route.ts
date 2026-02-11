import { NextRequest, NextResponse } from 'next/server';

import { getAuthUserId, getSupabaseAdmin } from '@/shared/libs/supabase';
import { getMonthRange, json } from '@/shared/libs/api-route';

// 내 챌린지 랭킹 조회 API (테스트 완료)
export async function GET(request: NextRequest) {
  const userId = await getAuthUserId(request);

  if (!userId) {
    return json(401, { error: { code: 'UNAUTHORIZED', message: 'missing or invalid token' } });
  }
  const currentMonth = new Date().toISOString().slice(0, 7);
  const year_month = request.nextUrl.searchParams.get('month') ?? currentMonth;
  const { start, end } = getMonthRange(year_month);

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

  const ranking = Array.from(counts.entries())
    .map(([id, dates]) => ({ userId: id, workoutDays: dates.size }))
    .sort((a, b) => b.workoutDays - a.workoutDays || a.userId.localeCompare(b.userId))
    .map((entry, index) => ({ ...entry, rank: index + 1 }));

  const me = ranking.find((entry) => entry.userId === userId) ?? null;

  return json(200, {
    year_month,
    rank: me?.rank ?? null,
    workoutDays: me?.workoutDays ?? 0,
    totalParticipants: ranking.length,
  });
}
