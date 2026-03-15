import { IExercise, IWorkoutExercise } from '@routine-note/package-shared';

export interface IRoutine {
  id: string;
  routineId: string;
  name: string;
  order: number;
  exercises: IExercise[];
  note?: string;
}

export interface IWorkoutRoutine {
  id: string;
  routineId: string;
  name: string;
  order: number;
  note?: string;
  exercises: IWorkoutExercise[];
}
