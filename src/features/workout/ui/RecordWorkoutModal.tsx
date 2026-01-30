import { useRoutineList } from '@/entities';
import { Button, cn, IExercise, InputField, IRoutine, PATHS, RoutineCard } from '@/shared';
import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';
import { useCreateWorkoutMutation } from '../model/workout.mutation';

interface RecordWorkoutModalProps {
  date: Date;
  currentRoutineIds: string[];
  currentExercises: IExercise[];
  onClose: () => void;
}

interface Exercise {
  id: string;
  name: string;
}

export default function RecordWorkoutModal({
  date,
  currentRoutineIds,
  currentExercises,
  onClose,
}: RecordWorkoutModalProps) {
  const [selectedRoutineIds, setSelectedRoutineIds] = useState<string[]>(currentRoutineIds);
  const [addedExercises, setAddedExercises] = useState<Exercise[]>(currentExercises);

  const { data: routineTemplate } = useRoutineList();
  const { mutateAsync: createWorkout } = useCreateWorkoutMutation();

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
    const newExercise: Exercise = { id: nextIdRef.current.toString(), name: '' };
    nextIdRef.current += 1;
    setAddedExercises((prev) => [...prev, newExercise]);
  };

  const handleRemoveExercise = (targetId: string) => {
    setAddedExercises((prev) => prev.filter((exercise) => exercise.id !== targetId));
  };

  const handleExerciseChange = (targetId: string, value: string) => {
    setAddedExercises((prev) =>
      prev.map((exercise) => (exercise.id === targetId ? { ...exercise, name: value } : exercise)),
    );
  };

  const handleConfirm = async () => {
    await createWorkout({
      date: date.toISOString().slice(0, 10), // YYYY-MM-DD
      routines: selectedRoutineIds.map((id) => ({ routineId: id })),
      exercises: addedExercises.map((exercise) => ({ exerciseName: exercise.name })),
    });

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
                  routineName={routine.routineName}
                  exercises={routine.exercises}
                  className={cn(isSelected(routine.routineId) && 'scale-[1.02] border-3 shadow-lg')}
                />
              </div>
            ))}
          </section>
        ) : (
          <section className="w-full border-border border-2 rounded-lg flex justify-center items-center min-h-30 text-text-secondary p-4 md:text-xl text-center">
            아직 루틴이 없어요! <br />
            나만의 운동 루틴을 추가 해보세요!
            <Button
              label="루틴 추가하기"
              className="mt-4"
              onClick={() => {
                router.push(PATHS.ROUTINE.MANAGE);
              }}
            />
          </section>
        )}
      </div>
      {addedExercises.length > 0 && (
        <>
          {addedExercises.map((exercise, idx) => (
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
                <Button
                  label="삭제"
                  className="w-auto"
                  variant="secondary"
                  onClick={() => handleRemoveExercise(exercise.id)}
                />
              </div>
            </div>
          ))}
        </>
      )}
      <div className="flex gap-2 justify-end">
        <Button
          variant="secondary"
          onClick={() => {
            handleExerciseAdd();
          }}
          label="루틴외의 운동 추가하기"
        />
        <Button label="확인" onClick={handleConfirm} />
      </div>
    </div>
  );
}
