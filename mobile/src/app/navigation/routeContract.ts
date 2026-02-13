import type { RouteContractItem } from '../../shared/types/routing';

export const routeContract: RouteContractItem[] = [
  { key: 'auth.login', path: 'auth/login', resolution: 'native' },
  { key: 'workout.record', path: 'workout/record', resolution: 'native' },
  { key: 'routine.list', path: 'routine/list', resolution: 'native' },
  { key: 'report.monthly', path: 'report/monthly', resolution: 'webview' },
  { key: 'challenge.monthly', path: 'challenge/monthly', resolution: 'webview' },
  { key: 'mypage', path: 'mypage', resolution: 'webview' },
];
