import { apiClient } from '../network';

type TrackEventMeta = {
  sessionId?: string;
  screenName?: string;
  funnelStep?: string;
  errorCode?: string;
  installId?: string;
};

export const trackEvent = async (
  eventName: string,
  properties?: Record<string, unknown>,
  meta: TrackEventMeta = {},
) => {
  const response = await apiClient.request('/api/events', {
    method: 'POST',
    body: JSON.stringify({
      eventName,
      source: 'mobile-app',
      properties,
      sessionId: meta.sessionId,
      screenName: meta.screenName,
      funnelStep: meta.funnelStep,
      errorCode: meta.errorCode,
      installId: meta.installId,
      timestamp: new Date().toISOString(),
    }),
    auth: false,
  });

  return !response.error;
};
