import { TTraining } from './exercise';

export interface IWorkoutPayload {
  date: string; // YYYY-MM-DD
  routines: { id: string; note?: '' }[];
  standalone_exercises: { name: string; trainingType: TTraining }[];
}
