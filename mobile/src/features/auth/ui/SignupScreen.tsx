import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { useAuthSession } from '../model/useAuthSession';
import { Button, Input } from '../../../shared/ui';
import { authStyles } from './auth.style';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/app/navigation/types';

type SignupFormState = {
  name: string;
  email: string;
  password: string;
  age: string;
  nickname: string;
  privacyAccepted: boolean;
};

const initialFormState: SignupFormState = {
  name: '',
  email: '',
  password: '',
  age: '',
  nickname: '',
  privacyAccepted: false,
};

export const SignupScreen = () => {
  const { signup } = useAuthSession();
  const [form, setForm] = useState(initialFormState);
  const [isPending, setIsPending] = useState(false);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const updateField = <K extends keyof SignupFormState>(key: K, value: SignupFormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSignup = async () => {
    const trimmedName = form.name.trim();
    const trimmedEmail = form.email.trim();
    const trimmedNickname = form.nickname.trim();
    const age = Number(form.age);

    if (!trimmedName || !trimmedEmail || form.password.length < 6) {
      Alert.alert('입력 확인', '이름, 이메일, 6자 이상 비밀번호를 입력해 주세요.');
      return;
    }

    if (!form.age || Number.isNaN(age) || age < 15 || age > 100) {
      Alert.alert('입력 확인', '나이는 15세 이상 100세 이하로 입력해 주세요.');
      return;
    }

    if (!form.privacyAccepted) {
      Alert.alert('동의 필요', '개인정보 수집 및 이용 동의가 필요합니다.');
      return;
    }

    try {
      setIsPending(true);
      await signup({
        email: trimmedEmail,
        password: form.password,
        username: trimmedName,
        nickname: trimmedNickname || null,
        age,
        policy_policy: form.privacyAccepted,
      });
    } catch (error) {
      Alert.alert('회원가입 실패', error instanceof Error ? error.message : '오류가 발생했습니다.');
    } finally {
      setIsPending(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={authStyles.container} keyboardShouldPersistTaps="handled">
      <Text style={authStyles.title}>Routine Note</Text>
      <Input
        placeholder="이메일"
        value={form.email}
        onChangeText={(value) => updateField('email', value)}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <Input placeholder="이름" value={form.name} onChangeText={(value) => updateField('name', value)} />
      <Input
        placeholder="닉네임"
        value={form.nickname}
        onChangeText={(value) => updateField('nickname', value)}
        helperText="미입력시 이름이 닉네임으로 설정됩니다."
      />
      <Input
        secureTextEntry
        placeholder="비밀번호"
        value={form.password}
        onChangeText={(value) => updateField('password', value)}
      />
      <Input
        placeholder="나이"
        value={form.age}
        onChangeText={(value) => updateField('age', value.replace(/[^0-9]/g, ''))}
        keyboardType="number-pad"
      />
      <Pressable
        style={styles.checkboxRow}
        onPress={() => updateField('privacyAccepted', !form.privacyAccepted)}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: form.privacyAccepted }}
      >
        <View style={[styles.checkbox, form.privacyAccepted && styles.checkboxChecked]}>
          {form.privacyAccepted ? <Text style={styles.checkboxMark}>✓</Text> : null}
        </View>
        <Text style={styles.checkboxLabel}>개인정보 수집 및 이용에 동의합니다.</Text>
      </Pressable>
      <Button label={isPending ? '회원가입 중...' : '회원가입'} onPress={handleSignup} disabled={isPending} />
      <Button label="로그인" variant="secondary" onPress={() => navigation.navigate('Login')} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderWidth: 1,
    borderColor: '#E6E6E6',
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  checkboxChecked: {
    backgroundColor: '#E60023',
    borderColor: '#E60023',
  },
  checkboxMark: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  checkboxLabel: {
    flex: 1,
    color: '#1A1A1A',
    fontSize: 12,
  },
});
