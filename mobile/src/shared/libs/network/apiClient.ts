import { Platform } from 'react-native';

import { appEnv } from '../../config/env';
import { CLIENT_PLATFORM, MOBILE_META_HEADERS } from '../../constants/headers';
import { tokenStorage } from '../storage/tokenStorage';

type ApiError = {
  code: string;
  message: string;
};

type ApiEnvelope<T> = {
  data: T | null;
  error: ApiError | null;
};

type AuthRefreshResponse = {
  token?: string;
  refresh_token?: string;
};

const getPlatformHeader = () => (Platform.OS === 'ios' ? CLIENT_PLATFORM.IOS : CLIENT_PLATFORM.ANDROID);

let refreshInFlight: Promise<boolean> | null = null;

const refreshAccessToken = async (): Promise<boolean> => {
  if (refreshInFlight) {
    return refreshInFlight;
  }

  refreshInFlight = (async () => {
    const tokens = await tokenStorage.read();
    if (!tokens?.refreshToken) {
      return false;
    }

    const response = await fetch(`${appEnv.apiBaseUrl}/api/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        [MOBILE_META_HEADERS.PLATFORM]: getPlatformHeader(),
        [MOBILE_META_HEADERS.APP_VERSION]: appEnv.appVersion,
        [MOBILE_META_HEADERS.APP_BUILD]: appEnv.appBuild,
      },
      body: JSON.stringify({ refreshToken: tokens.refreshToken }),
    });

    if (!response.ok) {
      return false;
    }

    const payload = (await response.json().catch(() => null)) as AuthRefreshResponse | null;
    if (!payload?.token) {
      return false;
    }

    await tokenStorage.save({
      accessToken: payload.token,
      refreshToken: payload.refresh_token ?? tokens.refreshToken,
    });

    return true;
  })();

  try {
    return await refreshInFlight;
  } finally {
    refreshInFlight = null;
  }
};

export const apiClient = {
  async request<TResponse>(
    path: string,
    init: RequestInit & { auth?: boolean; retry?: boolean } = {},
  ): Promise<ApiEnvelope<TResponse>> {
    const { auth = true, retry = false, headers, ...rest } = init;
    const tokens = auth ? await tokenStorage.read() : null;

    const response = await fetch(`${appEnv.apiBaseUrl}${path}`, {
      ...rest,
      headers: {
        'Content-Type': 'application/json',
        ...(tokens?.accessToken ? { Authorization: `Bearer ${tokens.accessToken}` } : {}),
        [MOBILE_META_HEADERS.PLATFORM]: getPlatformHeader(),
        [MOBILE_META_HEADERS.APP_VERSION]: appEnv.appVersion,
        [MOBILE_META_HEADERS.APP_BUILD]: appEnv.appBuild,
        ...(headers ?? {}),
      },
    });

    const payload = (await response.json().catch(() => null)) as TResponse | { error?: ApiError } | null;

    if (!response.ok) {
      if (response.status === 401 && auth && !retry) {
        const refreshed = await refreshAccessToken();
        if (refreshed) {
          return apiClient.request<TResponse>(path, { ...init, retry: true });
        }
      }

      const error = payload && typeof payload === 'object' && 'error' in payload ? (payload.error ?? null) : null;
      return {
        data: null,
        error: error ?? {
          code: 'HTTP_ERROR',
          message: response.statusText,
        },
      };
    }

    return {
      data: payload as TResponse,
      error: null,
    };
  },
};
