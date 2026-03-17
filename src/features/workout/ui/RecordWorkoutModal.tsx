import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';
import { IExercise, TTraining } from '@routine-note/package-shared';

import { useRoutineList } from '@/entities';
import { useCreateWorkoutMutation, useUpdateWorkoutMutation } from '../model/workout.mutation';
import { Button, ExerciseField, RoutineCard } from '@/shared/ui';
import { cn, formatDate } from '@/shared/libs';
import { useToast } from '@/shared/hooks';
import { A11Y_LABELS, PATHS } from '@/shared/constants';
export interface RecordWorkoutModalProps {
  date: Date;
  currentRoutineIds: string[];
  currentStandaloneExercises: IExercise[];
  onClose: () => void;
  workoutId?: string;
}

export default function RecordWorkoutModal({
  date,
  currentRoutineIds,
  currentStandaloneExercises,
  onClose,
  workoutId,
}: RecordWorkoutModalProps) {
  const [selectedRoutineIds, setSelectedRoutineIds] = useState<string[]>(currentRoutineIds);
  const [addedExercises, setAddedExercises] = useState<IExercise[]>(currentStandaloneExercises);

  const { showToast } = useToast();

  const { data: routineTemplate } = useRoutineList();
  const { mutateAsync: createWorkout } = useCreateWorkoutMutation();
  const { mutateAsync: updateWorkout } = useUpdateWorkoutMutation(workoutId);

  const nextIdRef = useRef(1);
  const router = useRouter();

  //handlers
  const handleRoutineSelect = (routineId: string) => {
    setSelectedRoutineIds((prevSelected) => {
      if (prevSelected.includes(routineId)) {
        return prevSelected.filter((id) => id !== routineId);
      } else {
        return [...prevSelected, routineId];
      }
    });
  };

  const handleExerciseAdd = () => {
    const newExercise: IExercise = { id: nextIdRef.current.toString(), name: '', trainingType: 'STRENGTH' };
    nextIdRef.current += 1;
    setAddedExercises((prev) => [...prev, newExercise]);
  };

  const handleRemoveExercise = (targetId: string) => {
    setAddedExercises((prev) => prev.filter((exercise) => exercise.id !== targetId));
  };

  const handleExerciseChange = (targetId: string, value: string, trainingType: TTraining) => {
    setAddedExercises((prev) =>
      prev.map((exercise) => (exercise.id === targetId ? { ...exercise, name: value, trainingType } : exercise)),
    );
  };

  const handleConfirm = async () => {
    if (selectedRoutineIds.length === 0 && addedExercises.length === 0) {
      showToast({ message: '최소 하나의 루틴이나 운동을 선택해야 합니다.', variant: 'error' });
      return;
    }

    if (workoutId) {
      await updateWorkout({
        date: formatDate(date), // YYYY-MM-DD
        routines: selectedRoutineIds.map((id) => ({ id })),
        standalone_exercises: addedExercises.map((exercise) => ({
          name: exercise.name,
          trainingType: exercise.trainingType,
        })),
      });
    } else {
      await createWorkout({
        date: formatDate(date), // YYYY-MM-DD
        routines: selectedRoutineIds.map((id) => ({ id })),
        standalone_exercises: addedExercises.map((exercise) => ({
          name: exercise.name,
          trainingType: exercise.trainingType,
        })),
      });
    }
    onClose();
  };

  const isSelected = (routineId: string) => selectedRoutineIds.includes(routineId);

  return (
    <div className="flex flex-col gap-4 p-6">
      <h2 className="text-lg font-semibold text-text-primary">루틴 선택</h2>
      <p className="text-sm text-text-secondary">오늘 기록할 루틴을 선택해 주세요.</p>
      <div>
        {routineTemplate && routineTemplate.length > 0 ? (
          <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {routineTemplate?.map((routine) => (
              <div className="relative" key={routine.routineId} onClick={() => handleRoutineSelect(routine.routineId)}>
                <RoutineCard
                  routineName={routine.name}
                  exercises={routine.exercises}
                  className={cn(isSelected(routine.routineId) && 'scale-[1.02] border-3 border-primary shadow-lg')}
                />
              </div>
            ))}
          </section>
        ) : (
          <section className="w-full border-border border-2 rounded-lg flex flex-col justify-center items-center min-h-30 text-text-secondary p-4 md:text-xl text-center">
            아직 루틴이 없어요! <br />
            나만의 운동 루틴을 추가 해보세요!
            <Button
              label="루틴 추가하기"
              className="mt-4 w-fit"
              onClick={() => {
                router.push(PATHS.ROUTINE);
              }}
            />
          </section>
        )}
      </div>
      {addedExercises.length > 0 && (
        <>
          {addedExercises.map((exercise, idx) => (
            <ExerciseField
              key={exercise.id}
              exercise={exercise}
              idx={idx}
              visibleRemoveButton={true}
              onExerciseChange={handleExerciseChange}
              onRemoveExercise={handleRemoveExercise}
            />
          ))}
        </>
      )}
      <div className="flex gap-2 justify-end">
        <Button
          variant="secondary"
          onClick={() => {
            handleExerciseAdd();
          }}
          aria-label={A11Y_LABELS.WORKOUT.addStandAloneExercise}
          label="루틴외의 운동 추가하기"
        />
        <Button label="확인" onClick={handleConfirm} aria-label={A11Y_LABELS.WORKOUT.confirmCreate} />
      </div>
    </div>
  );
}
