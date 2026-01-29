'use client';

import { useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { createPortal } from 'react-dom';

import { cn } from '../../libs/cn';

type ModalProps = {
  modalId: string;
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  className?: string;
  overlayClassName?: string;
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
};

export function Modal({
  modalId,
  isOpen,
  onClose,
  children,
  className,
  overlayClassName,
  closeOnOverlayClick = true,
  closeOnEscape = true,
}: ModalProps) {
  const [portalElement, setPortalElement] = useState<HTMLElement | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted || !modalId) {
      return undefined;
    }

    let didCreate = false;
    let element = document.getElementById(modalId);

    if (!element) {
      element = document.createElement('div');
      element.id = modalId;
      document.body.appendChild(element);
      didCreate = true;
    }

    setPortalElement(element);

    return () => {
      if (didCreate && element?.parentNode) {
        element.parentNode.removeChild(element);
      }
    };
  }, [isMounted, modalId]);

  useEffect(() => {
    if (!isOpen || !closeOnEscape) {
      return undefined;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, closeOnEscape, onClose]);

  const overlayStyle = useMemo(
    () => ({
      backgroundColor: 'color-mix(in srgb, var(--black) 55%, transparent)',
    }),
    [],
  );

  const panelStyle = useMemo(
    () => ({
      backgroundColor: 'var(--white)',
      borderColor: 'var(--border)',
      borderRadius: 'var(--radius-base)',
      boxShadow: '0 4px 12px color-mix(in srgb, var(--black) 12%, transparent)',
    }),
    [],
  );

  if (!isOpen || !portalElement) {
    return null;
  }

  return createPortal(
    <div className={cn('fixed inset-0 z-50', overlayClassName)}>
      <div
        className="absolute inset-0"
        style={overlayStyle}
        onClick={closeOnOverlayClick ? onClose : undefined}
        aria-hidden
      />
      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-8">
        <div
          role="dialog"
          aria-modal="true"
          className={cn('w-full max-w-lg border', className)}
          style={panelStyle}
        >
          {children}
        </div>
      </div>
    </div>,
    portalElement,
  );
}
