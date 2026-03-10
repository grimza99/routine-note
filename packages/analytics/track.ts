import { ANALYTICS_EVENT_NAMES, type AnalyticsEventName } from './events';

export type AnalyticsProperties = Record<string, unknown>;

export type BaseTrackEventPayload<TEventName extends string = AnalyticsEventName> = {
  eventName: TEventName;
  userId?: string;
  source?: string;
  platform?: string;
  appVersion?: string;
  appBuild?: string;
  sessionId?: string;
  installId?: string;
  screenName?: string;
  funnelStep?: string;
  errorCode?: string;
  timestamp?: string;
  properties?: AnalyticsProperties;
};

export type ResolvedTrackEventPayload<TEventName extends string = AnalyticsEventName> = BaseTrackEventPayload<TEventName> & {
  timestamp: string;
};

type TrackEventConfig<TEventName extends string> = {
  send: (payload: ResolvedTrackEventPayload<TEventName>) => Promise<void>;
  getBasePayload?: () => Partial<BaseTrackEventPayload<TEventName>> | Promise<Partial<BaseTrackEventPayload<TEventName>>>;
  onError?: (error: unknown) => void;
};

let trackEventConfig: TrackEventConfig<AnalyticsEventName> | null = null;

const isAnalyticsEventName = (eventName: string): eventName is AnalyticsEventName =>
  ANALYTICS_EVENT_NAMES.includes(eventName as AnalyticsEventName);

export const configureTrackEvent = (config: TrackEventConfig<AnalyticsEventName>) => {
  trackEventConfig = config;
};

export const trackEvent = async (payload: BaseTrackEventPayload<AnalyticsEventName>) => {
  if (!isAnalyticsEventName(payload.eventName)) {
    return false;
  }

  if (!trackEventConfig) {
    return false;
  }

  try {
    const basePayload = (await trackEventConfig.getBasePayload?.()) ?? {};

    await trackEventConfig.send({
      ...basePayload,
      ...payload,
      timestamp: payload.timestamp ?? basePayload.timestamp ?? new Date().toISOString(),
    });

    return true;
  } catch (error) {
    trackEventConfig.onError?.(error);
    return false;
  }
};
