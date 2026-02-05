import { useAuthStoreActions } from '@/entities/auth/model/useAuthStore';
import { API, PATHS, TOAST_MESSAGE, useToast } from '@/shared';
import { api } from '@/shared/libs/api';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';

interface SignupPayload {
  username: string;
  email: string;
  nickname: string | null;
  password: string;
  age: number;
  policy_policy: boolean;
}

export interface IAuthResponse {
  id: string;
  email: string;
  username: string;
  nickname: string;
  age: number;
  privacy_policy: boolean;
  access_token: string;
  profile_image: string | null;
}

//회원가입
export const useSignupMutation = () => {
  const router = useRouter();
  const { showToast } = useToast();
  const { setAuth } = useAuthStoreActions();

  return useMutation({
    mutationFn: async (payload: SignupPayload) => {
      try {
        const res = await api.post<IAuthResponse>(API.AUTH.SIGNUP, { ...payload });

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
        setAuth({
          id: data.id,
          username: data.username,
          nickname: data.nickname,
          email: data.email,
          age: data.age,
          privacy_policy: data.privacy_policy,
          profile_image: data.profile_image,
        });
      }
      showToast({ message: TOAST_MESSAGE.SUCCESS_SIGNUP });
      router.push(PATHS.ROUTINE.CAL);
    },
    onError: (err) => {
      showToast({ message: err.message, variant: 'error' });
    },
  });
};

//-----------------------------------------------로그인---------------------------------------------//
interface LoginPayload {
  email: string;
  password: string;
}

export const useLoginMutation = () => {
  const router = useRouter();
  const { showToast } = useToast();
  const { setAuth } = useAuthStoreActions();

  return useMutation({
    mutationFn: async (payload: LoginPayload) => {
      try {
        const res = await api.post<IAuthResponse>(API.AUTH.LOGIN, { ...payload });

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
        setAuth({
          id: data.id,
          username: data.username,
          nickname: data.nickname,
          email: data.email,
          age: data.age,
          privacy_policy: data.privacy_policy,
          profile_image: data.profile_image,
        });
      }
      router.push(PATHS.ROUTINE.CAL);
      showToast({ message: TOAST_MESSAGE.SUCCESS_LOGIN });
    },
    onError: (err) => {
      showToast({ message: err.message, variant: 'error' });
    },
  });
};

//-----------------------------------------------로그아웃---------------------------------------------//
export const useLogoutMutation = () => {
  const router = useRouter();
  const { clearAuth } = useAuthStoreActions();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const res = await api.post(API.AUTH.LOGOUT);

      if (res.error) {
        throw res.error;
      }

      return res.data;
    },
    onSuccess: () => {
      queryClient.clear();
      clearAuth();
      router.push('/auth');
    },
  });
};
