import { supabaseClient } from '@/shared/libs/supabase';

type ApiError = {
  code: string;
  message: string;
};

type ApiEnvelope<T> = {
  data: T | null;
  error: ApiError | null;
};

type AuthSessionPayload = {
  access_token?: string | null;
  token?: string | null;
};

const getCookieValue = (name: string) => {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.split('; ').find((cookie) => cookie.startsWith(`${name}=`));
  if (!match) return null;
  return decodeURIComponent(match.split('=').slice(1).join('='));
};

const setCookieValue = (name: string, value: string) => {
  if (typeof document === 'undefined') return;
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  document.cookie = `${name}=${encodeURIComponent(value)}; Path=/; SameSite=Lax${secure}`;
};

const applyAccessTokenCookieFromResponse = (payload: unknown) => {
  if (!payload || typeof payload !== 'object') return;

  const data = payload as AuthSessionPayload;
  const accessToken = data.access_token ?? data.token ?? null;
  if (!accessToken) return;
  setCookieValue('sb_access_token', accessToken);
};

const getAccessToken = async () => {
  const cookieToken = getCookieValue('sb_access_token');
  if (cookieToken) return cookieToken;
  const { data } = await supabaseClient.auth.getSession();
  return data.session?.access_token ?? null;
};

export const apiFetch = async <TResponse>(
  input: string,
  init: RequestInit & { auth?: boolean } = {},
): Promise<ApiEnvelope<TResponse>> => {
  const { auth = true, headers, ...rest } = init;
  const token = auth ? await getAccessToken() : null;

  const response = await fetch(input, {
    ...rest,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(headers ?? {}),
    },
  });

  const json = (await response.json().catch(() => null)) as TResponse | { error?: ApiError } | null;

  if (!response.ok) {
    const serverError =
      json && typeof json === 'object' && 'error' in json ? (json.error as ApiError | undefined) : undefined;

    return {
      data: null,
      error: serverError ?? {
        code: 'HTTP_ERROR',
        message: response.statusText || 'Request failed',
      },
    };
  }

  applyAccessTokenCookieFromResponse(json);

  return {
    data: json as TResponse | null,
    error: null,
  };
};

type ApiOptions = Omit<RequestInit, 'body' | 'method'> & { auth?: boolean };

const withQuery = (url: string, query?: Record<string, string | number | boolean | null | undefined>) => {
  if (!query) {
    return url;
  }

  const searchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(query)) {
    if (value === null || value === undefined) {
      continue;
    }

    searchParams.set(key, String(value));
  }

  const queryString = searchParams.toString();

  if (!queryString) {
    return url;
  }

  return `${url}?${queryString}`;
};

export const api = {
  get: <TResponse>(url: string, options: ApiOptions = {}) => apiFetch<TResponse>(url, { ...options, method: 'GET' }),
  getWithQuery: <TResponse>(
    url: string,
    query?: Record<string, string | number | boolean | null | undefined>,
    options: ApiOptions = {},
  ) => apiFetch<TResponse>(withQuery(url, query), { ...options, method: 'GET' }),
  post: <TResponse, TBody = unknown>(url: string, body?: TBody, options: ApiOptions = {}) =>
    apiFetch<TResponse>(url, {
      ...options,
      method: 'POST',
      body: body === undefined ? undefined : JSON.stringify(body),
    }),
  patch: <TResponse, TBody = unknown>(url: string, body?: TBody, options: ApiOptions = {}) =>
    apiFetch<TResponse>(url, {
      ...options,
      method: 'PATCH',
      body: body === undefined ? undefined : JSON.stringify(body),
    }),
  delete: <TResponse>(url: string, options: ApiOptions = {}) =>
    apiFetch<TResponse>(url, { ...options, method: 'DELETE' }),
};
