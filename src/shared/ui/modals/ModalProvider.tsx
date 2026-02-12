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
  activeModalKey: string | null;
  modalPayload: unknown;
  openModal: (modalKey: string, payload?: unknown) => void;
  closeModal: () => void;
  isModalOpen: (modalKey: string) => boolean;
};

const ModalContext = createContext<ModalContextValue | null>(null);

export function ModalProvider({ children, registry }: ModalProviderProps) {
  const [activeModalKey, setActiveModalKey] = useState<string | null>(null);
  const [modalPayload, setModalPayload] = useState<unknown>(null);

  const openModal = useCallback((modalKey: string, payload?: unknown) => {
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

  if (activeModalKey && !registry[activeModalKey]) {
    throw new Error(`모달에 사용된 "${activeModalKey}"가 레지스트리에 등록되어있지 않습니다.`);
  }
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
