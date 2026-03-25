import { IMonthlyReport, IWorkoutBydateResponse } from '@routine-note/package-shared';
import { useQuery } from '@tanstack/react-query';

import { API, QUERY_KEYS } from '@/shared/constants';
import { api } from '@/shared/libs/api';

type TWorkoutReportParams = string; // 'YYYY-MM-DD' 형식

//------------------------------------운동 리포트 쿼리------------------------------------
export function useWorkoutQuery(params: TWorkoutReportParams) {
  return useQuery({
    queryKey: [QUERY_KEYS.WORKOUT_REPORT, params],
    queryFn: async () => {
      try {
        const res = await api.get<IMonthlyReport>(API.WORKOUT.REPORT(params));

        return res.data;
      } catch (error) {
        throw error;
      }
    },
  });
}
//------------------------------------날짜별 운동 조회 쿼리------------------------------------

export function useWorkoutByDate(params: TWorkoutReportParams) {
  return useQuery({
    queryKey: [QUERY_KEYS.WORKOUT_BY_DATE, params],
    queryFn: async () => {
      try {
        const res = await api.get<IWorkoutBydateResponse>(API.WORKOUT.BY_DATE(params));
        return res.data;
      } catch (error) {
        throw error;
      }
    },
  });
}
