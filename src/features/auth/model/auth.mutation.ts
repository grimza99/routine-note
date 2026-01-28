import { API } from '@/shared';
import { api } from '@/shared/libs/api';
import { useMutation } from '@tanstack/react-query';

interface SignupPayload {
  username: string;
  email: string;
  nickname: string | null;
  password: string;
  age: number;
  policy_policy: boolean;
}
//회원가입
export const useSignupMutation = () => {
  return useMutation({
    mutationFn: async (payload: SignupPayload) => {
      const res = await api.post(API.AUTH.SIGNUP, { ...payload });

      return res.data;
    },
  });
};

interface LoginPayload {
  email: string;
  password: string;
}
//로그인

export const useLoginMutation = () => {
  return useMutation({
    mutationFn: async (payload: LoginPayload) => {
      const res = await api.post(API.AUTH.LOGIN, { ...payload });

      return res.data;
    },
  });
};
