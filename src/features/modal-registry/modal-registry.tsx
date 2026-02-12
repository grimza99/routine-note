import { CommonConfirmModal } from '@/shared/ui/modals/CommonConfirmModal';
import RecordWorkoutModal from '../workout/ui/RecordWorkoutModal';
import { IExercise } from '@/shared';
import { ModalRegistry } from './modal-registry.type';
import { WorkoutManageModal } from '../workout';

// modal-registry
// modalKey 기준으로 여기에 등록합니다.

type DeleteWorkoutPayload = { description: string; onConfirm: () => void };
type RecordWorkoutPayload = {
  selectedDate: Date;
  currentRoutineIds: string[];
  currentExercises: IExercise[];
  workoutId?: string;
};
type ManageRoutinePayload = {
  title: string;
  initialExercises: IExercise[] | null;
  initialNote?: string;
  routineId: string;
};

export const modalRegistry: ModalRegistry = {
  //-------------------------------workout modals-------------------------------//
  deleteWorkout: {
    modalId: 'deleteWorkout',
    render: (payload, { closeModal }) => {
      const data = payload as DeleteWorkoutPayload;
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
      const data = payload as RecordWorkoutPayload;
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
  manageWorkout: {
    modalId: 'manageWorkout',
    render: (payload, { closeModal }) => {
      const data = payload as ManageRoutinePayload;
      return <WorkoutManageModal {...data} onClose={closeModal} />;
    },
  },
};
