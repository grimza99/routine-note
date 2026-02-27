import { API, QUERY_KEYS } from '@/shared/constants';
import { api } from '@/shared/libs/api';
import { useQuery } from '@tanstack/react-query';

//-----------------------------------------------이번 달 목표 조회---------------------------------------------//

export function useCurrentMonthGoal() {
  return useQuery({
    queryKey: [QUERY_KEYS.CHALLENGE.MONTHLY_RANK],
    queryFn: async () => {
      try {
        const res = await api.get<{ month: string; goalWorkoutDays: string }>(API.ACCOUNT.GOAL);
        return res.data;
      } catch (error) {
        console.error('이번달 목표 조회 실패:', error);
        throw error;
      }
    },
  });
}
