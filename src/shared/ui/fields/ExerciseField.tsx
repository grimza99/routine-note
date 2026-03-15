'use client';
import { useState } from 'react';
import { TrashIcon } from '@heroicons/react/24/solid';
import { IExercise, TTraining } from '@routine-note/package-shared';

import { BinaryTabs, Button, InputField } from '@/shared/ui';
interface ExerciseFieldProps {
  exercise: IExercise;
  idx: number;
  visibleRemoveButton: boolean;
  onExerciseChange: (targetId: string, value: string, trainingType: TTraining) => void;
  onRemoveExercise: (targetId: string) => void;
}

export function ExerciseField({
  exercise,
  idx,
  visibleRemoveButton,
  onExerciseChange,
  onRemoveExercise,
}: ExerciseFieldProps) {
  const [trainingType, setTrainingType] = useState<TTraining>(exercise.trainingType);

  const handleExerciseChange = (value?: string, trainingTypeValue?: TTraining) => {
    onExerciseChange(exercise.id, value || exercise.name, trainingTypeValue || trainingType);
  };

  return (
    <div className="flex flex-row gap-2 rounded-lg border p-3 items-end w-full border-border bg-surface">
      <InputField
        label={`운동${idx + 1} 이름`}
        placeholder="예: 스쿼트"
        value={exercise.name}
        onChange={(event) => handleExerciseChange(event.target.value)}
        required
        className="flex-2"
      />

      <BinaryTabs
        value={trainingType}
        onChange={() => {
          const newTrainingType = trainingType === 'STRENGTH' ? 'CARDIO' : 'STRENGTH';
          setTrainingType((prev) => (prev === 'STRENGTH' ? 'CARDIO' : 'STRENGTH'));
          handleExerciseChange(undefined, newTrainingType);
        }}
        options={[
          { label: '근력', value: 'STRENGTH' as TTraining },
          { label: '유산소', value: 'CARDIO' as TTraining },
        ]}
      />
      <div className="flex items-center justify-between">
        {visibleRemoveButton && (
          <Button
            label={<TrashIcon className="w-4.5 h-4.5 text-primary" />}
            className="w-fit px-2"
            variant="secondary"
            onClick={() => onRemoveExercise(exercise.id)}
          />
        )}
      </div>
    </div>
  );
}
