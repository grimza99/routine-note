import { Platform } from 'react-native';

const localIp = '127.0.0.1';
const localPort = '3000';

const defaultBaseUrl =
  Platform.OS === 'android' ? `http://10.0.2.2:${localPort}` : `http://${localIp}:${localPort}`;

export const appEnv = {
  apiBaseUrl: process.env.EXPO_PUBLIC_API_BASE_URL ?? defaultBaseUrl,
  appVersion: process.env.EXPO_PUBLIC_APP_VERSION ?? '0.1.0',
  appBuild: process.env.EXPO_PUBLIC_APP_BUILD ?? '1',
};
