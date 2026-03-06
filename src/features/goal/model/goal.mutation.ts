import { useMutation, useQueryClient } from '@tanstack/react-query';

import { API, QUERY_KEYS } from '@/shared/constants';
import { api } from '@/shared/libs/api';
import { useToast } from '@/shared/hooks';

//-----------------------------------------------goal 설정 모달 안보이게 하기---------------------------------------------//
export const useHiddenGoalSetupPromptMutation = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  return useMutation({
    mutationFn: async () => {
      try {
        const res = await api.post(API.ACCOUNT.GOAL);

        if (res.error) {
          throw res.error;
        }
        return res.data;
      } catch (error) {
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.GOAL] });
    },
    onError: () => {
      showToast({ message: '요청에 실패했습니다. 계속 실패시 관리자에게 문의 주세요', variant: 'error' });
    },
  });
};
