/** 스토어 상태 인터페이스 */

import { IAuthResponse } from '@/features/auth';

export interface IAuthStoreState extends Omit<IAuthResponse, 'access_token'> {}

export const INITIAL_STATE: IAuthStoreState = {
  id: '',
  username: '',
  nickname: '',
  email: '',
  age: 0,
  privacy_policy: false,
  profile_image: null,
};

/** 스토어 액션 인터페이스 */
interface IAuthAction {
  actions: {
    setAuth: (auth: IAuthStoreState) => void;
    setNickname: (nickname: string) => void;
    setProfileImage: (profileImage: string | null) => void;
    clearAuth: () => void;
  };
}

export type IAuthStore = IAuthStoreState & IAuthAction;
