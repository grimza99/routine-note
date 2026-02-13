export type RouteResolution = 'native' | 'webview';

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
