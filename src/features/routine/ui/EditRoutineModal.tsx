'use client';

import { useEffect, useRef, useState } from 'react';

import { useEditRoutineMutation } from '../model/routine.muation';
import { useRoutineDetailQuery } from '@/entities';
import { Button, InputField, BouncingDots } from '@/shared/ui';
import { useToast } from '@/shared/hooks';
import { A11Y_LABELS } from '@/shared/constants';

interface EditRoutinePayload {
  routineName: string;
  exercises: { id: string; exerciseName: string }[];
}
const initialPayload: EditRoutinePayload = {
  routineName: '',
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
        routineName: draftRoutineData.routineName,
        exercises: draftRoutineData.exercises.map((exercise) => ({
          id: exercise.exerciseId,
          exerciseName: exercise.exerciseName,
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
      exercises: [...prev.exercises, { id: nextIdRef.current.toString(), exerciseName: '' }],
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
        routineName: value.trim(),
      }));
    } else {
      setEditRoutinePayload((prev) => ({
        ...prev,
        exercises: prev.exercises.map((exercise) =>
          exercise.id === key.toString() ? { ...exercise, exerciseName: value.trim() } : exercise,
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
    editRoutinePayload.routineName.trim() === '' ||
    editRoutinePayload.exercises.some((ex) => !ex.exerciseName.trim()) ||
    isPending;

  return (
    <form className="flex flex-col gap-6 p-6" onSubmit={handleSubmit}>
      <header className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold text-text-primary">루틴 수정</h2>
      </header>

      <InputField
        label="루틴 이름"
        placeholder="예: 하체 루틴"
        value={editRoutinePayload.routineName}
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
            <div
              key={exercise.id}
              className="flex flex-row gap-2 rounded-lg border p-3 items-end w-full"
              style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)' }}
            >
              <InputField
                label={`운동${idx + 1} 이름`}
                placeholder="예: 스쿼트"
                value={exercise.exerciseName}
                onChange={(event) => handlePayloadChange(exercise.id, event.target.value)}
                required
                className="flex-2"
              />
              <div className="flex items-center justify-between">
                {editRoutinePayload.exercises.length > 1 ? (
                  <Button
                    label="삭제"
                    className="w-auto"
                    variant="secondary"
                    onClick={() => handleRemoveExercise(exercise.id)}
                  />
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="flex justify-end gap-3">
        <Button
          label={isPending ? <BouncingDots color="primary" /> : `수정`}
          className="w-auto"
          type="submit"
          disabled={isButtonDisabled || !isFormDirty}
        />
      </div>
    </form>
  );
}
