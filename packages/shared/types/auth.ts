export interface ISignupPayload {
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
  nickname: string | null;
  age: number | null;
  privacy_policy: boolean | null;
  access_token: string | null;
  profile_image: string | null;
}

export interface IAuthMobileResponse extends IAuthResponse {
  refresh_token: string | null;
}
