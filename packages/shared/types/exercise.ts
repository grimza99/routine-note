export type TTraining = 'CARDIO' | 'STRENGTH'; //유산소, 무산소 운동

export interface ICardioSet {
  id: string;
  type: 'DISTANCE' | 'DURATION' | 'SPEED'; //거리(km), 시간(분), 속도(km/h)
  value: number;
}

export interface IStrengthSet {
  id: string;
  weight: number; //kg 단위
  reps: number; //회 수
}

export interface IExercise {
  id: string;
  name: string;
  sets: ICardioSet[] | IStrengthSet[];
  trainingType: TTraining;
}
