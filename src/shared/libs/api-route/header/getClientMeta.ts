import { NextRequest } from 'next/server';
import { CLIENT_PLATFORM, MOBILE_META_HEADERS, type ClientPlatform } from '@/shared/constants';

export type ClientMeta = {
  platform: ClientPlatform;
  appVersion: string | null;
  appBuild: string | null;
};

const isClientPlatform = (value: string): value is ClientPlatform =>
  value === CLIENT_PLATFORM.IOS ||
  value === CLIENT_PLATFORM.ANDROID ||
  value === CLIENT_PLATFORM.WEB ||
  value === CLIENT_PLATFORM.UNKNOWN;

export const getClientMeta = (request: NextRequest): ClientMeta => {
  const platformHeader = request.headers.get(MOBILE_META_HEADERS.PLATFORM) ?? CLIENT_PLATFORM.UNKNOWN;
  const platform = isClientPlatform(platformHeader) ? platformHeader : CLIENT_PLATFORM.UNKNOWN;

  return {
    platform,
    appVersion: request.headers.get(MOBILE_META_HEADERS.APP_VERSION),
    appBuild: request.headers.get(MOBILE_META_HEADERS.APP_BUILD),
  };
};
