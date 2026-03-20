import { BinaryTabs, Input } from '@/shared/ui';
import { TTraining } from '@routine-note/package-shared';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface ExerciseRowProps {
  initialTrainingType?: TTraining;
  initialName?: string;
  idx: number;
  onChange: (name: string, trainigType: TTraining) => void;
}

export function ExerciseRow({ initialTrainingType, initialName, idx, onChange }: ExerciseRowProps) {
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
    </View>
  );
}

const styles = StyleSheet.create({
  exerciseRow: {
    display: 'flex',
    flexDirection: 'row',
    gap: 4,
    alignItems: 'center',
  },
  input: {
    flex: 1,
    minWidth: 180,
    minHeight: 40,
  },
});
