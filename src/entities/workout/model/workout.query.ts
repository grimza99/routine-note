import { API, QUERY_KEYS } from '@/shared/constants';
import { api } from '@/shared/libs/api';
import { IExercise, IRoutine } from '@/shared/types';
import { useQuery } from '@tanstack/react-query';

type TWorkoutReportParams = string; // 'YYYY-MM-DD' 형식

interface IWorkoutReportResponse {
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

//------------------------------------운동 리포트 쿼리------------------------------------
export function useWorkoutQuery(params: TWorkoutReportParams) {
  return useQuery({
    queryKey: [QUERY_KEYS.WORKOUT_REPORT, params],
    queryFn: async () => {
      try {
        const res = await api.get<IWorkoutReportResponse>(API.WORKOUT.REPORT(params));

        return res.data;
      } catch (error) {
        throw error;
      }
    },
  });
}
//------------------------------------날짜별 운동 조회 쿼리------------------------------------
interface IWorkoutByDateResponse {
  id: string; // workoutId
  date: string; // 'YYYY-MM-DD' 형식
  routines: IRoutine[];
  exercises: IExercise[]; // 루틴에 속하지 않은 운동들
}

export function useWorkoutByDate(params: TWorkoutReportParams) {
  return useQuery({
    queryKey: [QUERY_KEYS.WORKOUT_BY_DATE, params],
    queryFn: async () => {
      try {
        const res = await api.get<IWorkoutByDateResponse>(API.WORKOUT.BY_DATE(params));
        return res.data;
      } catch (error) {
        throw error;
      }
    },
  });
}
