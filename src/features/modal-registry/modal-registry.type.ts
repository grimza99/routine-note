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

export type ModalRegistry = Record<string, ModalRegistryEntry>;
