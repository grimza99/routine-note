import type { LinkingOptions } from '@react-navigation/native';

import { routeContract } from './routeContract';
import type { RootStackParamList } from './types';

const routePathMap = Object.fromEntries(routeContract.map((route) => [route.key, route.path]));

export const linkingConfig: LinkingOptions<RootStackParamList> = {
  prefixes: ['routine-note://'],
  config: {
    screens: {
      Login: routePathMap['auth.login'],
      MainTabs: {
        screens: {
          Workout: routePathMap['workout.record'],
          Routine: routePathMap['routine.list'],
          ReportWeb: routePathMap['report.monthly'],
          ChallengeWeb: routePathMap['challenge.monthly'],
          MyPageWeb: routePathMap.mypage,
        },
      },
    },
  },
};
