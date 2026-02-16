import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useState, useCallback, useEffect } from 'react';

import { routineApi } from '../../../routine/api/routineApi';
import { formatDate, formatMonthDay, trackEvent } from '../../../../shared/libs';
import { workoutApi } from '../../api/workoutApi';
import { Button, Input } from '../../../../shared/ui';
import { RoutineItem } from '../../../../shared/types/routine';
import { WorkoutPayload } from '../../../../shared/types';
import { WorkoutRoutineCard } from '../WorkoutRoutineCard';

interface CreateWorkoutSheetProps {
  selectedDate: Date;
}

export function CreateWorkoutSheet({ selectedDate }: CreateWorkoutSheetProps) {
  const [routines, setRoutines] = useState<RoutineItem[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedRoutineIds, setSelectedRoutineIds] = useState<string[]>([]);
  const [createWorkoutPayload, setCreateWorkoutPayload] = useState<WorkoutPayload>({
    date: formatDate(selectedDate),
    routines: [],
    exercises: [],
  });

  const loadRoutines = useCallback(async () => {
    const list = await routineApi.list();
    setRoutines(list);
  }, []);

  useEffect(() => {
    const initialize = async () => {
      try {
        await loadRoutines();
      } catch (error) {
        Alert.alert('조회 실패', error instanceof Error ? error.message : '오류가 발생했습니다.');
      }
    };
    void initialize();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadRoutines]);

  const toggleRoutine = (routineId: string) => {
    const targetRoutine = routines.find((routine) => routine.routineId === routineId);
    if (!targetRoutine) {
      return;
    }
    setSelectedRoutineIds((prev) =>
      prev.includes(routineId) ? prev.filter((id) => id !== routineId) : [...prev, routineId],
    );
    setCreateWorkoutPayload((prev) => ({
      ...prev,
      routines: [...prev.routines, targetRoutine],
    }));
  };

  const handleStandaloneExerciseRemove = (index: number) => {
    setCreateWorkoutPayload((prev) => {
      const updatedExercises = [...prev.exercises];
      updatedExercises.splice(index, 1);
      return { ...prev, exercises: updatedExercises };
    });
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await workoutApi.create(createWorkoutPayload);

      void trackEvent('workout_created', {
        ...createWorkoutPayload,
      });

      Alert.alert('완료', '운동 기록을 생성했습니다.');
    } catch (error) {
      Alert.alert('저장 실패', error instanceof Error ? error.message : '오류가 발생했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.sheetContent}>
      <View style={styles.form}>
        <Text style={styles.secondaryTitle}>{formatMonthDay(selectedDate)} 날짜 운동 기록하기</Text>
        <Text style={styles.label}>기록할 루틴 선택</Text>
        <ScrollView contentContainerStyle={styles.routineList}>
          {routines.length ? (
            routines.map((routine) => {
              const selected = selectedRoutineIds.includes(routine.routineId);
              return (
                <WorkoutRoutineCard
                  key={routine.routineId}
                  routineName={routine.routineName}
                  exercises={routine.exercises}
                  selected={selected}
                  onPress={() => toggleRoutine(routine.routineId)}
                />
              );
            })
          ) : (
            <Text style={styles.emptyText}>선택 가능한 루틴이 없습니다.</Text>
          )}
        </ScrollView>
        <Button
          label="루틴외의 운동 추가"
          onPress={() => {
            const newExercise = { exerciseName: '' };
            setCreateWorkoutPayload((prev) => ({ ...prev, exercises: [...prev.exercises, newExercise] }));
          }}
          variant="secondary"
        />
        {createWorkoutPayload.exercises.map((exercise, index) => (
          <View key={index} style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Input
              key={index}
              placeholder="예: 벤치프레스, 스쿼트"
              value={exercise.exerciseName}
              onChange={(text) => {
                const updatedExercises = [...createWorkoutPayload.exercises];
                updatedExercises[index].exerciseName = text.nativeEvent.text;
                setCreateWorkoutPayload((prev) => ({ ...prev, exercises: updatedExercises }));
              }}
              style={{ flex: 1 }}
            />
            <Button label="삭제" onPress={() => handleStandaloneExerciseRemove(index)} />
          </View>
        ))}

        <Button label={isSaving ? '저장 중...' : '운동 기록 생성'} onPress={handleSave} disabled={isSaving} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  sheetContent: {
    gap: 10,
    paddingBottom: 40,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  routineList: {
    height: 'auto',
    gap: 8,
  },
  emptyText: {
    color: '#666666',
  },
  secondaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  form: {
    borderWidth: 1,
    borderColor: '#E6E6E6',
    borderRadius: 8,
    backgroundColor: '#F7F7F7',
    padding: 12,
    gap: 10,
  },
  label: {
    fontWeight: '600',
    color: '#1A1A1A',
  },
});
