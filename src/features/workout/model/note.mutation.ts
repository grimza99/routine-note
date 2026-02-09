import { API, QUERY_KEYS, useToast } from '@/shared';
import { api } from '@/shared/libs/api';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface INotePayload {
  note: string;
}

//note 생성,수정
export const useNoteMutation = (workoutRoutineId: string) => {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  return useMutation({
    mutationFn: async (payload: INotePayload) => {
      if (!workoutRoutineId) {
        throw new Error('워크아웃 루틴 ID가 필요합니다.');
      }
      try {
        const res = await api.patch(API.WORKOUT.NOTE.ROUTINE(workoutRoutineId), { ...payload });

        if (res.error) {
          throw res.error;
        }

        return res.data;
      } catch (error) {
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.WORKOUT_BY_DATE] });
    },
    onError: (error) => {
      showToast({ message: error.message, variant: 'error' });
    },
  });
};
