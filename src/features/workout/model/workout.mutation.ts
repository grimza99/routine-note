import { API, QUERY_KEYS } from '@/shared';
import { api } from '@/shared/libs/api';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface IWorkoutPayload {
  date: string; // YYYY-MM-DD
  routines: { routineId: string; note?: '' }[];
  exercises: { exerciseName: string; note?: '' }[];
}

//workout 생성
export const useCreateWorkoutMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: IWorkoutPayload) => {
      try {
        const res = await api.post(API.WORKOUT.CREATE, { ...payload });

        if (res.error) {
          throw res.error;
        }

        return res.data;
      } catch (error) {
        //todo 에러 처리
        console.log('워크아웃 생성 실패:', error);
        throw error;
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.WORKOUT_BY_DATE] });
      //todo 생성 후 토스트
    },
  });
};
