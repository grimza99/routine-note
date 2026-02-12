import { CommonConfirmModal } from '@/shared/ui/modals/CommonConfirmModal';
import RecordWorkoutModal from '../workout/ui/RecordWorkoutModal';
import { IExercise } from '@/shared';
import { ModalRegistry } from './modal-registry.type';

// modal-registry
// modalKey 기준으로 여기에 등록합니다.

type DeleteRoutinePayload = { description: string; onConfirm: () => void };
type RecordRoutinePayload = {
  selectedDate: Date;
  currentRoutineIds: string[];
  currentExercises: IExercise[];
  workoutId?: string;
};

export const modalRegistry: ModalRegistry = {
  deleteWorkout: {
    modalId: 'deleteWorkout',
    render: (payload, { closeModal }) => {
      const data = payload as DeleteRoutinePayload;
      return (
        <CommonConfirmModal
          title="루틴 삭제"
          message={data.description}
          onClose={closeModal}
          onConfirm={() => {
            data.onConfirm();
            closeModal();
          }}
        />
      );
    },
  },
  recordWorkout: {
    modalId: 'recordWorkout',
    render: (payload, { closeModal }) => {
      const data = payload as RecordRoutinePayload;
      return (
        <RecordWorkoutModal
          date={data.selectedDate}
          onClose={closeModal}
          currentRoutineIds={data.currentRoutineIds}
          currentExercises={data.currentExercises}
          workoutId={data.workoutId}
        />
      );
    },
  },
};
