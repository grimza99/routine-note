'use client';
import { useWorkoutByDate } from '@/entities';
import { Button, formatMonthDay, Modal } from '@/shared';
import { useState } from 'react';
import RecordWorkoutModal from './RecordWorkoutModal';

export default function WorkoutManage({ selectedDate }: { selectedDate: Date }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: workoutByDateData } = useWorkoutByDate(selectedDate.toISOString().slice(0, 10));

  const currentRoutineIds = workoutByDateData?.routines.map((routine) => routine.id) || [];
  const currentExercises = workoutByDateData?.exercises || [];

  return (
    <section className="border-2 rounded-xl border-primary w-full min-h-50 p-4">
      <header className="flex items-center justify-between">
        <span className="text-primary font-bold text-lg md:text-xl">{formatMonthDay(selectedDate)}</span>
        <Button
          label="+"
          aria-label="운동 기록 추가"
          onClick={() => {
            setIsModalOpen(true);
          }}
          className="w-fit"
        />
      </header>
      <>{workoutByDateData ? <></> : <p className="mt-4 text-text-secondary">운동 기록이 없습니다.</p>}</>
      <Modal modalId="workout-manage-modal" isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <RecordWorkoutModal
          onClose={() => setIsModalOpen(false)}
          onSelectRoutines={(ids) => {
            console.log(ids);
          }}
          onSelectExercise={(exercises) => {
            console.log(exercises);
          }}
          currentRoutineIds={currentRoutineIds}
          currentExercises={currentExercises}
        />
      </Modal>
    </section>
  );
}
