export interface IExercise {
  //todo 두개의 인터페이스는 record 된 데이터의 타입임
  id: string;
  name: string;
  note?: string;
  sets: { id: string; weight: number; reps: number; note?: string }[];
}

export interface IRoutine {
  id: string;
  routineId: string;
  routineName: string;
  order: number;
  exercises: IExercise[];
  note?: string;
}
