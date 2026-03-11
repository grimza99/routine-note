import { BinaryTabs, Button, InputField } from '@/shared/ui';
import { TrashIcon } from '@heroicons/react/24/solid';
import { TTraining } from '@routine-note/package-shared';
import { useState } from 'react';

interface RoutineItemProps {
  exercise: { id: string; name: string };
  idx: number;
  visibleRemoveButton: boolean;
  onExerciseChange: (targetId: string, value: string) => void;
  onRemoveExercise: (targetId: string) => void;
  initialTrainingType?: TTraining;
}

export default function RoutineItem({
  exercise,
  idx,
  visibleRemoveButton,
  onExerciseChange,
  onRemoveExercise,
  initialTrainingType = 'STRENGTH',
}: RoutineItemProps) {
  const [trainingType, setTrainingType] = useState<TTraining>(initialTrainingType);
  return (
    <div className="flex flex-row gap-2 rounded-lg border p-3 items-end w-full border-border bg-surface">
      <InputField
        label={`운동${idx + 1} 이름`}
        placeholder="예: 스쿼트"
        value={exercise.name}
        onChange={(event) => onExerciseChange(exercise.id, event.target.value)}
        required
        className="flex-2"
      />

      <BinaryTabs
        value={trainingType}
        onChange={() => {
          setTrainingType((prev) => (prev === 'STRENGTH' ? 'CARDIO' : 'STRENGTH'));
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
