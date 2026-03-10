export const ANALYTICS_EVENT_NAMES = [
  'app_install',
  'app_open',
  'login_success',
  'workout_created',
  'workout_updated',
  'workout_removed',
  'routine_applied',
  'report_viewed',
  'workout_sets_created',
  'workout_sets_updated',
] as const;

export const ANALYTICS_EVENTS = {
  APP_INSTALL: 'app_install',
  APP_OPEN: 'app_open',
  LOGIN_SUCCESS: 'login_success',
  WORKOUT_UPDATED: 'workout_updated',
  WORKOUT_CREATED: 'workout_created',
  WORKOUT_REMOVED: 'workout_removed',
  ROUTINE_APPLIED: 'routine_applied',
  REPORT_VIEWED: 'report_viewed',
  WORKOUT_SETS_CREATED: 'workout_sets_created',
  WORKOUT_SETS_UPDATED: 'workout_sets_updated',
} as const;

export type AnalyticsEventName = (typeof ANALYTICS_EVENT_NAMES)[number];
