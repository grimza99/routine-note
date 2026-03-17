//-------------------------------------mobile----------------------
//constants
export { MOBILE_META_HEADERS, CLIENT_PLATFORM, type ClientPlatform } from './mobile/constants/headers';
export { WEB_FALLBACK_PATH } from './mobile/constants/route';

//-------------------------------------commons----------------------
// hooks
export { useMonth } from './shared/hooks/useMonth';
// libs
export { createYearMonthDay } from './shared/libs/date/createDate';
export { formatDate, formatDateYearMonth, formatMonthDay } from './shared/libs/date/formatDate';
export { isSameDay } from './shared/libs/date/identifyDate';
export {
  ANALYTICS_EVENTS,
  ANALYTICS_EVENT_NAMES,
  configureTrackEvent,
  trackEvent,
  type AnalyticsEventName,
  type BaseTrackEventPayload,
  type AnalyticsProperties,
} from './analytics';

// constants
export { API } from './shared/constants/api';

// types
export type { ICardioSet, IStrengthSet, TTraining, IExercise, IWorkoutExercise } from './shared/types/exercise';
export type { IWorkoutPayload } from './shared/types/workout';
