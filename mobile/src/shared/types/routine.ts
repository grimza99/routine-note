export interface RoutineExercise {
  id: string;
  exerciseId: string;
  exerciseName: string;
  order?: number;
  note?: string;
  sets: { id: string; weight: number; reps: number; note?: string }[];
}
export interface RoutineItem {
  routineId: string;
  routineName: string;
  exercises: RoutineExercise[];
}

export interface RoutinePayload {
  routineName: string;
  exercises: {
    exerciseName: string;
    order?: number;
  }[];
}
