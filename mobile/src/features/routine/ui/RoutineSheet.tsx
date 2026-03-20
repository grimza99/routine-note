import { Button, Input } from '@/shared/ui';
import { ExerciseField } from '@/widget';
import { useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { routineApi } from '../api/routineApi';
import { useRef } from 'react';
import { IExercise, TTraining } from '@routine-note/package-shared';

export interface RoutineSheetProps {
  initialName?: string;
  initialExercises?: IExercise[];
  editingRoutineId?: string | null;
  onSubmit: () => void;
}
export const initialRoutineSheetProps: RoutineSheetProps = {
  initialName: '',
  initialExercises: [{ name: '', id: '1', trainingType: 'STRENGTH' }],
  editingRoutineId: null,
  onSubmit: () => {},
};
export function RoutineSheet({ initialName, editingRoutineId, initialExercises, onSubmit }: RoutineSheetProps) {
  const nextIdRef = useRef('1');
  const [name, setName] = useState(initialName ?? '');
  const [exercises, setExercises] = useState<IExercise[]>(
    initialExercises ?? [{ name: '', id: nextIdRef.current, trainingType: 'STRENGTH' }],
  );
  const [isSaving, setIsSaving] = useState(false);

  const handleAddExercise = () => {
    const nextId = (parseInt(nextIdRef.current) + 1).toString();
    setExercises((prev) => [...prev, { id: nextId, name: '', trainingType: 'STRENGTH' }]);
    nextIdRef.current = nextId;
  };

  const handleRemoveExercise = (targetId: string) => {
    setExercises((prev) => prev.filter((exercise) => exercise.id !== targetId));
  };

  const handleExerciseChange = (targetId: string, value: string, trainingType: TTraining) => {
    setExercises((prev) =>
      prev.map((exercise) => (exercise.id === targetId ? { ...exercise, name: value, trainingType } : exercise)),
    );
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      Alert.alert('입력 확인', '루틴 이름을 입력해 주세요.');
      return;
    }

    if (!exercises.length) {
      Alert.alert('입력 확인', '운동을 1개 이상 입력해 주세요.');
      return;
    }

    try {
      setIsSaving(true);
      const payload = {
        name,
        exercises,
      };

      if (!!editingRoutineId) {
        await routineApi.update(editingRoutineId, payload);
      } else {
        await routineApi.create(payload);
      }

      onSubmit();
    } catch (error) {
      Alert.alert('저장 실패', error instanceof Error ? error.message : '오류가 발생했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <View style={styles.form}>
      <Input placeholder="루틴 이름" value={name} onChangeText={setName} />
      <Button
        label="운동 추가"
        variant="secondary"
        onPress={handleAddExercise}
        disabled={isSaving}
        style={styles.addExerciseButton}
        textStyle={{ fontSize: 12 }}
      />
      {exercises.map((exercise, idx) => (
        <ExerciseField
          key={exercise.id}
          exercise={exercise}
          idx={idx}
          visibleRemoveButton={exercises.length > 1}
          onExerciseChange={(targetId, value, trainingType) => handleExerciseChange(targetId, value, trainingType)}
          onRemoveExercise={() => handleRemoveExercise(exercise.id)}
        />
      ))}
      <Button
        label={isSaving ? '저장 중...' : editingRoutineId ? '루틴 수정' : '루틴 생성'}
        onPress={handleSubmit}
        disabled={isSaving}
      />
    </View>
  );
}
const styles = StyleSheet.create({
  form: {
    marginTop: 8,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E6E6E6',
    backgroundColor: '#F7F7F7',
    gap: 5,
  },
  addExerciseButton: {
    width: 80,
    alignSelf: 'flex-end',
    paddingHorizontal: 4,
    paddingVertical: 6,
  },
});
