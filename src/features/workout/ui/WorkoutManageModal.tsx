'use client';

import { useState } from 'react';

import { useSetsCreateMutation, useSetsDeleteMutation, useSetsEditMutation } from '../model/sets.mutation';
import { useNoteMutation } from '../model/note.mutation';
import { Button, NumberStepper, TextareaField } from '@/shared/ui';
import SetManageBox from './SetManageBox';
import { IExercise } from '@/shared/types';
import { useToast } from '@/shared/hooks';
import { TOAST_MESSAGE, A11Y_LABELS } from '@/shared/constants';
import { cn } from '@/shared/libs';

type RoutineRecordModalContentProps = {
  title: string;
  initialExercises: IExercise[] | null;
  initialNote?: string;
  routineId?: string;
  onClose: () => void;
};

export function WorkoutManageModal({
  title,
  initialExercises,
  initialNote = '',
  routineId,
  onClose,
}: RoutineRecordModalContentProps) {
  const [note, setNote] = useState(initialNote);
  const [exerciseState, setExerciseState] = useState(initialExercises);

  const { showToast } = useToast();

  const { mutateAsync: createSets } = useSetsCreateMutation();
  const { mutateAsync: deleteSet } = useSetsDeleteMutation();
  const { mutateAsync: editSets } = useSetsEditMutation();

  const { mutateAsync: manageNote } = useNoteMutation(routineId || '');

  if (!initialExercises) return;

  const handleSetLengthChagne = (exerciseId: string, isDecrease: boolean) => {
    if (isDecrease) {
      setExerciseState(
        (prev) =>
          prev?.map((exercise) => {
            if (exercise.id === exerciseId) {
              const newSets = exercise.sets.slice(0, -1);
              return { ...exercise, sets: newSets };
            }
            return exercise;
          }) || null,
      );
      return;
    }
    setExerciseState(
      (prev) =>
        prev?.map((exercise) => {
          if (exercise.id === exerciseId) {
            const newSet = { id: crypto.randomUUID(), weight: 0, note: '', reps: 0 };
            return { ...exercise, sets: [...exercise.sets, newSet] };
          }
          return exercise;
        }) || null,
    );
  };

  const handleSetChange = (exerciseId: string, setId: string, weight: number, reps: number) => {
    setExerciseState(
      (prev) =>
        prev?.map((exercise) => {
          if (exercise.id === exerciseId) {
            const updatedSets = exercise.sets.map((set) => {
              if (set.id === setId) {
                return { ...set, weight, reps };
              }
              return set;
            });
            return { ...exercise, sets: updatedSets };
          }
          return exercise;
        }) || [],
    );
  };

  const initialSetsIds = initialExercises.flatMap((exercise) => exercise.sets.map((set) => set.id));

  const handleSubmit = async () => {
    if (!exerciseState) return;

    try {
      for (const exercise of exerciseState) {
        const removedSets = initialExercises
          .find((initialExercise) => initialExercise.id === exercise.id)
          ?.sets.filter((set) => !exercise.sets.some((currentSet) => currentSet.id === set.id));

        // 삭제된 세트 처리
        if (removedSets && removedSets.length > 0) {
          for (const set of removedSets) {
            await deleteSet(set.id);
          }
        }
        for (const set of exercise.sets) {
          if (set.reps === 0) {
            showToast({ message: '횟수는 0보다 커야 합니다.', variant: 'error' });
            continue;
          }
          if (initialSetsIds.includes(set.id)) {
            await editSets({
              id: set.id,
              weight: set.weight,
              reps: set.reps,
            });
            continue;
          }

          await createSets({
            id: exercise.id,
            weight: set.weight,
            reps: set.reps,
          });
        }
      }
      if (note.trim() !== '') {
        await manageNote({
          note,
        });
      }
      showToast({ message: TOAST_MESSAGE.SUCCESS_UPDATE_WORKOUT });
    } catch {
      showToast({ message: '실패', variant: 'error' });
      return;
    }
    onClose();
  };

  return (
    <div className="flex flex-col gap-4 p-6">
      <header className="flex flex-col gap-1">
        <h2 className="text-lg font-semibold text-text-primary">{title}</h2>
      </header>

      <section className="flex flex-col gap-3">
        {exerciseState &&
          exerciseState.map((exercise) => (
            <div key={exercise.id} className={cn('rounded-lg border p-2 bg-surface border-border flex flex-col gap-2')}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-text-primary">{exercise.exerciseName}</p>
                </div>
                <NumberStepper
                  value={exercise.sets.length || 0}
                  min={0}
                  onDecrease={() => handleSetLengthChagne(exercise.id, true)}
                  onIncrease={() => handleSetLengthChagne(exercise.id, false)}
                  ariaLabel={{
                    increase: A11Y_LABELS.WORKOUT_SETS.addSet,
                    decrease: A11Y_LABELS.WORKOUT_SETS.deleteSet,
                  }}
                />
              </div>
              {exercise.sets.length > 0 && (
                <div className="flex-col flex gap-2 px-2">
                  {exercise.sets.map((set, index) => (
                    <SetManageBox
                      key={set.id}
                      index={index}
                      initialSet={{ weight: set.weight, reps: set.reps }}
                      onChange={(weight, reps) => handleSetChange(exercise.id, set.id, weight, reps)}
                    />
                  ))}
                </div>
              )}
            </div>
          ))}
      </section>

      {routineId && (
        <TextareaField
          label={A11Y_LABELS.WORKOUT_SETS.memoInput}
          placeholder={`오늘 수행한 ${title} 루틴에 대한 메모를 남겨주세요.`}
          value={note}
          onChange={(event) => setNote(event.target.value)}
        />
      )}

      <div className="flex justify-end gap-2">
        <Button label="취소" variant="secondary" onClick={onClose} />
        <Button label="저장" onClick={handleSubmit} aria-label={A11Y_LABELS.WORKOUT_SETS.confirmCreate} />
      </div>
    </div>
  );
}
