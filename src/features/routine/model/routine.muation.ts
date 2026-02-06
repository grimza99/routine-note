import { API, QUERY_KEYS, TOAST_MESSAGE, useToast } from '@/shared';
import { api } from '@/shared/libs/api';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface IRoutinePayload {
  routineName: string;
  exercises: { exerciseName: string }[];
}

//루틴 생성
export const useCreateRoutineMutation = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  return useMutation({
    mutationFn: async (payload: IRoutinePayload) => {
      try {
        const res = await api.post(API.ROUTINE.CREATE, { ...payload });

        if (res.error) {
          throw res.error;
        }

        return res.data;
      } catch (error) {
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ROUTINE.LIST] });
      showToast({ message: TOAST_MESSAGE.SUCCESS_CREATE_ROUTINE });
    },
    onError: (error) => {
      showToast({ message: error.message, variant: 'error' });
    },
  });
};

//루틴 수정
export const useEditRoutineMutation = (routineId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: IRoutinePayload) => {
      try {
        const res = await api.patch(API.ROUTINE.EDIT(routineId), { ...payload });

        if (res.error) {
          throw res.error;
        }

        return res.data;
      } catch (error) {
        //todo 에러 처리
        console.log('루틴 수정 실패:', error);
        throw error;
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ROUTINE.LIST] });
      //todo 수정 후 토스트
    },
  });
};
