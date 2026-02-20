export type RouteResolution = 'native' | 'webview';

export const ROUTE_CONTRACT_VERSION = '2026-03-10-v1' as const;
export const ROUTE_CONTRACT_FROZEN_AT = '2026-03-10' as const;

export type RouteKey =
  | 'auth.login'
  | 'workout.record'
  | 'routine.list'
  | 'report.monthly'
  | 'challenge.monthly'
  | 'mypage';

export interface RouteContractItem {
  key: RouteKey;
  path: string;
  resolution: RouteResolution;
}
