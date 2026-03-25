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

export type TSetPayload = ICardioSet | IStrengthSet;
export type TSetResponse = TSetPayload;
