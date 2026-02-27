import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useAuthStoreActions } from '@/entities';
import { API, TOAST_MESSAGE } from '@/shared/constants';
import { useToast } from '@/shared/hooks';
import { api } from '@/shared/libs/api';

interface IGoalPayload {
  goalWorkoutDays: number;
}

export const useCreateGoalMutation = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const { setGoalWorkoutDays } = useAuthStoreActions();
  return useMutation({
    mutationFn: async (payload: IGoalPayload) => {
      try {
        const res = await api.patch<{ month: string; goalWorkoutDays: number }>(API.ACCOUNT.PROFILE, payload);

        if (res.error) {
          throw res.error;
        }

        return res.data;
      } catch (error) {
        throw error;
      }
    },
    onSuccess: (data) => {
      setGoalWorkoutDays(data?.goalWorkoutDays || 0);
      showToast({ message: TOAST_MESSAGE.SUCCESS_CREATE_GOAL });
      queryClient.clear();
    },
    onError: (error) => {
      showToast({ message: error.message, variant: 'error' });
    },
  });
};
