import { Alert, StyleSheet, Text, View } from 'react-native';
import { useState } from 'react';

import { formatDate, trackEvent } from '../../../../shared/libs';
import { workoutApi } from '../../api/workoutApi';
import { Button, Input, NumberStepper } from '../../../../shared/ui';
import { WorkoutExerciseItem, WorkoutSetPayload } from '../../../../shared/types';
import SetBox from './SetBox';

interface ExerciseSetsSheetProps {
  type: 'routine-exercise' | 'standalone-exercise';
  label: string;
  selectedDate: Date;
  initialExercises: WorkoutExerciseItem[];
  initialNote?: string; //standalone-exercise는 note 설정 x
  onSubmitSuccess: (date: Date) => void;
  workoutRoutineId?: string; //standalone-exercise는 workoutRoutineId 없음
}

export function ExerciseSetsManageBox({
  type,
  label,
  selectedDate,
  initialExercises,
  initialNote,
  workoutRoutineId,
  onSubmitSuccess,
}: ExerciseSetsSheetProps) {
  if (initialExercises.length === 0) {
    return null;
  }
  const [exercisesState, setExercisesState] = useState(initialExercises);
  const [isSaving, setIsSaving] = useState(false);

  const [note, setNote] = useState(initialNote || '');

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
                return { ...set, weight: weightNum, reps: repsNum };
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
            await workoutApi.deleteSet(set.id);
          }
        }
        // 추가 및 업데이트된 세트 처리
        for (const set of exercise.sets) {
          if (set.reps === 0 && set.weight === 0) {
            Alert.alert('세트 값 이상', '세트값에는 0이 들어갈수없어요. 세트를 삭제하시려면 - 버튼을 눌러주세요.');
            continue;
          }
          //기존에 존재하는 세트이므로 업데이트
          if (initialSetsIds.includes(set.id)) {
            // 기존 세트 업데이트 API 호출
            await workoutApi.updateSet(set.id, { weight: set.weight, reps: set.reps });
            continue;
          }
          //새로 추가된
          await workoutApi.createSet(exercise.id, set);
          void trackEvent('workout_sets_created', {
            date: formatDate(selectedDate),
            ...set,
          });
          Alert.alert('완료', '운동 기록을 생성했습니다.');
        }
      }
      //note
      try {
        if (note.trim() !== '' && note !== initialNote && workoutRoutineId) {
          await workoutApi.createWorkoutRoutineNote(workoutRoutineId, note);
        }
      } catch (error) {
        Alert.alert('메모 저장 실패', error instanceof Error ? error.message : '오류가 발생했습니다.');
      }
      onSubmitSuccess(selectedDate);
    } catch (error) {
      Alert.alert('세트 관리 실패', error instanceof Error ? error.message : '오류가 발생했습니다.');
    } finally {
      setIsSaving(false);
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
      {type === 'routine-exercise' && (
        <Input
          placeholder="루틴에 대한 메모를 자유롭게 남겨주세요."
          value={note}
          onChange={(text) => setNote(text.nativeEvent.text)}
          multiline
          style={{ height: 60, textAlignVertical: 'top' }}
        />
      )}
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
