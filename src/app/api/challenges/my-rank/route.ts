import { NextRequest, NextResponse } from "next/server";

import { getAuthUserId, getSupabaseAdmin } from "@/shared/libs/supabase";

const json = (status: number, body: unknown) => NextResponse.json(body, { status });

const getCurrentMonth = () => new Date().toISOString().slice(0, 7);

export async function GET(request: NextRequest) {
  const userId = await getAuthUserId(request);

  if (!userId) {
    return json(401, { error: { code: "UNAUTHORIZED", message: "missing or invalid token" } });
  }

  const month = request.nextUrl.searchParams.get("month") ?? getCurrentMonth();

  const start = `${month}-01`;
  const end = `${month}-31`;

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("workouts")
    .select("user_id, workout_date")
    .gte("workout_date", start)
    .lte("workout_date", end);

  if (error) {
    return json(500, { error: { code: "DB_ERROR", message: error.message } });
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
    month,
    rank: me?.rank ?? null,
    workoutDays: me?.workoutDays ?? 0,
    totalParticipants: ranking.length,
  });
}
