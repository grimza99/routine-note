import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { formatMonthDay } from '../../../../shared/libs';
import { WorkoutBydateResponse } from '../../../../shared/types';
import { ExerciseSetsManageBox } from './ExerciseSetsManageBox';

interface WorkoutSheetSetsProps {
  selectedDate: Date;
  initialWorkoutData?: WorkoutBydateResponse | null;
  onSubmitSuccess: (date: Date) => void;
}

export function WorkoutSetsSheet({ selectedDate, initialWorkoutData, onSubmitSuccess }: WorkoutSheetSetsProps) {
  const routines = initialWorkoutData ? initialWorkoutData.routines : [];
  const standaloneExercises = initialWorkoutData ? initialWorkoutData.exercises : [];

  return (
    <View style={styles.sheetContent}>
      <Text style={styles.sheetTitle}>{formatMonthDay(selectedDate)} 운동 세트 관리</Text>
      <ScrollView contentContainerStyle={styles.list}>
        {routines.map((routine) => (
          <ExerciseSetsManageBox
            key={routine.routineId}
            type="routine-exercise"
            label={routine.routineName}
            selectedDate={selectedDate}
            initialExercises={routine.exercises}
            initialNote={routine.note}
            workoutRoutineId={routine.id}
            onSubmitSuccess={onSubmitSuccess}
          />
        ))}
        <ExerciseSetsManageBox
          label={'루틴 외 운동'}
          type="standalone-exercise"
          selectedDate={selectedDate}
          initialExercises={standaloneExercises}
          onSubmitSuccess={onSubmitSuccess}
        />
      </ScrollView>
    </View>
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
  list: {
    height: 'auto',
    gap: 8,
  },
});
