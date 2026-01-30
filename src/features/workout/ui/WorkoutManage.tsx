'use client';
import { useWorkoutByDate } from '@/entities';
import { Button, formatDate, formatMonthDay, Modal, NoteBadge } from '@/shared';
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
      {workoutByDateData ? (
        <div className="flex gap-4 w-full">
          {workoutByDateData.routines.map((routine) => (
            <div key={routine.id} className="flex items-center gap-2">
              <RecordedRoutineCard title={routine.routineName} exercises={routine.exercises} />
              <NoteBadge note={routine.note} />
            </div>
          ))}
          {currentExercises.length > 0 && (
            <div className="flex items-center gap-2">
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
