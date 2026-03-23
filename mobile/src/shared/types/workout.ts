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
