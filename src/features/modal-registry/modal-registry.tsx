import { CommonConfirmModal } from '@/shared/ui/modals/CommonConfirmModal';
import RecordWorkoutModal from '../workout/ui/RecordWorkoutModal';
import { ModalRegistry } from './modal-registry.type';
import { WorkoutManageModal } from '../workout';
import { CreateRoutineModal, EditRoutineModal } from '../routine';
import { IExercise } from '@/shared/types';

// modal-registry
// modalKey 기준으로 여기에 등록합니다.

//-------------------------------workout modals types-------------------------------//
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
//-------------------------------routine modals types-------------------------------//

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

  //-------------------------------routine modals-------------------------------//
  createRoutine: {
    modalId: 'createRoutine',
    render: (_, { closeModal }) => {
      return <CreateRoutineModal onClose={closeModal} />;
    },
  },
  editRoutine: {
    modalId: 'editRoutine',
    render: (payload, { closeModal }) => {
      const data = payload as { routineId: string };
      return <EditRoutineModal routineId={data.routineId} onClose={closeModal} />;
    },
  },
  deleteRoutine: {
    modalId: 'deleteRoutine',
    render: (payload, { closeModal }) => {
      const data = payload as { onConfirm: () => void; isPending: boolean };
      return (
        <CommonConfirmModal
          title="정말 이 루틴을 삭제하시겠습니까?"
          message="삭제된 루틴은 복구할 수 없습니다."
          onClose={closeModal}
          {...data}
        />
      );
    },
  },
};
