import { API, PATHS, TOAST_MESSAGE, useToast } from '@/shared';
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
  const { showToast } = useToast();
  return useMutation({
    mutationFn: async (payload: SignupPayload) => {
      try {
        const res = await api.post(API.AUTH.SIGNUP, { ...payload });

        if (res.error) {
          throw res.error;
        }

        return res.data;
      } catch (error) {
        throw error;
      }
    },
    onSuccess: () => {
      showToast({ message: TOAST_MESSAGE.SUCCESS_SIGNUP });
      router.push(PATHS.ROUTINE.CAL);
    },
    onError: (err) => {
      showToast({ message: err.message, variant: 'error' });
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
  const { showToast } = useToast();
  return useMutation({
    mutationFn: async (payload: LoginPayload) => {
      try {
        const res = await api.post(API.AUTH.LOGIN, { ...payload });

        if (res.error) {
          throw res.error;
        }

        return res.data;
      } catch (error) {
        throw error;
      }
    },
    onSuccess: () => {
      router.push(PATHS.ROUTINE.CAL);
      showToast({ message: TOAST_MESSAGE.SUCCESS_LOGIN });
    },
    onError: (err) => {
      showToast({ message: err.message, variant: 'error' });
    },
  });
};

// 로그아웃
export const useLogoutMutation = () => {
  const router = useRouter();
  return useMutation({
    mutationFn: async () => {
      const res = await api.post(API.AUTH.LOGOUT);

      if (res.error) {
        throw res.error;
      }

      return res.data;
    },
    onSuccess: () => {
      router.push('/auth');
    },
  });
};
