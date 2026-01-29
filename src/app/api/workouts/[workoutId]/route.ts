import { NextRequest, NextResponse } from "next/server";

import { getAuthUserId, getSupabaseAdmin } from "@/shared/libs/supabase";

const json = (status: number, body: unknown) => NextResponse.json(body, { status });

type Params = { workoutId: string };

type WorkoutSet = {
  id: string;
  weight: number | null;
  reps: number | null;
  note: string | null;
  set_order: number;
};

type WorkoutExercise = {
  id: string;
  exercise_id: string;
  note: string | null;
  item_order: number;
  workout_routine_id: string | null;
  sets: WorkoutSet[] | null;
};

type WorkoutRoutine = {
  id: string;
  routine_id: string;
  item_order: number;
  note: string | null;
  routines: { id: string; name: string } | null;
  workout_exercises: WorkoutExercise[] | null;
};

type WorkoutResponse = {
  id: string;
  workout_date: string;
  workout_routines: WorkoutRoutine[] | null;
  workout_exercises: WorkoutExercise[] | null;
};

const mapWorkoutExercise = (exercise: WorkoutExercise) => ({
  id: exercise.id,
  exerciseId: exercise.exercise_id,
  note: exercise.note,
  order: exercise.item_order,
  sets: (exercise.sets ?? []).map((set) => ({
    id: set.id,
    weight: set.weight,
    reps: set.reps,
    note: set.note,
    order: set.set_order,
  })),
});

const mapWorkoutResponse = (workout: WorkoutResponse) => ({
  id: workout.id,
  date: workout.workout_date,
  routines: (workout.workout_routines ?? []).map((routine) => ({
    id: routine.id,
    routineId: routine.routine_id,
    routineName: routine.routines?.name ?? null,
    order: routine.item_order,
    note: routine.note,
    exercises: (routine.workout_exercises ?? []).map(mapWorkoutExercise),
  })),
  exercises: (workout.workout_exercises ?? [])
    .filter((exercise) => !exercise.workout_routine_id)
    .map(mapWorkoutExercise),
});

export async function GET(request: NextRequest, context: { params: Params }) {
  const userId = await getAuthUserId(request);

  if (!userId) {
    return json(401, { error: { code: "UNAUTHORIZED", message: "missing or invalid token" } });
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("workouts")
    .select(
      `
      id,
      workout_date,
      workout_routines (
        id,
        routine_id,
        item_order,
        note,
        routines ( id, name ),
        workout_exercises (
          id,
          exercise_id,
          note,
          item_order,
          workout_routine_id,
          sets (
            id,
            weight,
            reps,
            note,
            set_order
          )
        )
      ),
      workout_exercises (
        id,
        exercise_id,
        note,
        item_order,
        workout_routine_id,
        sets (
          id,
          weight,
          reps,
          note,
          set_order
        )
      )
      `
    )
    .eq("id", context.params.workoutId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    return json(500, { error: { code: "DB_ERROR", message: error.message } });
  }

  if (!data) {
    return json(404, { error: { code: "NOT_FOUND", message: "workout not found" } });
  }

  return json(200, mapWorkoutResponse(data as WorkoutResponse));
}

export async function PATCH(request: NextRequest, context: { params: Params }) {
  const userId = await getAuthUserId(request);

  if (!userId) {
    return json(401, { error: { code: "UNAUTHORIZED", message: "missing or invalid token" } });
  }

  const body = (await request.json()) as { date?: string };

  if (!body?.date) {
    return json(400, { error: { code: "VALIDATION_ERROR", message: "date is required" } });
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("workouts")
    .update({ workout_date: body.date })
    .eq("id", context.params.workoutId)
    .eq("user_id", userId)
    .select("id, workout_date")
    .maybeSingle();

  if (error) {
    return json(500, { error: { code: "DB_ERROR", message: error.message } });
  }

  if (!data) {
    return json(404, { error: { code: "NOT_FOUND", message: "workout not found" } });
  }

  return json(200, data);
}

export async function DELETE(request: NextRequest, context: { params: Params }) {
  const userId = await getAuthUserId(request);

  if (!userId) {
    return json(401, { error: { code: "UNAUTHORIZED", message: "missing or invalid token" } });
  }

  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from("workouts")
    .delete()
    .eq("id", context.params.workoutId)
    .eq("user_id", userId);

  if (error) {
    return json(500, { error: { code: "DB_ERROR", message: error.message } });
  }

  return json(200, { ok: true });
}
