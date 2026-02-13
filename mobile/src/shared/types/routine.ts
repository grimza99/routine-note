export interface RoutineExercise {
  id: string;
  exerciseId: string;
  exerciseName: string;
  order: number;
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
