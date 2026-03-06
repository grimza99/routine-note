import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useState } from 'react';

import { Button } from '../../../shared/ui/button/Button';
import { Input } from '../../../shared/ui/input/Input';
import { goalApi } from '../api/goalApi';

type InputPromptModalProps = {
  visible: boolean;
  onClose: () => void;
};

export const GoalSetupPromptModal = ({ visible, onClose }: InputPromptModalProps) => {
  const [value, setValue] = useState('');

  const handleCancel = async () => {
    setValue('');
    await goalApi.hiddenGoalSetupPrompt();
    onClose();
  };

  const handleSubmit = async () => {
    await goalApi.updateGoal(Number(value));
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleCancel}>
      <View style={styles.root}>
        <Pressable style={styles.overlay} onPress={handleCancel} />
        <View style={styles.modal}>
          <Text style={styles.title}>이번달 목표 설정을 아직 안했어요!</Text>
          <Text style={styles.description}>이번달 목표는 리포트 작성에 사용되는 중요한 데이터에요</Text>
          <Text style={styles.description}>마이페이지에서 언제든지 변경할 수 있어요!</Text>

          <Input
            keyboardType="numeric"
            value={value}
            onChangeText={(v) => setValue(v)}
            placeholder="이번달 목표 운동일수를 입력해주세요. 예) 20"
            style={{ marginTop: 8, fontSize: 12 }}
          />
          <View style={styles.buttonRow}>
            <Button
              label="닫기(이번달 안보기)"
              variant="secondary"
              onPress={handleCancel}
              style={styles.button}
              textStyle={{ fontSize: 14 }}
            />
            <Button label="설정" onPress={handleSubmit} style={styles.button} textStyle={{ fontSize: 14 }} />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(26, 26, 26, 0.45)',
  },
  modal: {
    width: '100%',
    maxWidth: 360,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    padding: 16,
    gap: 12,
  },
  title: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  description: {
    textAlign: 'center',
    fontSize: 13,
    color: '#7d7d7d',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 8,
  },
  button: {
    flex: 1,
  },
});
