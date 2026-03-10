import { configureTrackEvent } from '@routine-note/package-shared';

import { apiClient } from '../network';

configureTrackEvent({
  getBasePayload: () => ({
    source: 'mobile-app',
  }),
  send: async (payload) => {
    const response = await apiClient.request('/api/events', {
      method: 'POST',
      body: JSON.stringify(payload),
      auth: false,
    });

    if (response.error) {
      throw new Error(response.error.message);
    }
  },
  onError: (error) => {
    console.warn('trackEvent failed', error);
  },
});
