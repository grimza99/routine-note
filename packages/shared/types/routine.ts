import { IExercise, IWorkoutExercise, TTraining } from './exercise';

export interface IRoutine {
  routineId: string;
  name: string;
  exercises: IExercise[];
}

export interface IWorkoutRoutine extends IRoutine {
  note: string;
  exercises: IWorkoutExercise[];
}

export interface RoutinePayload {
  name: string;
  exercises: {
    name: string;
    order?: number;
    trainingType: TTraining;
  }[];
}
