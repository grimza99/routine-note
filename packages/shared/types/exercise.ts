import { ICardioSet, IStrengthSet } from './set';
export type TTraining = 'CARDIO' | 'STRENGTH'; //유산소, 무산소 운동

export interface IExercise {
  id: string;
  name: string;
  trainingType: TTraining;
}

export interface IWorkoutExercise extends IExercise {
  sets: (ICardioSet | IStrengthSet)[];
}
