import { TTraining } from '@routine-note/package-shared';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { BinaryTabs, Button, Input } from '@/shared/ui';
import { FontAwesome6 } from '@expo/vector-icons';

interface ExerciseFieldProps {
  initialTrainingType?: TTraining;
  initialName?: string;
  idx: number;
  onChange: (name: string, trainigType: TTraining) => void;
  removeBtnVisible: boolean;
  onRemove: () => void;
}

export function ExerciseField({
  initialTrainingType,
  initialName,
  idx,
  onChange,
  removeBtnVisible,
  onRemove,
}: ExerciseFieldProps) {
  const [name, setName] = useState<string>(initialName ?? '');
  const [trainingType, setTrainingType] = useState<TTraining>(initialTrainingType ?? 'STRENGTH');

  const handleExerciseChange = (value?: string, newTrainingType?: TTraining) => {
    if (value?.trim()) {
      const trimmedValue = value.trim();
      setName(trimmedValue);
      onChange(trimmedValue, trainingType);
    }
    if (newTrainingType) {
      setTrainingType(newTrainingType);
      onChange(name, newTrainingType);
    }
  };

  return (
    <View style={styles.exerciseRow}>
      <Text style={{ fontSize: 12 }}>{`운동 ${idx + 1}`}</Text>
      <Input
        placeholder="예: 벤치프레스"
        value={name}
        style={styles.input}
        onChangeText={(value) => handleExerciseChange(value)}
      />
      <BinaryTabs
        options={[
          { label: '근력', value: 'STRENGTH' as TTraining },
          { label: '유산소', value: 'CARDIO' as TTraining },
        ]}
        value={trainingType}
        onChange={(trainingType) => handleExerciseChange(undefined, trainingType)}
      />
      {removeBtnVisible && (
        <Button
          label={<FontAwesome6 name="trash" size={12} color="#ffffff" />}
          style={styles.removeButton}
          onPress={onRemove}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  exerciseRow: {
    display: 'flex',
    flexDirection: 'row',
    gap: 2,
    alignItems: 'center',
  },
  input: {
    flex: 1,
    minWidth: 150,
    minHeight: 40,
  },
  removeButton: {
    width: 28,
    height: 28,
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
});
