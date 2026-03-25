import { IExercise, IWorkoutExercise } from './exercise';

export interface IRoutine {
  routineId: string;
  name: string;
  exercises: IExercise[];
}

export interface IWorkoutRoutine extends IRoutine {
  note: string;
  exercises: IWorkoutExercise[];
}
