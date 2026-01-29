import { API, QUERY_KEYS } from '@/shared';
import { api } from '@/shared/libs/api';
import { useQuery } from '@tanstack/react-query';

type TWorkoutReportParams = string; // 'YYYY-MM' 형식

interface IWorkoutReportResponse {
  month: string; // 'YYYY-MM' 형식
  workoutDays: number;
  totalSets: number;
  maxConsecutiveWorkoutDays: number;
  goalWorkoutDays: null;
  goalAchievementRate: null;
  weightChange: null; //todo
  skeletalMuscleMassChange: null; //todl
  bodyFatMassChange: null;
}

//운동 리포트 쿼리
export function useWorkoutQuery(params: TWorkoutReportParams) {
  return useQuery({
    queryKey: [QUERY_KEYS.WORKOUT_REPORT],
    queryFn: async () => {
      try {
        const res = await api.get<IWorkoutReportResponse>(API.WORKOUT.REPORT(params));

        return res.data;
      } catch (error) {
        //todo 에러 처리
        console.log('운동 리포트 조회 실패:', error);
        throw error;
      }
    },
  });
}
