export const ANALYTICS_EVENT_NAMES = [
  'app_install',
  'app_open',
  'login_success',
  'workout_created',
  'workout_saved',
  'routine_applied',
  'report_viewed',
] as const;

export const ANALYTICS_EVENTS = {
  APP_INSTALL: 'app_install',
  APP_OPEN: 'app_open',
  LOGIN_SUCCESS: 'login_success',
  WORKOUT_SAVED: 'workout_saved',
  WORKOUT_CREATED: 'workout_created',
  ROUTINE_APPLIED: 'routine_applied',
  REPORT_VIEWED: 'report_viewed',
} as const;

export type AnalyticsEventName = (typeof ANALYTICS_EVENT_NAMES)[number];
