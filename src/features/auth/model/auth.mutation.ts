'use client';
import { useAuthStoreActions } from '@/entities/auth/model/useAuthStore';
import { API, PATHS, TOAST_MESSAGE, useToast } from '@/shared';
import { TOKEN } from '@/shared/constants';
import { api, deleteCookieValue } from '@/shared/libs/api';
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
const getSafeRedirectPath = (redirectTo?: string) => {
  if (!redirectTo) return PATHS.ROUTINE.CAL;
  if (!redirectTo.startsWith('/')) return PATHS.ROUTINE.CAL;
  if (redirectTo.startsWith('//')) return PATHS.ROUTINE.CAL;
  return redirectTo;
};

export const useLoginMutation = (redirectTo?: string) => {
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
      router.push(getSafeRedirectPath(redirectTo));
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
      router.push(PATHS.HOME);
      deleteCookieValue(TOKEN.ACCESS);
      queryClient.clear();
      clearAuth();
    },
  });
};

//-----------------------------------------------비밀번호 리셋 메일 발송---------------------------------------------//

export const usePasswordResetMutation = () => {
  const { showToast } = useToast();
  return useMutation({
    mutationFn: async () => {
      try {
        const res = await api.post(API.AUTH.PASSWORD_RESET_REQUEST);
        if (res.error) {
          throw res.error;
        }
        return res.data;
      } catch (error) {
        throw error;
      }
    },
    onSuccess: () => {
      showToast({ message: TOAST_MESSAGE.SUCCESS_PASSWORD_RESET_REQUEST });
    },
    onError: () => {
      showToast({ message: '비밀번호 재설정 이메일 전송에 실패 했습니다.', variant: 'error' });
    },
  });
};
//-----------------------------------------------비밀번호 리셋---------------------------------------------//

interface PasswordResetConfirmPayload {
  newPassword: string;
}
export const usePasswordResetConfirmMutation = () => {
  const queryClient = useQueryClient();
  const { clearAuth } = useAuthStoreActions();
  const { showToast } = useToast();

  const router = useRouter();
  return useMutation({
    mutationFn: async (payload: PasswordResetConfirmPayload) => {
      try {
        const res = await api.post(API.AUTH.PASSWORD_RESET_CONFIRM, payload);
        if (res.error) {
          throw res.error;
        }
        return res.data;
      } catch (error) {
        throw error;
      }
    },
    onSuccess: () => {
      router.replace(PATHS.AUTH);
      deleteCookieValue(TOKEN.ACCESS);
      queryClient.clear();
      clearAuth();
      showToast({ message: TOAST_MESSAGE.SUCCESS_PASSWORD_RESET_CONFIRM });
    },
    onError: () => {
      showToast({ message: '비밀번호 재설정에 실패 했습니다.', variant: 'error' });
    },
  });
};
