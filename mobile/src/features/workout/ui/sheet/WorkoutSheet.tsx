import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useState, useCallback, useEffect } from 'react';

import { routineApi } from '../../../routine/api/routineApi';
import { formatDate, formatMonthDay, trackEvent } from '../../../../shared/libs';
import { workoutApi } from '../../api/workoutApi';
import { Button, Input } from '../../../../shared/ui';
import { RoutineItem } from '../../../../shared/types/routine';
import { WorkoutBydateResponse, WorkoutPayload } from '../../../../shared/types';
import { WorkoutRoutineCard } from '../WorkoutRoutineCard';

interface WorkoutSheetProps {
  selectedDate: Date;
  initialWorkoutData?: WorkoutBydateResponse | null;
  onSubmitSuccess: (date: Date) => void;
}
const nomalizedResponseToPayload = (response: WorkoutBydateResponse): WorkoutPayload => ({
  date: response.date,
  routines: response.routines.map((routine) => ({
    routineId: routine.routineId,
    order: routine.order,
  })),
  exercises: response.exercises.map((exercise) => ({
    exerciseName: exercise.exerciseName,
  })),
});

export function WorkoutSheet({ selectedDate, initialWorkoutData, onSubmitSuccess }: WorkoutSheetProps) {
  const type = initialWorkoutData ? 'manage' : 'create';
  const [routines, setRoutines] = useState<RoutineItem[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedRoutineIds, setSelectedRoutineIds] = useState<string[]>(
    initialWorkoutData ? initialWorkoutData.routines.map((routine) => routine.routineId) : [],
  );
  const [payload, setPayload] = useState<WorkoutPayload>(
    initialWorkoutData
      ? nomalizedResponseToPayload(initialWorkoutData)
      : {
          date: formatDate(selectedDate),
          routines: [],
          exercises: [],
        },
  );

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
    const isAreadySelected = selectedRoutineIds.includes(routineId);
    setSelectedRoutineIds((prev) => (isAreadySelected ? prev.filter((id) => id !== routineId) : [...prev, routineId]));
    if (isAreadySelected) {
      setPayload((prev) => ({
        ...prev,
        routines: prev.routines.filter((routine) => routine.routineId !== routineId),
      }));
    } else {
      setPayload((prev) => ({
        ...prev,
        routines: [...prev.routines, targetRoutine],
      }));
    }
  };

  const handleStandaloneExerciseRemove = (index: number) => {
    setPayload((prev) => {
      const updatedExercises = [...prev.exercises];
      updatedExercises.splice(index, 1);
      return { ...prev, exercises: updatedExercises };
    });
  };

  const handleSubmit = async () => {
    try {
      setIsSaving(true);
      if (type === 'manage' && initialWorkoutData) {
        await workoutApi.update(initialWorkoutData.id, payload);
        void trackEvent('workout_updated', {
          selectedDate,
          ...payload,
        });
        Alert.alert('완료', '운동 기록을 수정했습니다.');
      } else {
        await workoutApi.create(payload);
        void trackEvent('workout_created', {
          ...payload,
        });
        Alert.alert('완료', '운동 기록을 생성했습니다.');
      }
    } catch (error) {
      Alert.alert(
        type === 'create' ? '운동 기록 생성 실패' : '운동 기록 수정 실패',
        error instanceof Error ? error.message : '오류가 발생했습니다.',
      );
    } finally {
      setIsSaving(false);
      onSubmitSuccess(selectedDate);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.sheetContent}>
      <View style={styles.form}>
        <Text style={styles.secondaryTitle}>
          {formatMonthDay(selectedDate)} 운동 기록 {type === 'manage' && '수정'}
        </Text>
        {type === 'create' && <Text style={styles.label}>기록할 루틴 선택</Text>}
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
            setPayload((prev) => ({ ...prev, exercises: [...prev.exercises, newExercise] }));
          }}
          variant="secondary"
        />
        {payload.exercises.map((exercise, index) => (
          <View key={index} style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Input
              key={index}
              placeholder="예: 벤치프레스, 스쿼트"
              value={exercise.exerciseName}
              onChange={(text) => {
                const updatedExercises = [...payload.exercises];
                updatedExercises[index].exerciseName = text.nativeEvent.text;
                setPayload((prev) => ({ ...prev, exercises: updatedExercises }));
              }}
              style={{ flex: 1 }}
            />
            <Button label="삭제" onPress={() => handleStandaloneExerciseRemove(index)} />
          </View>
        ))}

        <Button
          label={isSaving ? '...' : type === 'create' ? '운동 기록 생성' : '운동 기록 수정'}
          onPress={handleSubmit}
          disabled={isSaving}
        />
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
