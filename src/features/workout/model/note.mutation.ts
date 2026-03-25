import { useMutation, useQueryClient } from '@tanstack/react-query';
import { IWorkoutRoutineNotePayload, IWorkoutRoutineNoteResponse } from '@routine-note/package-shared';

import { API, QUERY_KEYS } from '@/shared/constants';
import { useToast } from '@/shared/hooks';
import { api } from '@/shared/libs/api';

//note 생성,수정
export const useNoteMutation = (workoutRoutineId: string) => {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  return useMutation({
    mutationFn: async (payload: IWorkoutRoutineNotePayload) => {
      if (!workoutRoutineId) {
        throw new Error('워크아웃 루틴 ID가 필요합니다.');
      }
      try {
        const res = await api.patch<IWorkoutRoutineNoteResponse>(API.WORKOUT.NOTE.ROUTINE(workoutRoutineId), {
          ...payload,
        });

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
