import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { useShallow } from 'zustand/shallow';
import { INITIAL_STATE, IAuthStore } from './useAuthStore.type';

const useAuthStore = create<IAuthStore>()(
  devtools(
    persist(
      (set) => ({
        ...INITIAL_STATE,
        actions: {
          setAuth: (auth) => {
            set({
              ...auth,
            });
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
          ...state,
        }),
      },
    ),
  ),
);

export function useAuthStoreActions() {
  return useAuthStore(
    useShallow((state) => ({
      setAuth: state.actions.setAuth,
      clearAuth: state.actions.clearAuth,
    })),
  );
}

export default useAuthStore;
