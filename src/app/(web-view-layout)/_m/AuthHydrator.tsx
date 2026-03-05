'use client';

import { useEffect } from 'react';

import { useAuthStoreActions } from '@/entities';
import { useAuthProfileQuery } from '@/features/auth';

export const AuthHydrator = () => {
  const { setAuth } = useAuthStoreActions();
  const { data: authProfile } = useAuthProfileQuery();

  useEffect(() => {
    if (!authProfile) {
      return;
    }

    setAuth(authProfile);
  }, [authProfile, setAuth]);

  return null;
};
