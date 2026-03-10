import { ANALYTICS_EVENT_NAMES, AnalyticsEventName, API } from '@/shared/constants';
import { api } from '@/shared/libs/api';
import { CLIENT_PLATFORM } from '@routine-note/package-shared';

type TrackEventPayload = {
  eventName: AnalyticsEventName;
  userId?: string;
  source?: string;
  sessionId?: string;
  screenName?: string;
  funnelStep?: string;
  errorCode?: string;
  timestamp?: string;
  properties?: Record<string, unknown>;
};

const isAnalyticsEventName = (eventName: string): eventName is AnalyticsEventName =>
  ANALYTICS_EVENT_NAMES.includes(eventName as AnalyticsEventName);

export const trackEvent = async (payload: TrackEventPayload) => {
  if (!isAnalyticsEventName(payload.eventName)) {
    return;
  }

  try {
    await api.post(API.EVENT.TRACK, {
      ...payload,
      platform: CLIENT_PLATFORM.WEB,
      timestamp: payload.timestamp ?? new Date().toISOString(),
    });
  } catch (error) {
    console.warn('trackEvent failed', error);
  }
};
