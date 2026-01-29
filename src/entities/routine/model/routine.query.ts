import { API, IRoutine, QUERY_KEYS } from '@/shared';
import { api } from '@/shared/libs/api';
import { useQuery } from '@tanstack/react-query';

interface IRoutineResponse {
  routineId: string;
  routineName: string;
  exercises: [
    { id: 'ri1'; exerciseId: 'ex1'; exerciseName: '벤치프레스'; order: 1; setCount: 4 },
    { id: 'ri2'; exerciseId: 'ex2'; exerciseName: '풀다운'; order: 2; setCount: 3 },
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
