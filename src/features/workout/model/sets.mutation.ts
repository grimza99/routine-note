import { API, QUERY_KEYS } from '@/shared/constants';
import { useToast } from '@/shared/hooks';
import { api } from '@/shared/libs/api';
import { ICardioSet, IStrengthSet } from '@routine-note/package-shared';
import { useMutation, useQueryClient } from '@tanstack/react-query';

type ISetsPayload = ICardioSet | IStrengthSet;

//sets 초기 생성
export const useSetsCreateMutation = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  return useMutation({
    mutationFn: async (payload: ISetsPayload) => {
      try {
        const res = await api.post(API.WORKOUT.SETS.CREATE(payload.id), payload);

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

//sets 수정
export const useSetsEditMutation = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  return useMutation({
    mutationFn: async (payload: ISetsPayload) => {
      try {
        const res = await api.patch(API.WORKOUT.SETS.EDIT(payload.id), payload);

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

//sets 삭제
export const useSetsDeleteMutation = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  return useMutation({
    mutationFn: async (setId: string) => {
      try {
        const res = await api.delete(API.WORKOUT.SETS.DELETE(setId));

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
