import { API, QUERY_KEYS, TOAST_MESSAGE, useToast } from '@/shared';
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
  const { showToast } = useToast();
  return useMutation({
    mutationFn: async (payload: IWorkoutPayload) => {
      try {
        const res = await api.post(API.WORKOUT.CREATE, { ...payload });

        if (res.error) {
          throw res.error;
        }

        return res.data;
      } catch (error) {
        throw error;
      }
    },
    onSuccess: () => {
      showToast({ message: TOAST_MESSAGE.SUCCESS_CREATE_WORKOUT });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.WORKOUT_BY_DATE] });
    },
    onError: (error) => {
      showToast({ message: error.message, variant: 'error' });
    },
  });
};
