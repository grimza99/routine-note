export const MOBILE_META_HEADERS = {
  PLATFORM: 'x-client-platform',
  APP_VERSION: 'x-app-version',
  APP_BUILD: 'x-app-build',
} as const;

export const CLIENT_PLATFORM = {
  IOS: 'ios',
  ANDROID: 'android',
  WEB: 'web',
  UNKNOWN: 'unknown',
} as const;

export type ClientPlatform = (typeof CLIENT_PLATFORM)[keyof typeof CLIENT_PLATFORM];
