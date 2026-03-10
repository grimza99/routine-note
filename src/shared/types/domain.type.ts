import { IExercise } from '@routine-note/package-shared';

export interface IRoutine {
  id: string;
  routineId: string;
  name: string;
  order: number;
  exercises: IExercise[];
  note?: string;
}
