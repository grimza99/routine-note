'use client';

import { useRef, useState } from 'react';

import { IRoutinePayload, useCreateRoutineMutation } from '../model/routine.muation';
import { useToast } from '@/shared/hooks';
import { InputField, Button, BouncingDots } from '@/shared/ui';
import { A11Y_LABELS } from '@/shared/constants';
import RoutineItem from './RoutineItem';
import { TTraining } from '@routine-note/package-shared';

interface CreateRoutineExercisePayload extends Omit<IRoutinePayload, 'exercises'> {
  id: string;
  name: string;
  trainingType: TTraining;
}
export default function CreateRoutineModal({ onClose }: { onClose: () => void }) {
  const nextIdRef = useRef('1');
  const [routineName, setRoutineName] = useState('');
  const [exercises, setExercises] = useState<CreateRoutineExercisePayload[]>([
    { id: nextIdRef.current, name: '', trainingType: 'STRENGTH' },
  ]);
  const { mutateAsync: createRoutine, isPending } = useCreateRoutineMutation();

  const { showToast } = useToast();
  const handleAddExercise = () => {
    const nextId = (parseInt(nextIdRef.current) + 1).toString();
    setExercises((prev) => [...prev, { id: nextId, name: '', trainingType: 'STRENGTH' }]);
    nextIdRef.current = nextId;
  };

  const handleRemoveExercise = (targetId: string) => {
    setExercises((prev) => prev.filter((exercise) => exercise.id !== targetId));
  };

  const handleExerciseChange = (targetId: string, value: string, trainingType: TTraining) => {
    setExercises((prev) =>
      prev.map((exercise) => (exercise.id === targetId ? { ...exercise, name: value, trainingType } : exercise)),
    );
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (exercises.length < 1) {
      showToast({ message: '하나이상의 운동이 필요합니다.', variant: 'error' });
      return;
    }
    await createRoutine({
      name: routineName,
      exercises: exercises.map((exercise) => {
        return { id: exercise.id, name: exercise.name, trainingType: exercise.trainingType };
      }),
    });
    setRoutineName('');
    setExercises([{ id: '1', name: '', trainingType: 'STRENGTH' }]);
    nextIdRef.current = '1';
    onClose();
  };

  const isButtonDisabled = routineName.trim() === '' || exercises.some((ex) => !ex.name.trim()) || isPending;

  return (
    <form className="flex flex-col gap-6 p-6" onSubmit={handleSubmit}>
      <header className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold text-text-primary">루틴 만들기</h2>
        <p className="text-sm text-text-secondary">루틴 이름과 운동을 추가해 주세요.</p>
      </header>

      <InputField
        label="루틴 이름"
        placeholder="예: 하체 루틴"
        value={routineName}
        onChange={(event) => setRoutineName(event.target.value)}
        required
      />

      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-text-primary">운동 구성</h3>
          <Button
            aria-label={A11Y_LABELS.ROUTINE.addExercise}
            label={`운동 추가`}
            className="w-auto"
            onClick={handleAddExercise}
            disabled={isPending}
          />
        </div>

        <div className="flex flex-col gap-4">
          {exercises.map((exercise, idx) => (
            <RoutineItem
              key={exercise.id}
              exercise={exercise}
              idx={idx}
              visibleRemoveButton={exercises.length > 1}
              onExerciseChange={(targetId, value, trainingType) => handleExerciseChange(targetId, value, trainingType)}
              onRemoveExercise={() => handleRemoveExercise(exercise.id)}
            />
          ))}
        </div>
      </section>

      <div className="flex justify-end gap-3">
        <Button
          aria-label={A11Y_LABELS.ROUTINE.confirmCreate}
          label={isPending ? <BouncingDots /> : '루틴 저장'}
          className="w-auto"
          type="submit"
          disabled={isButtonDisabled}
        />
      </div>
    </form>
  );
}
