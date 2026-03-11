'use client';

import { useEffect, useRef, useState } from 'react';
import { TTraining } from '@routine-note/package-shared';

import { useEditRoutineMutation } from '../model/routine.muation';
import { useRoutineDetailQuery } from '@/entities';
import { Button, InputField, BouncingDots } from '@/shared/ui';
import { useToast } from '@/shared/hooks';
import { A11Y_LABELS } from '@/shared/constants';
import RoutineItem from './RoutineItem';

interface EditRoutinePayload {
  name: string;
  exercises: { id: string; name: string; trainingType?: TTraining }[];
}
const initialPayload: EditRoutinePayload = {
  name: '',
  exercises: [],
};

export default function EditRoutineModal({ routineId, onClose }: { routineId: string; onClose: () => void }) {
  const nextIdRef = useRef(1);
  const [editRoutinePayload, setEditRoutinePayload] = useState<EditRoutinePayload>(initialPayload);
  const [isFormDirty, setIsFormDirty] = useState(false);

  const { showToast } = useToast();

  const { data: draftRoutineData } = useRoutineDetailQuery(routineId);
  const { mutateAsync: editRoutine, isPending } = useEditRoutineMutation(routineId);

  useEffect(() => {
    if (draftRoutineData) {
      setEditRoutinePayload({
        name: draftRoutineData.name,
        exercises: draftRoutineData.exercises.map((exercise) => ({
          id: exercise.id,
          name: exercise.name,
          trainingType: exercise.trainingType,
        })),
      });
      nextIdRef.current = draftRoutineData.exercises.length;
    }
  }, [draftRoutineData]);

  //handlers
  const handleAddExercise = () => {
    nextIdRef.current += 1;
    setEditRoutinePayload((prev) => ({
      ...prev,
      exercises: [...prev.exercises, { id: nextIdRef.current.toString(), name: '' }],
    }));
  };

  const handleRemoveExercise = (targetId: number | string) => {
    setEditRoutinePayload((prev) => ({
      ...prev,
      exercises: prev.exercises.filter((exercise) => exercise.id !== targetId.toString()),
    }));
  };

  const handlePayloadChange = (key: 'name' | string, value: string) => {
    setIsFormDirty(true);
    if (key === 'name') {
      setEditRoutinePayload((prev) => ({
        ...prev,
        name: value.trim(),
      }));
    } else {
      setEditRoutinePayload((prev) => ({
        ...prev,
        exercises: prev.exercises.map((exercise) =>
          exercise.id === key.toString() ? { ...exercise, name: value.trim() } : exercise,
        ),
      }));
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (editRoutinePayload.exercises.length < 1) {
      showToast({ message: '하나이상의 운동이 필요합니다.', variant: 'error' });
      return;
    }
    await editRoutine(editRoutinePayload);
    setEditRoutinePayload(initialPayload);
    nextIdRef.current = 1;
    onClose();
  };

  const isButtonDisabled =
    editRoutinePayload.name.trim() === '' || editRoutinePayload.exercises.some((ex) => !ex.name.trim()) || isPending;

  return (
    <form className="flex flex-col gap-6 p-6" onSubmit={handleSubmit}>
      <header className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold text-text-primary">루틴 수정</h2>
      </header>

      <InputField
        label="루틴 이름"
        placeholder="예: 하체 루틴"
        value={editRoutinePayload.name}
        onChange={(event) => handlePayloadChange('name', event.target.value)}
        required
      />

      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-text-primary">운동 구성</h3>
          <Button
            aria-label={A11Y_LABELS.ROUTINE.addExercise}
            label="운동 추가"
            className="w-auto"
            onClick={handleAddExercise}
            disabled={isPending}
          />
        </div>

        <div className="flex flex-col gap-4">
          {editRoutinePayload.exercises.map((exercise, idx) => (
            <RoutineItem
              key={exercise.id}
              exercise={exercise}
              idx={idx}
              visibleRemoveButton={editRoutinePayload.exercises.length > 1}
              onExerciseChange={(targetId, value) => handlePayloadChange(targetId, value)}
              onRemoveExercise={() => handleRemoveExercise(exercise.id)}
              initialTrainingType={exercise.trainingType as 'STRENGTH' | 'CARDIO'}
            />
          ))}
        </div>
      </section>

      <div className="flex justify-end gap-3">
        <Button
          aria-label={A11Y_LABELS.ROUTINE.confirmEdit}
          label={isPending ? <BouncingDots color="primary" /> : `수정`}
          className="w-auto"
          type="submit"
          disabled={isButtonDisabled || !isFormDirty}
        />
      </div>
    </form>
  );
}
