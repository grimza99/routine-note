import type { ReactNode } from 'react';

type ModalRenderContext = {
  closeModal: () => void;
};

type ModalRegistryEntry = {
  modalId: string;
  className?: string;
  overlayClassName?: string;
  render: (payload: unknown, context: ModalRenderContext) => ReactNode;
};

type ModalRegistryKey =
  | 'deleteWorkout'
  | 'recordWorkout'
  | 'manageWorkout'
  | 'createRoutine'
  | 'editRoutine'
  | 'deleteRoutine';
export type ModalRegistry = Record<ModalRegistryKey, ModalRegistryEntry>;
