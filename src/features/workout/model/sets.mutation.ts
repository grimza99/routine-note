import { API, QUERY_KEYS } from '@/shared';
import { api } from '@/shared/libs/api';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface ISetsPayload {
  id: string; // exercise 아이디
  weight: number; // 무게
  reps: number; // 반복 횟수
}

//sets 초기 생성
export const useSetsCreateMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: ISetsPayload) => {
      try {
        const res = await api.post(API.WORKOUT.SETS.CREATE(payload.id), payload);

        if (res.error) {
          throw res.error;
        }

        return res.data;
      } catch (error) {
        //todo 에러 처리
        console.log('세트 생성 실패:', error);
        throw error;
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.WORKOUT_BY_DATE] });
      //todo 생성 후 토스트
    },
  });
};
