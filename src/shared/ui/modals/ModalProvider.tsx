'use client';

import type { ReactNode } from 'react';
import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { Modal } from './Modal';
import { ModalRegistry } from '@/features/modal-registry';

type ModalProviderProps = {
  children: ReactNode;
  registry: ModalRegistry;
};

type ModalContextValue = {
  activeModalKey: keyof ModalRegistry | null;
  modalPayload: unknown;
  openModal: (modalKey: keyof ModalRegistry, payload?: unknown) => void;
  closeModal: () => void;
  isModalOpen: (modalKey: string) => boolean;
};

const ModalContext = createContext<ModalContextValue | null>(null);

export function ModalProvider({ children, registry }: ModalProviderProps) {
  const [activeModalKey, setActiveModalKey] = useState<keyof ModalRegistry | null>(null);
  const [modalPayload, setModalPayload] = useState<unknown>(null);

  const openModal = useCallback((modalKey: keyof ModalRegistry, payload?: unknown) => {
    setActiveModalKey(modalKey);
    setModalPayload(payload ?? null);
  }, []);

  const closeModal = useCallback(() => {
    setActiveModalKey(null);
    setModalPayload(null);
  }, []);

  const isModalOpen = useCallback((modalKey: string) => activeModalKey === modalKey, [activeModalKey]);

  const contextValue = useMemo(
    () => ({
      activeModalKey,
      modalPayload,
      openModal,
      closeModal,
      isModalOpen,
    }),
    [activeModalKey, closeModal, isModalOpen, modalPayload, openModal],
  );

  const currentModal = activeModalKey ? registry[activeModalKey] : null;

  return (
    <ModalContext.Provider value={contextValue}>
      {children}
      {currentModal ? (
        <Modal
          modalId={currentModal.modalId}
          isOpen
          onClose={closeModal}
          className={currentModal.className}
          overlayClassName={currentModal.overlayClassName}
        >
          {currentModal.render(modalPayload, { closeModal })}
        </Modal>
      ) : null}
    </ModalContext.Provider>
  );
}

export function useModal() {
  const modalContext = useContext(ModalContext);

  if (!modalContext) {
    throw new Error('useModal must be used within ModalProvider.');
  }

  return modalContext;
}
