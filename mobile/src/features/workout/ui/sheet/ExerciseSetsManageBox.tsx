import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useState } from 'react';

import { trackEvent } from '../../../../shared/libs';
import { workoutApi } from '../../api/workoutApi';
import { Button, Input, NumberStepper } from '../../../../shared/ui';
import { WorkoutExerciseItem, WorkoutSetPayload } from '../../../../shared/types';
import SetBox from './SetBox';

interface ExerciseSetsSheetProps {
  workoutId: string;
  label: string;
  selectedDate: Date;
  initialExercises: WorkoutExerciseItem[];
  onSubmitSuccess: (date: Date) => void;
}

export function ExerciseSetsManageBox({
  workoutId,
  label,
  selectedDate,
  initialExercises,
  onSubmitSuccess,
}: ExerciseSetsSheetProps) {
  if (initialExercises.length === 0) {
    return null;
  }
  const [exercisesState, setExercisesState] = useState(initialExercises);
  const [isSaving, setIsSaving] = useState(false);

  const [payload, setPayload] = useState<WorkoutSetPayload>();
  const [note, setNote] = useState('');

  const initialSetsIds = initialExercises.flatMap((exercise) => exercise.sets.map((set) => set.id));

  const handleStandAloneSetsChange = (exerciseId: string, setId: string, weight: string, reps: string) => {
    const weightNum = parseInt(weight, 10);
    const repsNum = parseInt(reps, 10);
    setExercisesState(
      (prev) =>
        prev?.map((exercise) => {
          if (exercise.id === exerciseId) {
            const updatedSets = exercise.sets.map((set) => {
              if (set.id === setId) {
                return { ...set, weightNum, repsNum };
              }
              return set;
            });
            return { ...exercise, sets: updatedSets };
          }
          return exercise;
        }) || [],
    );
  };
  const handleSubmit = async () => {
    try {
      setIsSaving(true);

      for (const exercise of exercisesState) {
        const removedSets = initialExercises
          .find((initialExercise) => initialExercise.id === exercise.id)
          ?.sets.filter((set) => !exercise.sets?.some((currentSet) => currentSet.id === set.id));

        // 삭제된 세트 처리
        if (removedSets && removedSets.length > 0) {
          for (const set of removedSets) {
            // await workoutApi.deleteSet(set.id); //삭제 api
          }
        }
        for (const set of exercise.sets) {
          if (set.reps === 0) {
            Alert.alert('횟수는 0보다 커야 합니다.');
            continue;
          }
          if (initialSetsIds.includes(set.id)) {
            // 기존 세트 업데이트 API 호출
            // await workoutApi.updateSet(set.id, { weight: set.weight, reps: set.reps, note: set.note });
            continue;
          }
          await workoutApi.createSet(workoutId, set);
          void trackEvent('workout_created', {
            ...payload,
          });
          Alert.alert('완료', '운동 기록을 생성했습니다.');
        }
      }
      if (note.trim() !== '') {
        // 노트 업데이트 API 호출
        // await workoutApi.updateNote(workoutId, note);
      }
    } catch (error) {
      Alert.alert('세트 관리 실패', error instanceof Error ? error.message : '오류가 발생했습니다.');
    } finally {
      setIsSaving(false);
      onSubmitSuccess(selectedDate);
    }
  };

  const handleSetIncrease = (exerciseId: string) => {
    setExercisesState(
      (prev) =>
        prev?.map((exercise) => {
          if (exercise.id === exerciseId) {
            const newSet = {
              id: `new-${Date.now()}`,
              weight: 0,
              reps: 0,
            };
            return { ...exercise, sets: [...exercise.sets, newSet] };
          }
          return exercise;
        }) || [],
    );
  };
  const handleSetDecrease = (exerciseId: string) => {
    setExercisesState(
      (prev) =>
        prev?.map((exercise) => {
          if (exercise.id === exerciseId) {
            const updatedSets = exercise.sets.slice(0, -1);
            return { ...exercise, sets: updatedSets };
          }
          return exercise;
        }) || [],
    );
  };
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.exerciseList}>
        {exercisesState.map((state) => {
          return (
            <View key={state.id}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, justifyContent: 'space-between' }}>
                <Text style={styles.exerciseName}>{state.exerciseName}</Text>
                <NumberStepper
                  value={state.sets?.length || 0}
                  onDecrease={() => handleSetDecrease(state.id)}
                  onIncrease={() => handleSetIncrease(state.id)}
                />
              </View>
              {state.sets.length > 0 && (
                <View style={styles.setList}>
                  {state.sets.map((set, index) => (
                    <SetBox
                      key={set.id}
                      index={index}
                      initialSet={{ weight: set.weight?.toString() || '0', reps: set.reps?.toString() || '0' }}
                      onChange={(weight, reps) => handleStandAloneSetsChange(state.id, set.id, weight, reps)}
                    />
                  ))}
                </View>
              )}
            </View>
          );
        })}
      </View>
      <Input
        placeholder="루틴, 운동에 대한 메모를 자유롭게 남겨주세요."
        value={note}
        onChange={(text) => setNote(text.nativeEvent.text)}
        multiline
        style={{ height: 60, textAlignVertical: 'top' }}
      />
      <View style={styles.buttonArea}>
        <Button label={'취소'} onPress={handleSubmit} disabled={isSaving} variant="tertiary" />
        <Button label={isSaving ? '...' : '저장'} onPress={handleSubmit} disabled={isSaving} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 10,
    borderWidth: 1,
    borderColor: '#E6E6E6',
    borderRadius: 8,
    backgroundColor: '#F7F7F7',
    padding: 12,
  },

  exerciseName: {
    fontSize: 14,
    fontWeight: '600',
  },
  exerciseList: {
    height: 'auto',
    gap: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#E60023',
  },
  setList: {
    display: 'flex',
    gap: 8,
    paddingHorizontal: 4,
    paddingVertical: 8,
  },
  buttonArea: {
    display: 'flex',
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'flex-end',
  },
});
