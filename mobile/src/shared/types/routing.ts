export type RouteResolution = 'native' | 'webview';

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
