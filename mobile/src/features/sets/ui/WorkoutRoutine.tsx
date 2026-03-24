import { setsApi } from '@/features/sets/api/setsApi';
import { ExerciseWithSet } from '@/features/sets/ui/ExerciseWithSet';
import { workoutNoteApi } from '@/features/workout-note/api/workoutNoteApi';
import { workoutApi } from '@/features/workout/api/workoutApi';
import { Button, Input } from '@/shared/ui';
import { IWorkoutExercise, IWorkoutRoutine } from '@routine-note/package-shared';
import { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';

interface WorkoutRoutineProps {
  routine: IWorkoutRoutine;
  onSubmitSuccess: () => void;
}
export default function WorkoutRoutine({ routine, onSubmitSuccess }: WorkoutRoutineProps) {
  const [exercises, setExercises] = useState(routine.exercises);
  const [note, setNote] = useState(routine.note);
  const [isSaving, setIsSaving] = useState(false);

  const initialExSetsIds = routine.exercises.flatMap((exercise) => exercise.sets.map((set) => set.id));

  const handleChangeEx = (newEx: IWorkoutExercise) => {
    setExercises((prev) => {
      const otherExercises = prev.filter((ex) => ex.id !== newEx.id);
      return [...otherExercises, newEx];
    });
  };

  const handleSubmit = async () => {
    setIsSaving(true);

    try {
      for (const ex of exercises || []) {
        const removedSets = routine.exercises
          .find((initialExercise) => initialExercise.id === ex.id)
          ?.sets.filter((set) => !ex.sets.some((currentSet) => currentSet.id === set.id));

        // 삭제된 세트 처리
        if (removedSets && removedSets.length > 0) {
          for (const set of removedSets) {
            await setsApi.delete(set.id);
          }
        }
        for (const set of ex.sets) {
          if ('reps' in set && 'weight' in set) {
            if (set.reps === 0 || set.weight === 0) {
              continue;
            }
            if (initialExSetsIds.includes(set.id)) {
              await setsApi.update({
                id: set.id,
                weight: set.weight,
                reps: set.reps,
              });
              continue;
            }
            await setsApi.create({
              id: ex.id,
              weight: set.weight,
              reps: set.reps,
            });
          }

          if ('value' in set && 'type' in set) {
            if (set.value === 0) {
              continue;
            }
            if (initialExSetsIds.includes(set.id)) {
              await setsApi.update({
                id: set.id,
                type: set.type,
                value: set.value,
              });
              continue;
            }
            await setsApi.create({
              id: ex.id,
              type: set.type,
              value: set.value,
            });
          }
        }
      }
      if (note.trim() !== '') {
        await workoutNoteApi.create(routine.id, note);
      }
    } catch (error) {
      Alert.alert('세트 관리 실패', error instanceof Error ? error.message : '오류가 발생했습니다.');

      return;
    }
    setIsSaving(false);
    onSubmitSuccess();
  };

  const handleDelete = () => {
    Alert.alert('운동기록 삭제', '정말 이 운동기록을 삭제하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      {
        text: '삭제',
        style: 'destructive',
        onPress: async () => {
          setIsSaving(true);
          try {
            await workoutApi.deleteWorkoutRoutine(routine.id);
          } catch (error) {
            Alert.alert('삭제 실패', error instanceof Error ? error.message : '오류가 발생했습니다.');
            setIsSaving(false);
            return;
          }
          setIsSaving(false);
          onSubmitSuccess();
        },
      },
    ]);
  };

  return (
    <>
      <Text style={styles.title}>{routine.name}</Text>
      {routine.exercises.map((exercise) => (
        <ExerciseWithSet key={exercise.id} initialExercise={exercise} onChangeEx={handleChangeEx} />
      ))}
      <Input
        placeholder="루틴에 대한 메모를 자유롭게 남겨주세요."
        value={note}
        onChange={(text) => setNote(text.nativeEvent.text)}
        multiline
        style={styles.input}
      />
      <View style={styles.buttonContainer}>
        <Button
          label={isSaving ? '...' : '운동기록 삭제'}
          onPress={handleDelete}
          disabled={isSaving}
          variant="secondary"
          style={{ flex: 1 }}
        />
        <Button label={isSaving ? '...' : '세트 저장'} onPress={handleSubmit} disabled={isSaving} style={{ flex: 1 }} />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  input: {
    height: 60,
    textAlignVertical: 'top',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 8,
  },
});
