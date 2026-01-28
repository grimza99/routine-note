import { API, PATHS } from '@/shared';
import { api } from '@/shared/libs/api';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';

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
  const router = useRouter();
  return useMutation({
    mutationFn: async (payload: SignupPayload) => {
      const res = await api.post(API.AUTH.SIGNUP, { ...payload });

      if (res.error) {
        throw res.error;
      }

      return res.data;
    },
    onSuccess: (data) => {
      router.push(PATHS.ROUTINE.CAL);
    },
  });
};

interface LoginPayload {
  email: string;
  password: string;
}
//로그인

export const useLoginMutation = () => {
  const router = useRouter();
  return useMutation({
    mutationFn: async (payload: LoginPayload) => {
      const res = await api.post(API.AUTH.LOGIN, { ...payload });

      if (res.error) {
        throw res.error;
      }

      return res.data;
    },
    onSuccess: (data) => {
      router.push(PATHS.ROUTINE.CAL);
    },
  });
};
