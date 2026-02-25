'use client';
import { PlusIcon, TrashIcon } from '@heroicons/react/24/solid';

import { useWorkoutByDate } from '@/entities';
import { useDeleteWorkoutMutation } from '../model/workout.mutation';
import { useModal } from '@/shared/hooks';
import { formatDate, formatMonthDay } from '@/shared/libs';
import { Button, Spinner, RecordedRoutineCard } from '@/shared/ui';
import { A11Y_LABELS } from '@/shared/constants';

export default function WorkoutManage({ selectedDate }: { selectedDate: Date }) {
  const { data: workoutByDateData } = useWorkoutByDate(formatDate(selectedDate));
  const { mutateAsync: deleteWorkout } = useDeleteWorkoutMutation(workoutByDateData?.id || '');

  const { openModal } = useModal();

  const currentRoutineIds = workoutByDateData?.routines.map((routine) => routine.routineId) || [];
  const currentStandaloneExercises = workoutByDateData?.exercises || [];

  return (
    <section className="border-2 rounded-xl border-primary w-full min-h-50 p-4">
      <header className="flex items-center justify-between mb-2">
        <span className="text-primary font-bold text-lg md:text-xl">{formatMonthDay(selectedDate)}</span>
        <div className="flex gap-2">
          {workoutByDateData && workoutByDateData.routines.length > 0 && (
            <Button
              label={<TrashIcon className="w-4 h-4 md:h-5 md:w-5" />}
              aria-label={A11Y_LABELS.WORKOUT.delete}
              onClick={() =>
                openModal('deleteWorkout', {
                  description: `${formatMonthDay(selectedDate)} 일자의 운동 기록을 삭제하시겠습니까? 삭제 시 복구할 수 없습니다.`,
                  onConfirm: async () => {
                    await deleteWorkout();
                  },
                  ariaLabel: {
                    rightButton: A11Y_LABELS.WORKOUT.confirmDelete,
                  },
                })
              }
              className="w-fit p-2"
            />
          )}
          <Button
            label={<PlusIcon className="w-4 h-4 md:h-5 md:w-5" />}
            aria-label={A11Y_LABELS.WORKOUT.create}
            onClick={() =>
              openModal('recordWorkout', {
                date: selectedDate,
                currentRoutineIds: currentRoutineIds,
                currentStandaloneExercises: currentStandaloneExercises,
                workoutId: workoutByDateData?.id,
              })
            }
            className="w-fit p-2"
          />
        </div>
      </header>
      {workoutByDateData ? (
        <>
          {workoutByDateData.routines.length > 0 ? (
            <div className="flex gap-4 w-full flex-wrap">
              {workoutByDateData.routines.map((routine) => (
                <div
                  key={routine.id}
                  className="flex items-center gap-2"
                  onClick={() =>
                    openModal('manageWorkout', {
                      title: routine.routineName,
                      initialExercises: routine.exercises,
                      initialNote: routine.note,
                      routineId: routine.id,
                    })
                  }
                >
                  <RecordedRoutineCard title={routine.routineName} exercises={routine.exercises} note={routine.note} />
                </div>
              ))}
              {currentStandaloneExercises.length > 0 && (
                <div
                  className="flex items-center gap-2"
                  onClick={() =>
                    openModal('manageWorkout', {
                      title: '루틴외에 추가된 운동',
                      initialExercises: currentStandaloneExercises,
                    })
                  }
                >
                  <RecordedRoutineCard
                    key="additional-exercises"
                    title="루틴외에 추가된 운동"
                    exercises={currentStandaloneExercises}
                  />
                </div>
              )}
            </div>
          ) : (
            <p className="mt-4 text-text-secondary">운동 기록이 없습니다.</p>
          )}
        </>
      ) : (
        <Spinner />
      )}
    </section>
  );
}
