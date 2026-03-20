import { IExercise } from '@routine-note/package-shared';

export interface RoutineExercise {
  id: string;
  name: string;
  order?: number;
  sets: { id: string; weight: number; reps: number }[];
}

export interface RoutinePayload {
  name: string;
  exercises: {
    name: string;
    order?: number;
  }[];
}
