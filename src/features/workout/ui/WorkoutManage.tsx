'use client';
import { useWorkoutByDate } from '@/entities';
import { Button, CommonConfirmModal, formatDate, formatMonthDay, IExercise, Modal, NoteBadge, Spinner } from '@/shared';
import { useState } from 'react';
import RecordWorkoutModal from './RecordWorkoutModal';
import { RecordedRoutineCard } from '@/shared/ui/cards/RecordedRoutineCard';
import { WorkoutManageModal } from './WorkoutManageModal';
import { useDeleteWorkoutMutation } from '../model/workout.mutation';

export default function WorkoutManage({ selectedDate }: { selectedDate: Date }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isWorkoutManageModalOpen, setIsWorkoutManageModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  const [targetWorkout, setTargetWorkout] = useState<{
    title: string;
    exercises: IExercise[] | null;
    routineId: string;
    note: string;
  }>({
    title: '',
    exercises: null,
    routineId: '',
    note: '',
  });

  const { data: workoutByDateData } = useWorkoutByDate(formatDate(selectedDate));
  const { mutateAsync: deleteWorkout } = useDeleteWorkoutMutation(workoutByDateData?.id || '');

  const currentRoutineIds = workoutByDateData?.routines.map((routine) => routine.id) || [];
  const currentExercises = workoutByDateData?.exercises || [];

  const handleCardClick = (title: string, target: IExercise[], routineId?: string, note?: string) => {
    setTargetWorkout({ title, exercises: target, routineId: routineId || '', note: note || '' });
    setIsWorkoutManageModalOpen(true);
  };

  return (
    <section className="border-2 rounded-xl border-primary w-full min-h-50 p-4">
      <header className="flex items-center justify-between">
        <span className="text-primary font-bold text-lg md:text-xl">{formatMonthDay(selectedDate)}</span>
        <div className="flex gap-2">
          {workoutByDateData && workoutByDateData.routines.length > 0 && (
            <Button
              label="삭제"
              aria-label="운동 기록 추가"
              onClick={() => {
                setIsConfirmModalOpen(true);
              }}
              className="w-fit"
            />
          )}
          <Button
            label={<img src="/icons/plus.white.svg" alt="운동 기록 추가" className="w-5 h-5" />}
            aria-label="운동 기록 추가"
            onClick={() => {
              setIsModalOpen(true);
            }}
            className="w-fit"
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
                  onClick={() => handleCardClick(routine.routineName, routine.exercises, routine.id, routine.note)}
                >
                  <RecordedRoutineCard title={routine.routineName} exercises={routine.exercises} />
                  <NoteBadge note={routine.note} />
                </div>
              ))}
              {currentExercises.length > 0 && (
                <div
                  className="flex items-center gap-2"
                  onClick={() => handleCardClick('루틴외에 추가된 운동', currentExercises)}
                >
                  <RecordedRoutineCard
                    key="additional-exercises"
                    title="루틴외에 추가된 운동"
                    exercises={currentExercises}
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
      <Modal modalId="crud-workout-modal" isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <RecordWorkoutModal
          date={selectedDate}
          onClose={() => setIsModalOpen(false)}
          currentRoutineIds={currentRoutineIds}
          currentExercises={currentExercises}
          workoutId={workoutByDateData?.id}
        />
      </Modal>
      <Modal
        modalId="workout-manage-modal"
        isOpen={isWorkoutManageModalOpen}
        onClose={() => setIsWorkoutManageModalOpen(false)}
      >
        <WorkoutManageModal
          title={targetWorkout.title}
          exercises={targetWorkout.exercises}
          onClose={() => setIsWorkoutManageModalOpen(false)}
          initialNote={targetWorkout.note}
          routineId={targetWorkout.routineId}
        />
      </Modal>
      <Modal
        modalId="workout-delete-confirm-modal"
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
      >
        <CommonConfirmModal
          title="운동 기록 삭제"
          message={`${formatMonthDay(selectedDate)} 일자의 운동 기록을 삭제하시겠습니까? 삭제 시 복구할 수 없습니다.`}
          onClose={() => setIsConfirmModalOpen(false)}
          onConfirm={deleteWorkout}
        />
      </Modal>
    </section>
  );
}
