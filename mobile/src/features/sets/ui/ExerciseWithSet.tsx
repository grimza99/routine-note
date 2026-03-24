'use client';

import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ICardioSet, IStrengthSet, IWorkoutExercise } from '@routine-note/package-shared';

import { NumberStepper } from '@/shared/ui';
import CardioSetBox from './CardioSetBox';
import StrengthSetBox from './StrengthSetBox';
import { useRef } from 'react';

type ExerciseWithSetProps = {
  initialExercise: IWorkoutExercise;
  onChangeEx: (exercise: IWorkoutExercise) => void;
};

export function ExerciseWithSet({ initialExercise, onChangeEx }: ExerciseWithSetProps) {
  const [sets, setSets] = useState<(ICardioSet | IStrengthSet)[]>(initialExercise.sets);

  const refId = useRef('1');

  const handleSetLengthChagne = (type: 'decreased' | 'increased') => {
    if (type === 'decreased') {
      setSets((prev) => prev.slice(0, prev.length - 1));
      onChangeEx({
        ...initialExercise,
        sets: initialExercise.sets.slice(0, initialExercise.sets.length - 1),
      });
    } else {
      const nextSetId = (Number(refId.current) + 1).toString();
      refId.current = nextSetId;

      if (initialExercise.trainingType === 'CARDIO') {
        setSets((prev) => [...prev, { id: refId.current, type: 'DISTANCE', value: 0 } as ICardioSet]);
      } else {
        setSets((prev) => [...prev, { id: refId.current, weight: 0, reps: 0 } as IStrengthSet]);
      }
      onChangeEx({
        ...initialExercise,
        sets:
          initialExercise.trainingType === 'CARDIO'
            ? ([...sets, { id: nextSetId, type: 'DISTANCE', value: 0 } as ICardioSet] as ICardioSet[])
            : ([...sets, { id: nextSetId, weight: 0, reps: 0 } as IStrengthSet] as IStrengthSet[]),
      });
    }
  };

  const handleSetChange = (changedSet: ICardioSet | IStrengthSet) => {
    setSets((prev) =>
      prev.map((set) => {
        if (set.id === changedSet.id) {
          return { ...set, ...changedSet };
        }
        return set;
      }),
    );
    onChangeEx({
      ...initialExercise,
      sets:
        initialExercise.trainingType === 'CARDIO'
          ? (sets as ICardioSet[]).map((set) => (set.id === changedSet.id ? { ...set, ...changedSet } : set))
          : (sets as IStrengthSet[]).map((set) => (set.id === changedSet.id ? { ...set, ...changedSet } : set)),
    });
  };

  return (
    <View key={initialExercise.id} style={styles.listContainer}>
      <View style={styles.topContainer}>
        <Text style={styles.exName}>{initialExercise.name}</Text>
        <NumberStepper
          value={sets.length || 0}
          min={0}
          onDecrease={() => handleSetLengthChagne('decreased')}
          onIncrease={() => handleSetLengthChagne('increased')}
        />
      </View>
      {sets.length > 0 && (
        <View style={styles.setList}>
          <View style={{ width: 'auto', height: 1, backgroundColor: '#E0E0E0', marginBottom: 2 }} />
          {initialExercise.trainingType === 'CARDIO' ? (
            <>
              {sets.map((set, idx) => (
                <CardioSetBox
                  index={idx}
                  key={set.id}
                  initialSet={set as ICardioSet}
                  onChange={(type, value) => handleSetChange({ id: set.id, type, value } as ICardioSet)}
                />
              ))}
            </>
          ) : (
            <>
              {sets.map((set, idx) => (
                <StrengthSetBox
                  index={idx}
                  key={set.id}
                  initialSet={set as IStrengthSet}
                  onChange={(weight, reps) => handleSetChange({ id: set.id, weight, reps } as IStrengthSet)}
                />
              ))}
            </>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  listContainer: {
    display: 'flex',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderColor: '#E0E0E0',
    borderWidth: 1.5,
    borderRadius: 6,
  },
  topContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  exName: {
    fontWeight: 400,
    color: '#575757',
  },
  setList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
    paddingHorizontal: 4,
  },
});
