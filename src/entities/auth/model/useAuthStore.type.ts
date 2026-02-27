/** 스토어 상태 인터페이스 */

import { IAuthResponse } from '@/features/auth';

export interface IAuthStoreState extends Omit<IAuthResponse, 'access_token'> {}
interface IGoalState {
  goal_workout_days: number | null;
  hidden_goal_setup_prompt: boolean;
}

export const INITIAL_STATE: IAuthStoreState & IGoalState = {
  id: '',
  username: '',
  nickname: '',
  email: '',
  age: 0,
  privacy_policy: false,
  profile_image: null,
  goal_workout_days: null,
  hidden_goal_setup_prompt: false,
};

/** 스토어 액션 인터페이스 */
interface IAuthAction {
  actions: {
    setAuth: (auth: IAuthStoreState) => void;
    setNickname: (nickname: string) => void;
    setProfileImage: (profileImage: string | null) => void;
    setGoalWorkoutDays: (goalWorkoutDays: number | null) => void;
    setHiddenGoalSetupPrompt: (hidden: boolean) => void;
    clearAuth: () => void;
  };
}

export type IAuthStore = IAuthStoreState & IAuthAction & IGoalState;
