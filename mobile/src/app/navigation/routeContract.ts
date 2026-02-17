import type { RouteContractItem } from '../../shared/types/routing';
import { ROUTE_CONTRACT_FROZEN_AT, ROUTE_CONTRACT_VERSION } from '../../shared/types/routing';

export const routeContractMetadata = {
  version: ROUTE_CONTRACT_VERSION,
  frozenAt: ROUTE_CONTRACT_FROZEN_AT,
} as const;

export const routeContract: ReadonlyArray<RouteContractItem> = [
  { key: 'auth.login', path: 'auth/login', resolution: 'native' },
  { key: 'workout.record', path: 'workout/record', resolution: 'native' },
  { key: 'routine.list', path: 'routine/list', resolution: 'native' },
  { key: 'report.monthly', path: 'report/monthly', resolution: 'webview' },
  { key: 'challenge.monthly', path: 'challenge/monthly', resolution: 'webview' },
  { key: 'mypage', path: 'mypage', resolution: 'webview' },
];
