import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { IWorkoutBydateResponse, IWorkoutExercise } from '@routine-note/package-shared';
import { useState } from 'react';

import { formatMonthDay } from '../../../../shared/libs';
import { ExerciseWithSet } from '@/features/sets/ui/ExerciseWithSet';
import { Button } from '@/shared/ui';
import { setsApi } from '@/features/sets/api/setsApi';
import WorkoutRoutine from '@/features/sets/ui/WorkoutRoutine';

interface WorkoutSheetSetsProps {
  selectedDate: Date;
  initialWorkoutData?: IWorkoutBydateResponse | null;
  onSubmitSuccess: (date: Date) => void;
}

export function WorkoutSetsSheet({ selectedDate, initialWorkoutData, onSubmitSuccess }: WorkoutSheetSetsProps) {
  const [isStandAloneSaving, setIsStandAloneSaving] = useState(false);
  const [currentStandaloneExercises, setCurrentStandaloneExercises] = useState(
    initialWorkoutData ? initialWorkoutData.standalone_exercises : [],
  );

  const routines = initialWorkoutData ? initialWorkoutData.routines : [];
  const standaloneExercises = initialWorkoutData ? initialWorkoutData.standalone_exercises : [];
  const initialStandAloneSetsIds = initialWorkoutData
    ? initialWorkoutData.standalone_exercises.flatMap((exercise) => exercise.sets.map((set) => set.id))
    : [];

  const handleChangeEx = (newEx: IWorkoutExercise) => {
    setCurrentStandaloneExercises((prev) => {
      const otherExercises = prev.filter((ex) => ex.id !== newEx.id);
      return [...otherExercises, newEx];
    });
  };
  const handleSubmitStandalone = async () => {
    try {
      for (const ex of currentStandaloneExercises || []) {
        const removedSets = standaloneExercises
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
            if (initialStandAloneSetsIds.includes(set.id)) {
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
            if (initialStandAloneSetsIds.includes(set.id)) {
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
    } catch (error) {
      return;
    }
    onSubmitSuccess(selectedDate);
  };

  if (routines.length === 0 && standaloneExercises.length === 0) {
    return (
      <View style={styles.sheetContent}>
        <Text style={styles.sheetTitle}>{formatMonthDay(selectedDate)} 운동 세트 관리</Text>
        <Text style={{ color: '#858484' }}>해당 날짜에 기록된 운동이 아직 없습니다.</Text>
      </View>
    );
  }
  return (
    <View style={styles.sheetContent}>
      <Text style={styles.sheetTitle}>{formatMonthDay(selectedDate)} 운동 세트 관리</Text>
      <ScrollView contentContainerStyle={styles.list}>
        {routines.map((routine) => (
          <WorkoutRoutine key={routine.id} routine={routine} onSubmitSuccess={() => onSubmitSuccess(selectedDate)} />
        ))}
        {standaloneExercises.length > 0 && (
          <View style={styles.standaloneExContainer}>
            <Text style={styles.title}>루틴외에 운동</Text>
            {standaloneExercises.map((ex) => (
              <ExerciseWithSet key={ex.id} initialExercise={ex} onChangeEx={handleChangeEx} />
            ))}
            <Button
              label={isStandAloneSaving ? '...' : '세트 저장'}
              onPress={handleSubmitStandalone}
              disabled={isStandAloneSaving}
            />
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  sheetContent: {
    gap: 20,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  list: {
    height: 'auto',
    gap: 4,
  },
  standaloneExContainer: {
    borderColor: '#E0E0E0',
    borderWidth: 2,
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
});
