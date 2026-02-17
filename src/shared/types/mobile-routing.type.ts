export type RouteResolution = 'native' | 'webview';

export const MOBILE_ROUTE_CONTRACT_VERSION = '2026-03-10-v1' as const;
export const MOBILE_ROUTE_CONTRACT_FROZEN_AT = '2026-03-10' as const;

export type MobileRouteKey =
  | 'auth.login'
  | 'workout.record'
  | 'routine.list'
  | 'report.monthly'
  | 'challenge.monthly'
  | 'mypage';

export interface MobileRouteContractItem {
  key: MobileRouteKey;
  path: string;
  resolution: RouteResolution;
}
