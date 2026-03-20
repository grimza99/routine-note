import { IExercise, TTraining } from '@routine-note/package-shared';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { BinaryTabs, Button, Input } from '@/shared/ui';
import { FontAwesome6 } from '@expo/vector-icons';

interface ExerciseFieldProps {
  exercise: IExercise;
  idx: number;
  visibleRemoveButton: boolean;
  onExerciseChange: (targetId: string, value: string, trainingType: TTraining) => void;
  onRemoveExercise: () => void;
}

export function ExerciseField({
  exercise,
  idx,
  onExerciseChange,
  visibleRemoveButton,
  onRemoveExercise,
}: ExerciseFieldProps) {
  const [trainingType, setTrainingType] = useState<TTraining>(exercise.trainingType);

  const handleExerciseChange = (value?: string, trainingTypeValue?: TTraining) => {
    onExerciseChange(exercise.id, value ?? exercise.name, trainingTypeValue || trainingType);
  };

  return (
    <View style={styles.exerciseRow}>
      <Text style={{ fontSize: 12 }}>{`운동 ${idx + 1}`}</Text>
      <Input
        placeholder="예: 벤치프레스"
        value={exercise.name}
        style={styles.input}
        onChangeText={(value) => handleExerciseChange(value)}
      />
      <BinaryTabs
        options={[
          { label: '근력', value: 'STRENGTH' as TTraining },
          { label: '유산소', value: 'CARDIO' as TTraining },
        ]}
        value={trainingType}
        onChange={() => {
          const newTrainingType = trainingType === 'STRENGTH' ? 'CARDIO' : 'STRENGTH';
          setTrainingType((prev) => (prev === 'STRENGTH' ? 'CARDIO' : 'STRENGTH'));
          handleExerciseChange(undefined, newTrainingType);
        }}
      />
      {visibleRemoveButton && (
        <Button
          label={<FontAwesome6 name="trash" size={12} color="#ffffff" />}
          style={styles.removeButton}
          onPress={onRemoveExercise}
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
