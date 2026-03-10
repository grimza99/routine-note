'use client';

import { CLIENT_PLATFORM, configureTrackEvent } from '@routine-note/package-shared';

import { API } from '@/shared/constants';
import { api } from '@/shared/libs/api';

configureTrackEvent({
  getBasePayload: () => ({
    platform: CLIENT_PLATFORM.WEB,
  }),
  send: async (payload) => {
    await api.post(API.EVENT.TRACK, payload);
  },
  onError: (error) => {
    console.warn('trackEvent failed', error);
  },
});
