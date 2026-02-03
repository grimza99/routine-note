import { NextRequest, NextResponse } from "next/server";

import { getAuthUserId, getSupabaseAdmin } from "@/shared/libs/supabase";

const json = (status: number, body: unknown) => NextResponse.json(body, { status });

type RoutineDistributionItem = {
  id: string;
  label: string;
  value: number;
};

export async function GET(request: NextRequest) {
  const userId = await getAuthUserId(request);
  const month = request.nextUrl.searchParams.get("month");

  if (!userId) {
    return json(401, { error: { code: "UNAUTHORIZED", message: "missing or invalid token" } });
  }

  if (!month) {
    return json(400, { error: { code: "VALIDATION_ERROR", message: "month is required" } });
  }

  const range = getMonthRange(month);
  if (!range) {
    return json(400, { error: { code: "VALIDATION_ERROR", message: "month must be in YYYY-MM format" } });
  }

  const { start, end } = range;
  const supabase = getSupabaseAdmin();

  const { data: workouts, error: workoutsError } = await supabase
    .from("workouts")
    .select("id")
    .eq("user_id", userId)
    .gte("workout_date", start)
    .lte("workout_date", end);

  if (workoutsError) {
    return json(500, { error: { code: "DB_ERROR", message: workoutsError.message } });
  }

  const workoutIds = workouts?.map((workout) => workout.id) ?? [];
  if (!workoutIds.length) {
    return json(200, []);
  }

  const { data: workoutRoutines, error: routinesError } = await supabase
    .from("workout_routines")
    .select("routine_id, routines ( name )")
    .in("workout_id", workoutIds);

  if (routinesError) {
    return json(500, { error: { code: "DB_ERROR", message: routinesError.message } });
  }

  const routineMap = new Map<string, RoutineDistributionItem>();
  (workoutRoutines ?? []).forEach((routine) => {
    if (!routine?.routine_id) return;
    const id = routine.routine_id;
    const label = routine.routines?.name ?? "알 수 없음";
    const current = routineMap.get(id);
    routineMap.set(id, {
      id,
      label,
      value: (current?.value ?? 0) + 1,
    });
  });

  const result = Array.from(routineMap.values()).sort((a, b) => b.value - a.value);

  return json(200, result);
}

function getMonthRange(month: string) {
  const [yearText, monthText] = month.split("-");
  const yearNumber = Number(yearText);
  const monthNumber = Number(monthText);
  if (!Number.isInteger(yearNumber) || !Number.isInteger(monthNumber) || monthNumber < 1 || monthNumber > 12) {
    return null;
  }
  const start = `${month}-01`;
  const end = new Date(Date.UTC(yearNumber, monthNumber, 0)).toISOString().slice(0, 10);
  return { start, end };
}
