import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useState, useCallback, useEffect, useRef } from 'react';
import { ANALYTICS_EVENTS, IExercise, IRoutine, trackEvent, TTraining } from '@routine-note/package-shared';

import { routineApi } from '../../../routine/api/routineApi';
import { formatDate, formatMonthDay } from '../../../../shared/libs';
import { workoutApi } from '../../api/workoutApi';
import { Button } from '../../../../shared/ui';
import { WorkoutRoutineCard } from '../WorkoutRoutineCard';
import { ExerciseField } from '@/widget';

interface WorkoutSheetProps {
  date: Date;
  currentRoutineIds: string[];
  currentStandaloneExercises: IExercise[];
  workoutId?: string;
  onSubmitSuccess: (date: Date) => void;
}

export function WorkoutSheet({
  date,
  currentRoutineIds,
  currentStandaloneExercises,
  workoutId,
  onSubmitSuccess,
}: WorkoutSheetProps) {
  // const type = workoutId ? 'manage' : 'create';
  const [selectedRoutineIds, setSelectedRoutineIds] = useState(currentRoutineIds);
  const [addedExercises, setAddedExercises] = useState(currentStandaloneExercises);
  const [routineTemplate, setRoutineTemplate] = useState<IRoutine[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const nextIdRef = useRef(1);

  const loadRoutines = useCallback(async () => {
    const list = await routineApi.list();
    setRoutineTemplate(list);
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
    setSelectedRoutineIds((prevSelected) => {
      if (prevSelected.includes(routineId)) {
        return prevSelected.filter((id) => id !== routineId);
      } else {
        return [...prevSelected, routineId];
      }
    });
  };

  const handleExerciseAdd = () => {
    const newExercise: IExercise = { id: nextIdRef.current.toString(), name: '', trainingType: 'STRENGTH' };
    nextIdRef.current += 1;
    setAddedExercises((prev) => [...prev, newExercise]);
  };

  const handleRemoveExercise = (targetId: string) => {
    setAddedExercises((prev) => prev.filter((exercise) => exercise.id !== targetId));
  };

  const handleExerciseChange = (targetId: string, value: string, trainingType: TTraining) => {
    setAddedExercises((prev) =>
      prev?.map((exercise) => (exercise.id === targetId ? { ...exercise, name: value, trainingType } : exercise)),
    );
  };
  const handleSubmit = async () => {
    if (selectedRoutineIds.length === 0 && addedExercises.length === 0) {
      Alert.alert('운동기록생성', '최소 하나의 루틴이나 운동을 선택해야 합니다.');
      return;
    }

    try {
      setIsSaving(true);
      const payload = {
        date: formatDate(date), // YYYY-MM-DD
        routines: selectedRoutineIds.map((id) => ({ id })),
        standalone_exercises: addedExercises.map((exercise) => ({
          name: exercise.name,
          trainingType: exercise.trainingType,
        })),
      };
      if (!!workoutId) {
        (await workoutApi.update(workoutId, payload),
          void trackEvent({
            eventName: ANALYTICS_EVENTS.WORKOUT_UPDATED,
            properties: {
              selectedDate: formatDate(date),
              ...payload,
            },
          }));
        Alert.alert('완료', '운동 기록을 수정했습니다.');
      } else {
        await workoutApi.create(payload);
        void trackEvent({
          eventName: ANALYTICS_EVENTS.WORKOUT_CREATED,
          properties: {
            ...payload,
          },
        });
        Alert.alert('완료', '운동 기록을 생성했습니다.');
      }
    } catch (error) {
      Alert.alert(
        !!workoutId ? '운동 기록 수정 실패' : '운동 기록 생성 실패',
        error instanceof Error ? error.message : '오류가 발생했습니다.',
      );
    } finally {
      setIsSaving(false);
      onSubmitSuccess(date);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.sheetContent}>
      <View style={styles.form}>
        <Text style={styles.secondaryTitle}>
          {formatMonthDay(date)} 운동 기록 {!!workoutId ? '수정' : '생성'}
        </Text>
        {!!!workoutId && <Text style={styles.label}>기록할 루틴 선택</Text>}
        <ScrollView contentContainerStyle={styles.routineList}>
          {routineTemplate.length ? (
            routineTemplate.map((routine) => {
              const selected = selectedRoutineIds.includes(routine.routineId);
              return (
                <WorkoutRoutineCard
                  key={routine.name}
                  routineName={routine.name}
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
        <Button label="루틴외의 운동 추가" onPress={handleExerciseAdd} variant="secondary" />
        {addedExercises?.map((exercise, idx) => (
          <ExerciseField
            key={idx}
            idx={idx}
            exercise={exercise}
            visibleRemoveButton={addedExercises.length > 1}
            onRemoveExercise={handleRemoveExercise}
            onExerciseChange={handleExerciseChange}
          />
        ))}

        <Button
          label={isSaving ? '...' : !!workoutId ? '운동 기록 수정' : '운동 기록 생성'}
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
