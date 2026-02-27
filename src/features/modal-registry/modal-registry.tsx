import { CommonConfirmModal } from '@/shared/ui/modals/CommonConfirmModal';
import RecordWorkoutModal, { RecordWorkoutModalProps } from '../workout/ui/RecordWorkoutModal';
import { ModalRegistry } from './modal-registry.type';
import { WorkoutManageModal } from '../workout';
import { CreateRoutineModal, EditRoutineModal } from '../routine';
import { IExercise } from '@/shared/types';
import FooterModalContent from '@/widgets/footer/FooterModalContent';

// modal-registry
// modalKey 기준으로 여기에 등록합니다.

//-------------------------------workout modals types-------------------------------//
type DeleteWorkoutProps = {
  description: string;
  onConfirm: () => void;
  ariaLabel?: { leftButton: string; rightButton: string };
};
interface IRecordWorkoutProps extends Omit<RecordWorkoutModalProps, 'onClose'> {}

type ManageRoutineProps = {
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
      const data = payload as DeleteWorkoutProps;
      return (
        <CommonConfirmModal
          title="루틴 삭제"
          message={data.description}
          onClose={closeModal}
          onConfirm={() => {
            data.onConfirm();
            closeModal();
          }}
          ariaLabel={data.ariaLabel}
        />
      );
    },
  },
  recordWorkout: {
    modalId: 'recordWorkout',
    render: (payload, { closeModal }) => {
      const data = payload as IRecordWorkoutProps;
      return <RecordWorkoutModal onClose={closeModal} {...data} />;
    },
  },
  manageWorkout: {
    modalId: 'manageWorkout',
    render: (payload, { closeModal }) => {
      const data = payload as ManageRoutineProps;
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
      const data = payload as {
        onConfirm: () => void;
        isPending: boolean;
        ariaLabel?: { leftButton: string; rightButton: string };
      };
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
  //footer modals
  privacy: {
    modalId: 'privacy',
    render: () => {
      return <FooterModalContent activePolicy="privacy" />;
    },
  },
  cookie: {
    modalId: 'cookie',
    render: () => {
      return <FooterModalContent activePolicy="cookie" />;
    },
  },
  terms: {
    modalId: 'terms',
    render: () => {
      return <FooterModalContent activePolicy="terms" />;
    },
  },
  contact: {
    modalId: 'contact',
    render: () => {
      return <FooterModalContent activePolicy="contact" />;
    },
  },
};
