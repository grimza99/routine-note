export interface WorkoutRoutineItem {
  id?: string;
  routineId: string;
  routineName: string;
  note?: string | null;
  order?: number;
  exercises: WorkoutExerciseItem[];
}

export interface WorkoutExerciseItem {
  id: string;
  exerciseName: string;
  note?: string;
  order?: number;
  sets?: {
    id: string;
    weight: number | null;
    reps: number | null;
  }[];
}

export interface WorkoutBydateResponse {
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
