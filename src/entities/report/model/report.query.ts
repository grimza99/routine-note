import { API, QUERY_KEYS } from '@/shared';
import { api } from '@/shared/libs/api';
import { useQuery } from '@tanstack/react-query';

//모든 달 리포트 쿼리
export function useAllMonthReports() {
  return useQuery({
    queryKey: [QUERY_KEYS.ROUTINE.LIST],
    queryFn: async () => {
      try {
        const res = await api.get(API.ROUTINE.LIST);

        return res.data;
      } catch (error) {
        //todo 에러 처리
        console.log('루틴 리스트 조회 실패:', error);
        throw error;
      }
    },
  });
}
