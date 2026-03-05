export interface RoutineExercise {
  id: string;
  name: string;
  order?: number;
  sets: { id: string; weight: number; reps: number }[];
}
export interface RoutineItem {
  routineId: string;
  name: string;
  exercises: RoutineExercise[];
}

export interface RoutinePayload {
  name: string;
  exercises: {
    name: string;
    order?: number;
  }[];
}
