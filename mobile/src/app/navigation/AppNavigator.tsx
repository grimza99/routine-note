import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { LoginScreen } from '../../features/auth/ui/LoginScreen';
import { useAuthSession } from '../../features/auth/model/useAuthSession';
import { RoutineScreen } from '../../features/routine/ui/RoutineScreen';
import { WorkoutScreen } from '../../features/workout/ui/WorkoutScreen';
import { WebFallbackScreen } from '../../features/webview/ui/WebFallbackScreen';
import type { MainTabParamList, RootStackParamList } from './types';

const RootStack = createNativeStackNavigator<RootStackParamList>();
const MainTabs = createBottomTabNavigator<MainTabParamList>();

const MainTabsScreen = () => {
  return (
    <MainTabs.Navigator>
      <MainTabs.Screen name="Workout" component={WorkoutScreen} options={{ title: '운동기록' }} />
      <MainTabs.Screen name="Routine" component={RoutineScreen} options={{ title: '루틴' }} />
      <MainTabs.Screen
        name="ReportWeb"
        options={{ title: '리포트' }}
        children={() => <WebFallbackScreen path="REPORT_MONTHLY" />}
      />
      <MainTabs.Screen
        name="ChallengeWeb"
        options={{ title: '챌린지' }}
        children={() => <WebFallbackScreen path="CHALLENGE_MONTHLY" />}
      />
      <MainTabs.Screen
        name="MyPageWeb"
        options={{ title: '마이페이지' }}
        children={() => <WebFallbackScreen path="MYPAGE" />}
      />
    </MainTabs.Navigator>
  );
};

export const AppNavigator = () => {
  const { isInitialized, isAuthenticated } = useAuthSession();

  if (!isInitialized) {
    return null;
  }

  return (
    <RootStack.Navigator screenOptions={{ headerShown: false }}>
      {isAuthenticated ? (
        <RootStack.Screen name="MainTabs" component={MainTabsScreen} />
      ) : (
        <RootStack.Screen name="Login" component={LoginScreen} />
      )}
    </RootStack.Navigator>
  );
};
