'use client';

import { useEffect, useMemo, useRef } from 'react';
import type { ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { XMarkIcon } from '@heroicons/react/24/solid';

import { cn } from '../../libs/cn';
import { useOnClickOutside } from '@/shared/hooks/useOnClickOutside';

type ModalProps = {
  modalId: string;
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  className?: string;
  overlayClassName?: string;
};

export function Modal({ modalId, isOpen, onClose, children, className, overlayClassName }: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  useOnClickOutside(modalRef, onClose, { enabled: isOpen });

  useEffect(() => {
    if (!isOpen) {
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
  }, [isOpen, onClose]);

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

  if (!isOpen || typeof document === 'undefined') {
    return null;
  }

  return createPortal(
    <div id={modalId} className={cn('fixed inset-0 z-50', overlayClassName)}>
      <div className="absolute inset-0" style={overlayStyle} aria-hidden />
      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-8">
        <div
          role="dialog"
          aria-modal="true"
          className={cn('relative w-full max-w-2xl max-h-180 overflow-y-auto border', className)}
          style={panelStyle}
          ref={modalRef}
        >
          <button
            type="button"
            aria-label="닫기"
            onClick={onClose}
            className="absolute right-4 top-4 flex items-center justify-center focus-visible:outline-focus-ring"
          >
            <XMarkIcon className="w-5 h-5 text-text-primary font-bold" />
          </button>
          {children}
        </div>
      </div>
    </div>,
    document.body,
  );
}
