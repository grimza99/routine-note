export interface IExercise {
  id: string;
  exerciseId: string;
  note: string;
  name: string;
  sets: [{ id: 's1'; weight: 80; reps: 8; note: '' }, { id: 's2'; weight: 80; reps: 8; note: '' }];
}

export interface IRoutine {
  id: string;
  routineId: string;
  routineName: string;
  order: number;
  exercises: IExercise[];
}
