import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { LoginScreen } from '../../features/auth/ui/LoginScreen';
import { useAuthSession } from '../../features/auth/model/useAuthSession';
import { RoutineScreen } from '../../features/routine/ui/RoutineScreen';
import { WorkoutScreen } from '../../features/workout/ui/WorkoutScreen';
import { WebFallbackScreen } from '../../features/webview/ui/WebFallbackScreen';
import type { MainTabParamList, RootStackParamList } from './types';
import Entypo from '@expo/vector-icons/Entypo';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import { Button } from '../../shared/ui';

const RootStack = createNativeStackNavigator<RootStackParamList>();
const MainTabs = createBottomTabNavigator<MainTabParamList>();

const MainTabsScreen = () => {
  const { logout } = useAuthSession();
  return (
    <MainTabs.Navigator
      screenOptions={() => ({
        tabBarActiveTintColor: '#E60023',
        tabBarInactiveTintColor: '#666666',
      })}
    >
      <MainTabs.Screen
        name="Workout"
        component={WorkoutScreen}
        options={{
          title: '운동기록',
          tabBarIcon: ({ size, color }) => <Entypo name="calendar" size={size} color={color} />,
        }}
      />
      <MainTabs.Screen
        name="Routine"
        component={RoutineScreen}
        options={{
          title: '내 루틴 관리',
          tabBarIcon: ({ size, color }) => <FontAwesome6 name="dumbbell" size={size} color={color} />,
        }}
      />
      <MainTabs.Screen
        name="ReportWeb"
        options={{
          title: '리포트',
          tabBarIcon: ({ size, color }) => <Entypo name="bar-graph" size={size} color={color} />,
        }}
        children={() => <WebFallbackScreen path="REPORT_MONTHLY" />}
      />
      <MainTabs.Screen
        name="ChallengeWeb"
        options={{
          title: '챌린지',
          tabBarIcon: ({ size, color }) => <FontAwesome6 name="fire-flame-curved" size={size} color={color} />,
        }}
        children={() => <WebFallbackScreen path="CHALLENGE_MONTHLY" />}
      />
      <MainTabs.Screen
        name="MyPageWeb"
        options={{
          title: '마이페이지',
          tabBarIcon: ({ size, color }) => <FontAwesome6 name="user" size={size} color={color} />,
        }}
        children={() => (
          <>
            <WebFallbackScreen path="MYPAGE" />
            <Button label="로그아웃" onPress={logout} style={{ margin: 10 }} />
          </>
        )}
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
