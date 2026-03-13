'use client';

import { useState } from 'react';
import { ICardioSet, IStrengthSet, IWorkoutExercise } from '@routine-note/package-shared';

import { NumberStepper } from '@/shared/ui';
import { A11Y_LABELS } from '@/shared/constants';
import { cn } from '@/shared/libs';
import CardioSetBox from './CardioSetBox';
import SetManageBox from './SetManageBox';

type Props = {
  initialExercise: IWorkoutExercise;
  onChangeEx: (exercise: IWorkoutExercise) => void;
};

export function ExerciseSets({ initialExercise, onChangeEx }: Props) {
  const [sets, setSets] = useState<(ICardioSet | IStrengthSet)[]>(initialExercise.sets);

  const handleSetLengthChagne = (type: 'decreased' | 'increased') => {
    if (type === 'decreased') {
      setSets((prev) => prev.slice(0, prev.length - 1));
    } else {
      if (initialExercise.trainingType === 'CARDIO') {
        setSets((prev) => [...prev, { id: crypto.randomUUID(), type: 'DISTANCE', value: 0 } as ICardioSet]);
      } else {
        setSets((prev) => [...prev, { id: crypto.randomUUID(), weight: 0, reps: 0 } as IStrengthSet]);
      }
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
    <>
      <div
        key={initialExercise.id}
        className={cn('rounded-lg border p-2 bg-surface border-border flex flex-col gap-2')}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-text-primary">{initialExercise.name}</p>
          </div>
          <NumberStepper
            value={sets.length || 0}
            min={0}
            onDecrease={() => handleSetLengthChagne('decreased')}
            onIncrease={() => handleSetLengthChagne('increased')}
            ariaLabel={{
              increase: A11Y_LABELS.WORKOUT_SETS.addSet,
              decrease: A11Y_LABELS.WORKOUT_SETS.deleteSet,
            }}
          />
        </div>
        <div className="flex-col flex gap-2 px-2">
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
                <SetManageBox
                  index={idx}
                  key={set.id}
                  initialSet={set as IStrengthSet}
                  onChange={(weight, reps) => handleSetChange({ id: set.id, weight, reps } as IStrengthSet)}
                />
              ))}
            </>
          )}
        </div>
      </div>
    </>
  );
}
