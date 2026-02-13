export interface WorkoutRoutineItem {
  id: string;
  routineId: string;
  routineName: string | null;
  note: string | null;
  order: number;
}

export interface WorkoutExerciseItem {
  id: string;
  name: string;
  note: string | null;
  order: number;
  sets?: {
    id: string;
    weight: number | null;
    reps: number | null;
  }[];
}

export interface WorkoutItem {
  id: string;
  date: string;
  routines: WorkoutRoutineItem[];
  exercises: WorkoutExerciseItem[];
}

export interface WorkoutPayload {
  date: string;
  routines: {
    routineId: string;
    order?: number;
    note?: string;
  }[];
  exercises: {
    exerciseName: string;
    order?: number;
    note?: string;
  }[];
}

export interface WorkoutSetPayload {
  weight?: number;
  reps?: number;
  note?: string;
}
