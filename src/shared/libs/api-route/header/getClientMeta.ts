import { NextRequest } from 'next/server';
import { CLIENT_PLATFORM, MOBILE_META_HEADERS, type ClientPlatform } from '@/shared/constants';

export type ClientMeta = {
  platform: ClientPlatform;
  appVersion: string | null;
  appBuild: string | null;
  missingHeaders: string[];
};

const isClientPlatform = (value: string): value is ClientPlatform =>
  value === CLIENT_PLATFORM.IOS ||
  value === CLIENT_PLATFORM.ANDROID ||
  value === CLIENT_PLATFORM.WEB ||
  value === CLIENT_PLATFORM.UNKNOWN;

export const getClientMeta = (request: NextRequest): ClientMeta => {
  const platformHeader = request.headers.get(MOBILE_META_HEADERS.PLATFORM);
  const appVersionHeader = request.headers.get(MOBILE_META_HEADERS.APP_VERSION);
  const appBuildHeader = request.headers.get(MOBILE_META_HEADERS.APP_BUILD);
  const missingHeaders: string[] = [];

  if (!platformHeader) missingHeaders.push(MOBILE_META_HEADERS.PLATFORM);
  if (!appVersionHeader) missingHeaders.push(MOBILE_META_HEADERS.APP_VERSION);
  if (!appBuildHeader) missingHeaders.push(MOBILE_META_HEADERS.APP_BUILD);

  const normalizedPlatform = platformHeader ?? CLIENT_PLATFORM.UNKNOWN;
  const platform = isClientPlatform(normalizedPlatform) ? normalizedPlatform : CLIENT_PLATFORM.UNKNOWN;

  return {
    platform,
    appVersion: appVersionHeader,
    appBuild: appBuildHeader,
    missingHeaders,
  };
};

export const warnMissingClientMetaHeaders = (request: NextRequest, route: string) => {
  const { missingHeaders } = getClientMeta(request);

  if (missingHeaders.length === 0) {
    return;
  }

  console.warn(`[api][${route}] missing client meta headers`, {
    missingHeaders,
    userAgent: request.headers.get('user-agent'),
  });
};
