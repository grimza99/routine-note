export interface AuthTokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  id: string;
  email: string;
  username: string;
  nickname: string;
  age: number;
  privacy_policy: boolean;
  access_token: string;
  refresh_token: string | null;
}
