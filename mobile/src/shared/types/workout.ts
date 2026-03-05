export interface WorkoutRoutineItem {
  id: string;
  routineId: string;
  name: string;
  note: string;
  order?: number;
  exercises: WorkoutExerciseItem[];
}

export interface WorkoutExerciseItem {
  id: string;
  name: string;
  order?: number;
  sets: {
    id: string;
    weight: number;
    reps: number;
  }[];
}

export interface WorkoutBydateResponse {
  id: string;
  date: string;
  routines: WorkoutRoutineItem[];
  standalone_exercises: WorkoutExerciseItem[];
}

export interface WorkoutPayload {
  date: string;
  routines: {
    routineId: string;
    order?: number;
    note?: string;
  }[];
  standalone_exercises: {
    name: string;
    order?: number;
  }[];
}

export interface WorkoutSetPayload {
  weight?: number;
  reps?: number;
  note?: string;
}
