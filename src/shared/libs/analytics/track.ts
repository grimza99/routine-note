import { API } from '@/shared';
import { ANALYTICS_EVENT_NAMES, AnalyticsEventName, CLIENT_PLATFORM } from '@/shared/constants';
import { api } from '@/shared/libs/api';

type TrackEventPayload = {
  eventName: AnalyticsEventName;
  userId?: string;
  source?: string;
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
    await api.post(
      API.EVENT.TRACK,
      {
        ...payload,
        platform: CLIENT_PLATFORM.WEB,
        timestamp: payload.timestamp ?? new Date().toISOString(),
      },
      { auth: false },
    );
  } catch (error) {
    console.warn('trackEvent failed', error);
  }
};
