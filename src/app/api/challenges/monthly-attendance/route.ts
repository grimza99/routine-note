import { NextRequest, NextResponse } from "next/server";

import { getSupabaseAdmin } from "@/shared/libs/supabase";

const json = (status: number, body: unknown) => NextResponse.json(body, { status });

export async function GET(request: NextRequest) {
  const month = request.nextUrl.searchParams.get("month");

  if (!month) {
    return json(400, { error: { code: "VALIDATION_ERROR", message: "month is required" } });
  }

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
    .map(([userId, dates]) => ({ userId, workoutDays: dates.size }))
    .sort((a, b) => b.workoutDays - a.workoutDays || a.userId.localeCompare(b.userId))
    .map((entry, index) => ({ ...entry, rank: index + 1 }));

  return json(200, ranking);
}
