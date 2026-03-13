'use client';

import { useState } from 'react';
import { IWorkoutExercise } from '@routine-note/package-shared';

import { useSetsCreateMutation, useSetsDeleteMutation, useSetsEditMutation } from '../model/sets.mutation';
import { useNoteMutation } from '../model/note.mutation';
import { Button, TextareaField } from '@/shared/ui';
import { useToast } from '@/shared/hooks';
import { TOAST_MESSAGE, A11Y_LABELS } from '@/shared/constants';
import { ExerciseSets } from './ExerciseSets';

type RoutineRecordModalContentProps = {
  title: string;
  initialExercises: IWorkoutExercise[] | null;
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
  const [exercises, setExercises] = useState(initialExercises || []);

  const { showToast } = useToast();

  const { mutateAsync: createSets } = useSetsCreateMutation();
  const { mutateAsync: deleteSet } = useSetsDeleteMutation();
  const { mutateAsync: editSets } = useSetsEditMutation();

  const { mutateAsync: manageNote } = useNoteMutation(routineId || '');

  if (!initialExercises) return;

  const initialSetsIds = initialExercises.flatMap((exercise) => exercise.sets.map((set) => set.id));

  const handleChagneExercises = (exercises: IWorkoutExercise) => {
    setExercises((prev) =>
      prev.map((ex) => {
        if (ex.id === exercises.id) {
          return exercises;
        }
        return ex;
      }),
    );
  };

  const handleSubmit = async () => {
    try {
      for (const ex of exercises || []) {
        const removedSets = initialExercises
          .find((initialExercise) => initialExercise.id === ex.id)
          ?.sets.filter((set) => !ex.sets.some((currentSet) => currentSet.id === set.id));

        // 삭제된 세트 처리
        if (removedSets && removedSets.length > 0) {
          for (const set of removedSets) {
            await deleteSet(set.id);
          }
        }
        for (const set of ex.sets) {
          if ('reps' in set && 'weight' in set) {
            if (set.reps === 0 || set.weight === 0) {
              showToast({ message: '유효한 값을 입력해주세요', variant: 'error' });
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
              id: ex.id,
              weight: set.weight,
              reps: set.reps,
            });
          }

          if ('value' in set && 'type' in set) {
            if (set.value === 0) {
              showToast({ message: '유효한 값을 입력해주세요', variant: 'error' });
              continue;
            }
            if (initialSetsIds.includes(set.id)) {
              await editSets({
                id: set.id,
                type: set.type,
                value: set.value,
              });
              continue;
            }
            await createSets({
              id: ex.id,
              type: set.type,
              value: set.value,
            });
          }
        }

        if (note.trim() !== '') {
          await manageNote({
            note,
          });
        }

        showToast({ message: TOAST_MESSAGE.SUCCESS_UPDATE_WORKOUT });
      }
    } catch (error) {
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
        {exercises &&
          exercises.map((ex) => (
            <ExerciseSets key={ex.id} initialExercise={ex} onChangeEx={(ex) => handleChagneExercises(ex)} />
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
