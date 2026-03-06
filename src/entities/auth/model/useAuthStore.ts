import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { useShallow } from 'zustand/shallow';
import { INITIAL_STATE, IAuthStore } from './useAuthStore.type';

export const useAuthStore = create<IAuthStore>()(
  devtools(
    persist(
      (set) => ({
        ...INITIAL_STATE,
        actions: {
          setAuth: (auth) => {
            set((prev) => ({ ...prev, ...auth }));
          },
          setNickname: (nickname: string) => {
            set((prev) => ({ ...prev, nickname }));
          },
          setProfileImage: (profileImage: string | null) => {
            set((prev) => ({ ...prev, profile_image: profileImage }));
          },
          setGoalWorkoutDays: (goalWorkoutDays: number | null) => {
            set((prev) => ({ ...prev, goal_workout_days: goalWorkoutDays }));
          },

          //초기화
          clearAuth: () => {
            set({
              ...INITIAL_STATE,
            });
          },
        },
      }),
      {
        name: 'auth-store',
        partialize: (state) => ({
          id: state.id,
          username: state.username,
          nickname: state.nickname,
          email: state.email,
          age: state.age,
          privacy_policy: state.privacy_policy,
          profile_image: state.profile_image,
          goal_workout_days: state.goal_workout_days,
        }),
      },
    ),
  ),
);

export function useAuthStoreActions() {
  return useAuthStore(
    useShallow((state) => ({
      setAuth: state.actions.setAuth,
      setNickname: state.actions.setNickname,
      setProfileImage: state.actions.setProfileImage,
      setGoalWorkoutDays: state.actions.setGoalWorkoutDays,
      clearAuth: state.actions.clearAuth,
    })),
  );
}
