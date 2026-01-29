import { API, QUERY_KEYS } from '@/shared';
import { api } from '@/shared/libs/api';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface ICreateRoutinePayload {
  routineName: string;
  exercises: { exerciseName: string }[];
}

//루틴 생성
export const useCreateRoutineMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: ICreateRoutinePayload) => {
      try {
        const res = await api.post(API.ROUTINE.CREATE, { ...payload });

        if (res.error) {
          throw res.error;
        }

        return res.data;
      } catch (error) {
        //todo 에러 처리
        console.log('루틴 생성 실패:', error);
        throw error;
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ROUTINE.LIST] });
      //todo 생성 후 토스트
    },
  });
};
