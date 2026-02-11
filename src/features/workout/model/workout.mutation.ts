import { API, QUERY_KEYS, TOAST_MESSAGE, useToast } from '@/shared';
import { api } from '@/shared/libs/api';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface IWorkoutPayload {
  date: string; // YYYY-MM-DD
  routines: { routineId: string; note?: '' }[];
  exercises: { exerciseName: string; note?: '' }[];
}

//-----------------------------------------------workout 생성---------------------------------------------//

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

//-----------------------------------------------workout 수정---------------------------------------------//
export const useUpdateWorkoutMutation = (workoutId: string | undefined) => {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  return useMutation({
    mutationFn: async (payload: IWorkoutPayload) => {
      if (!workoutId) {
        throw new Error('Invalid workout ID');
      }
      try {
        const res = await api.put(API.WORKOUT.UPDATE(workoutId), payload);

        if (res.error) {
          throw res.error;
        }

        return res.data;
      } catch (error) {
        throw error;
      }
    },
    onSuccess: () => {
      showToast({ message: TOAST_MESSAGE.SUCCESS_UPDATE_WORKOUT });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.WORKOUT_BY_DATE] });
    },
    onError: (error) => {
      showToast({ message: error.message, variant: 'error' });
    },
  });
};

//-----------------------------------------------workout 삭제---------------------------------------------//
export const useDeleteWorkoutMutation = (workoutId: string | undefined) => {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  return useMutation({
    mutationFn: async () => {
      if (!workoutId) {
        throw new Error('Invalid workout ID');
      }
      try {
        const res = await api.delete(API.WORKOUT.DELETE(workoutId));

        if (res.error) {
          throw res.error;
        }
        return res.data;
      } catch (error) {
        throw error;
      }
    },
    onSuccess: () => {
      showToast({ message: TOAST_MESSAGE.SUCCESS_DELETE_WORKOUT });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.WORKOUT_BY_DATE] });
    },
    onError: (error) => {
      showToast({ message: error.message, variant: 'error' });
    },
  });
};
