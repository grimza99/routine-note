import { apiClient } from '../../../shared/libs/network';
import { tokenStorage } from '../../../shared/libs/storage/tokenStorage';
import type { LoginPayload, LoginResponse } from '../../../shared/types/auth';

export const authApi = {
  async login(payload: LoginPayload) {
    const response = await apiClient.request<LoginResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
      auth: false,
    });

    if (response.error || !response.data?.access_token) {
      throw new Error(response.error?.message ?? '로그인에 실패했습니다.');
    }

    if (!response.data.refresh_token) {
      await tokenStorage.clear();
      throw new Error('로그인 응답에 refresh token이 없습니다.');
    }

    await tokenStorage.save({
      accessToken: response.data.access_token,
      refreshToken: response.data.refresh_token,
    });

    return response.data;
  },

  async logout() {
    await apiClient.request('/api/auth/logout', {
      method: 'POST',
    });
    await tokenStorage.clear();
  },
};
