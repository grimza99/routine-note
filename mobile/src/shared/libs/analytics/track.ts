import { apiClient } from '../network';

export const trackEvent = async (eventName: string, properties?: Record<string, unknown>) => {
  await apiClient.request('/api/events', {
    method: 'POST',
    body: JSON.stringify({
      eventName,
      source: 'mobile-app',
      properties,
      timestamp: new Date().toISOString(),
    }),
    auth: false,
  });
};
