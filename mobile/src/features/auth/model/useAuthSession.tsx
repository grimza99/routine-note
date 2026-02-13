import { createContext, PropsWithChildren, useContext, useEffect, useMemo, useState } from 'react';

import { authApi } from '../api/authApi';
import { trackEvent } from '../../../shared/libs/analytics/track';
import { tokenStorage } from '../../../shared/libs/storage/tokenStorage';

type AuthContextValue = {
  isInitialized: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider = ({ children }: PropsWithChildren) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const bootstrap = async () => {
      const tokens = await tokenStorage.read();
      setIsAuthenticated(Boolean(tokens?.accessToken));
      setIsInitialized(true);
      void trackEvent('app_open');
    };

    void bootstrap();
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      isInitialized,
      isAuthenticated,
      login: async (email: string, password: string) => {
        await authApi.login({ email, password });
        setIsAuthenticated(true);
        void trackEvent('login_success');
      },
      logout: async () => {
        await authApi.logout();
        setIsAuthenticated(false);
      },
    }),
    [isAuthenticated, isInitialized],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuthSession = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthSession must be used within AuthProvider');
  }

  return context;
};
