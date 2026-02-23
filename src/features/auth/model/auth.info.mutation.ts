import { useAuthStoreActions } from '@/entities/auth/model/useAuthStore';
import { API, QUERY_KEYS } from '@/shared/constants';
import { api } from '@/shared/libs/api';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface MyInfoPayload {
  nickname: string;
  goalWorkoutDays?: number | null;
}
interface MyInfoResponse {
  nickname: string;
  month: string;
  goalWorkoutDays: number;
}

//-----------------------------------------------내정보수정---------------------------------------------//
export const useMyInfoMutation = () => {
  const { setNickname } = useAuthStoreActions();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: MyInfoPayload) => {
      try {
        const res = await api.patch<MyInfoResponse>(API.ACCOUNT.PROFILE, payload);

        if (res.error) {
          throw res.error;
        }

        return res.data;
      } catch (error) {
        throw error;
      }
    },
    onSuccess: (data) => {
      if (data) {
        setNickname(data.nickname);
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.WORKOUT_REPORT] });
      }
    },
  });
};
