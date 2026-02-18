import { createContext, PropsWithChildren, useContext, useEffect, useMemo, useState } from 'react';

import { authApi } from '../api/authApi';
import { trackEvent } from '../../../shared/libs/analytics/track';
import { installStorage, tokenStorage } from '../../../shared/libs/storage';
import { setAuthExpiredHandler, validateStoredSession } from '../../../shared/libs/network/apiClient';

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
    setAuthExpiredHandler(() => {
      setIsAuthenticated(false);
    });

    const bootstrap = async () => {
      const installId = await installStorage.getOrCreateInstallId();
      void (async () => {
        const isInstallTracked = await installStorage.isInstallTracked();

        if (isInstallTracked) {
          return;
        }

        const installTracked = await trackEvent('app_install', undefined, { installId });
        if (installTracked) {
          await installStorage.markInstallTracked();
        }
      })();

      const tokens = await tokenStorage.read();

      if (!tokens?.refreshToken) {
        setIsAuthenticated(false);
        setIsInitialized(true);
        void trackEvent('app_open', undefined, { installId });
        return;
      }

      const isSessionValid = await validateStoredSession();
      setIsAuthenticated(isSessionValid);
      setIsInitialized(true);
      void trackEvent('app_open', undefined, { installId });
    };

    void bootstrap();

    return () => {
      setAuthExpiredHandler(null);
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      isInitialized,
      isAuthenticated,
      login: async (email: string, password: string) => {
        await authApi.login({ email, password });
        setIsAuthenticated(true);
        const installId = await installStorage.getOrCreateInstallId();
        void trackEvent('login_success', undefined, { installId });
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
