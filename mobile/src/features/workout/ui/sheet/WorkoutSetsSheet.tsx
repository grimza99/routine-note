import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { IWorkoutBydateResponse } from '@routine-note/package-shared';

import { formatMonthDay } from '../../../../shared/libs';
import { ExerciseWithSet } from '@/features/sets/ui/ExerciseWithSet';
import { Button } from '@/shared/ui';
import { useState } from 'react';

interface WorkoutSheetSetsProps {
  selectedDate: Date;
  initialWorkoutData?: IWorkoutBydateResponse | null;
  onSubmitSuccess: (date: Date) => void;
}

export function WorkoutSetsSheet({ selectedDate, initialWorkoutData, onSubmitSuccess }: WorkoutSheetSetsProps) {
  const [note, setNote] = useState('');

  const [isSaving, setIsSaving] = useState(false);

  const routines = initialWorkoutData ? initialWorkoutData.routines : [];
  const standaloneExercises = initialWorkoutData ? initialWorkoutData.standalone_exercises : [];

  const handleSubmit = async () => {};

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
          <View>
            <Text style={styles.routineName}>{routine.name}</Text>
            {routine.exercises.map((exercise) => (
              <ExerciseWithSet key={exercise.id} initialExercise={exercise} onChangeEx={() => {}} />
            ))}
          </View>
        ))}
        {standaloneExercises.map((ex) => (
          <ExerciseWithSet key={ex.id} initialExercise={ex} onChangeEx={() => {}} />
        ))}
      </ScrollView>
      {/* {type === 'routine-exercise' && (
        <Input
          placeholder="루틴에 대한 메모를 자유롭게 남겨주세요."
          value={note}
          onChange={(text) => setNote(text.nativeEvent.text)}
          multiline
          style={{ height: 60, textAlignVertical: 'top' }}
        />
      )} */}
      <Button label={isSaving ? '...' : '저장'} onPress={handleSubmit} disabled={isSaving} />
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
  routineName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  list: {
    height: 'auto',
    gap: 4,
  },
});
