import { useState } from 'react';
import { Alert, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { useAuthSession } from '../model/useAuthSession';
import { Button, Input } from '../../../shared/ui';
import { authStyles } from './auth.style';
import type { RootStackParamList } from '../../../app/navigation/types';

export const LoginScreen = () => {
  const { login } = useAuthSession();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isPending, setIsPending] = useState(false);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const handleLogin = async () => {
    if (!email || password.length < 6) {
      Alert.alert('입력 확인', '이메일과 6자 이상 비밀번호를 입력해 주세요.');
      return;
    }

    try {
      setIsPending(true);
      await login(email, password);
    } catch (error) {
      Alert.alert('로그인 실패', error instanceof Error ? error.message : '오류가 발생했습니다.');
    } finally {
      setIsPending(false);
    }
  };

  return (
    <View style={authStyles.container}>
      <Text style={authStyles.title}>Routine Note</Text>
      <Input
        placeholder="이메일"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <Input secureTextEntry placeholder="비밀번호" value={password} onChangeText={setPassword} />
      <Button label={isPending ? '로그인 중...' : '로그인'} onPress={handleLogin} disabled={isPending} />
      <Button label="회원가입" variant="secondary" onPress={() => navigation.navigate('Signup')} />
    </View>
  );
};
