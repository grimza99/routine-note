import { API, QUERY_KEYS } from '@/shared';
import { api } from '@/shared/libs/api';
import { useQuery } from '@tanstack/react-query';

interface IRoutineResponse {
  routineId: string;
  routineName: string;
  exercises: [
    { id: string; exerciseId: string; exerciseName: string; order: number },
    { id: string; exerciseId: string; exerciseName: string; order: number },
  ];
}

//루틴 리스트 쿼리
export function useRoutineList() {
  return useQuery({
    queryKey: [QUERY_KEYS.ROUTINE.LIST],
    queryFn: async () => {
      try {
        const res = await api.get<IRoutineResponse[]>(API.ROUTINE.LIST);

        return res.data;
      } catch (error) {
        //todo 에러 처리
        console.log('루틴 리스트 조회 실패:', error);
        throw error;
      }
    },
  });
}

//루틴 디테일 쿼리
export function useRoutineDetailQuery(routineId: string) {
  return useQuery({
    queryKey: [QUERY_KEYS.ROUTINE.DETAIL, routineId],
    enabled: Boolean(routineId),
    queryFn: async () => {
      try {
        const res = await api.get<IRoutineResponse>(API.ROUTINE.DETAIL(routineId));

        return res.data;
      } catch (error) {
        //todo 에러 처리
        console.log('루틴 상세 조회 실패:', error);
        throw error;
      }
    },
  });
}
