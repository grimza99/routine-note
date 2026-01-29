'use client';

import { useRef, useState } from 'react';

import { Button } from '../../../shared/ui/buttons/Button';
import { InputField } from '../../../shared/ui/fields/InputField';
import { useCreateRoutineMutation } from '../model/routine.muation';
import { BouncingDots } from '@/shared';

export default function CreateRoutineModal() {
  const nextIdRef = useRef(1);
  const [routineName, setRoutineName] = useState('');
  const [exercises, setExercises] = useState<{ id: number; name: string }[]>([{ id: nextIdRef.current, name: '' }]);
  const { mutateAsync: createRoutine, isPending } = useCreateRoutineMutation();

  const handleAddExercise = () => {
    nextIdRef.current += 1;
    setExercises((prev) => [...prev, { id: nextIdRef.current, name: '' }]);
  };

  const handleRemoveExercise = (targetId: number) => {
    if (exercises.length <= 1) {
      // todo 최소 하나의 운동은 남아있어야 함
      return;
    }
    setExercises((prev) => prev.filter((exercise) => exercise.id !== targetId));
  };

  const handleExerciseChange = (targetId: number, value: string) => {
    setExercises((prev) =>
      prev.map((exercise) => (exercise.id === targetId ? { ...exercise, name: value } : exercise)),
    );
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    if (exercises.length <= 1) {
      // todo 최소 하나의 운동은 남아있어야 함
      return;
    }
    event.preventDefault();

    await createRoutine({
      routineName,
      exercises: exercises.map((exercise) => {
        return { id: exercise.id, exerciseName: exercise.name };
      }),
    });
    setRoutineName('');
    setExercises([{ id: 1, name: '' }]);
    nextIdRef.current = 1;
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
            label={isPending ? <BouncingDots color="primary" /> : `운동 추가`}
            className="w-auto"
            onClick={handleAddExercise}
          />
        </div>

        <div className="flex flex-col gap-4">
          {exercises.map((exercise, idx) => (
            <div
              key={exercise.id}
              className="flex flex-row gap-2 rounded-lg border p-3 items-end w-full"
              style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)' }}
            >
              <InputField
                label={`운동${idx + 1} 이름`}
                placeholder="예: 스쿼트"
                value={exercise.name}
                onChange={(event) => handleExerciseChange(exercise.id, event.target.value)}
                required
                className="flex-2"
              />
              <div className="flex items-center justify-between">
                {exercises.length > 1 ? (
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
        <Button label="루틴 저장" className="w-auto" type="submit" disabled={isButtonDisabled} />
      </div>
    </form>
  );
}
