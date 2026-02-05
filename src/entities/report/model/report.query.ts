import { API, QUERY_KEYS } from '@/shared';
import { api } from '@/shared/libs/api';
import { useQuery } from '@tanstack/react-query';

interface MonthReportData {
  month: string; // "2023-08"
  workoutDays: number;
  totalSets: number;
  maxConsecutiveWorkoutDays: number;
  goalWorkoutDays: null | number;
  goalAchievementRate: null | number;
  weightChange: null | number;
  skeletalMuscleMassChange: null | number;
  bodyFatMassChange: null | number;
}
//모든 달 리포트 쿼리
export function useAllMonthReportsQuery() {
  return useQuery({
    queryKey: [QUERY_KEYS.REPORT.MONTHLY_ALL],
    queryFn: async () => {
      try {
        const res = await api.get<MonthReportData[]>(API.REPORT.MONTHLY_ALL);

        return res.data;
      } catch (error) {
        //todo 에러 처리
        console.log('이전달 리포트 리스트 조회 실패:', error);
        throw error;
      }
    },
  });
}
