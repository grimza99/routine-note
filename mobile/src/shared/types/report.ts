export interface IMonthlyReportResponse {
  month: string; // 'YYYY-MM' 형식
  workoutDays: number;
  totalSets: number;
  maxConsecutiveWorkoutDays: number;
  goalWorkoutDays: null | number;
  goalAchievementRate: null;
  weightChange: null; //todo
  skeletalMuscleMassChange: null; //todl
  bodyFatMassChange: null;
  workoutDates: string[]; // 'YYYY-MM-DD' 형식의 날짜 배열
}
