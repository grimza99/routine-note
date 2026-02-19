import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';

import { appEnv } from '../../../shared/config/env';
import { WEB_FALLBACK_PATH } from '../../../shared/constants/routes';

type WebFallbackScreenProps = {
  path: keyof typeof WEB_FALLBACK_PATH;
};

export const WebFallbackScreen = ({ path }: WebFallbackScreenProps) => {
  const uri = useMemo(() => `${appEnv.apiBaseUrl}${WEB_FALLBACK_PATH[path]}`, [path]);

  return (
    <View style={styles.container}>
      <WebView source={{ uri }} sharedCookiesEnabled javaScriptEnabled domStorageEnabled />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
});
