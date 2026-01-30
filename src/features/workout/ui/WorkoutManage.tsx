'use client';
import { useWorkoutByDate } from '@/entities';
import { Button, formatDate, formatMonthDay, Modal } from '@/shared';
import { useState } from 'react';
import RecordWorkoutModal from './RecordWorkoutModal';
import { RecordedRoutineCard } from '@/shared/ui/cards/RecordedRoutineCard';

export default function WorkoutManage({ selectedDate }: { selectedDate: Date }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { data: workoutByDateData } = useWorkoutByDate(formatDate(selectedDate));

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
      <>
        {workoutByDateData ? (
          <div>
            {workoutByDateData.routines.map((routine) => (
              <RecordedRoutineCard key={routine.id} title={routine.routineName} exercises={routine.exercises} />
            ))}
          </div>
        ) : (
          <p className="mt-4 text-text-secondary">운동 기록이 없습니다.</p>
        )}
      </>
      <Modal modalId="workout-manage-modal" isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <RecordWorkoutModal
          date={selectedDate}
          onClose={() => setIsModalOpen(false)}
          currentRoutineIds={currentRoutineIds}
          currentExercises={currentExercises}
        />
      </Modal>
    </section>
  );
}
