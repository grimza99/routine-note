import { IWorkoutExercise } from '@routine-note/package-shared';

export interface IWorkoutRoutine {
  id: string;
  routineId: string;
  name: string;
  order: number;
  note?: string;
  exercises: IWorkoutExercise[];
}
