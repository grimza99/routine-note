import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { useAuthSession } from '../model/useAuthSession';

export const LoginScreen = () => {
  const { login } = useAuthSession();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isPending, setIsPending] = useState(false);

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
    <View style={styles.container}>
      <Text style={styles.title}>Routine Note</Text>
      <TextInput
        autoCapitalize="none"
        keyboardType="email-address"
        placeholder="이메일"
        style={styles.input}
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        secureTextEntry
        placeholder="비밀번호"
        style={styles.input}
        value={password}
        onChangeText={setPassword}
      />
      <Pressable style={styles.button} onPress={handleLogin} disabled={isPending}>
        <Text style={styles.buttonText}>{isPending ? '로그인 중...' : '로그인'}</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    gap: 12,
    backgroundColor: '#FFFFFF',
  },
  title: {
    width: '100%',
    textAlign: 'center',
    fontSize: 28,
    fontWeight: '700',
    color: '#E60023',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E6E6E6',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  button: {
    marginTop: 8,
    backgroundColor: '#E60023',
    borderRadius: 8,
    alignItems: 'center',
    paddingVertical: 12,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});
