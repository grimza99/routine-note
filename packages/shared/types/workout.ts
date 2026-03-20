import { IWorkoutExercise, TTraining } from './exercise';
import { IWorkoutRoutine } from './routine';

export interface IWorkoutPayload {
  date: string; // YYYY-MM-DD
  routines: { id: string; note?: '' }[];
  standalone_exercises: { name: string; trainingType: TTraining }[];
}

export interface WorkoutBydateResponse {
  id: string;
  date: string;
  routines: IWorkoutRoutine[];
  standalone_exercises: IWorkoutExercise[];
}
