import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import './src/shared/libs/analytics/configureTrackEvent';
import { AppNavigator } from './src/app/navigation/AppNavigator';
import { linkingConfig } from './src/app/navigation/linking';
import { AuthProvider } from './src/features/auth/model/useAuthSession';
import GoalSetupGuard from './src/features/goal/ui/GoalSetupGuard';

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <NavigationContainer linking={linkingConfig}>
          <StatusBar style="auto" />
          <AppNavigator />
        </NavigationContainer>
        <GoalSetupGuard />
      </AuthProvider>
    </SafeAreaProvider>
  );
}
