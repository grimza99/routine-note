'use client';

import { createContext, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';

import { cn } from '../../libs/cn';

export type ToastVariant = 'success' | 'error';

type ToastItem = {
  id: string;
  message: string;
  variant: ToastVariant;
  duration: number;
  isVisible: boolean;
  isClosing: boolean;
};

type ToastOptions = {
  message: string;
  variant?: ToastVariant;
  duration?: number;
};

type ToastContextValue = {
  showToast: (options: ToastOptions) => string;
  dismissToast: (id: string) => void;
};

export const ToastContext = createContext<ToastContextValue | null>(null);

const getToastId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const timeoutsRef = useRef(new Map<string, number>());
  const closeTimeoutsRef = useRef(new Map<string, number>());

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) =>
      prev.map((toast) => (toast.id === id ? { ...toast, isVisible: false, isClosing: true } : toast)),
    );
    const timeoutId = timeoutsRef.current.get(id);
    if (timeoutId) {
      window.clearTimeout(timeoutId);
      timeoutsRef.current.delete(id);
    }
    if (closeTimeoutsRef.current.has(id)) {
      return;
    }
    const closeTimeoutId = window.setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
      closeTimeoutsRef.current.delete(id);
    }, 200);
    closeTimeoutsRef.current.set(id, closeTimeoutId);
  }, []);

  const showToast = useCallback(
    ({ message, variant = 'success', duration = 2500 }: ToastOptions) => {
      const id = getToastId();
      setToasts((prev) => [...prev, { id, message, variant, duration, isVisible: false, isClosing: false }]);

      requestAnimationFrame(() => {
        setToasts((prev) => prev.map((toast) => (toast.id === id ? { ...toast, isVisible: true } : toast)));
      });

      const timeoutId = window.setTimeout(() => {
        dismissToast(id);
      }, duration);
      timeoutsRef.current.set(id, timeoutId);

      return id;
    },
    [dismissToast],
  );

  useEffect(() => {
    return () => {
      timeoutsRef.current.forEach((timeoutId) => {
        window.clearTimeout(timeoutId);
      });
      timeoutsRef.current.clear();
      closeTimeoutsRef.current.forEach((timeoutId) => {
        window.clearTimeout(timeoutId);
      });
      closeTimeoutsRef.current.clear();
    };
  }, []);

  const contextValue = useMemo(() => ({ showToast, dismissToast }), [showToast, dismissToast]);

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <div
        className="fixed top-4 right-4 z-50 min-w-50 flex max-w-[90vw] flex-col gap-2 sm:max-w-sm"
        aria-live="polite"
      >
        {toasts.map((toast) => {
          return (
            <div
              key={toast.id}
              role="status"
              className={cn(
                'pointer-events-auto items-center rounded-lg border px-4 py-3 text-sm shadow-md bg-white flex gap-2 will-change-transform transition-all duration-200 ease-out',
                toast.isVisible && !toast.isClosing ? 'translate-y-0 opacity-100' : '-translate-y-2 opacity-0',
                toast.variant === 'success' ? 'border-secondary' : 'border-gray900',
              )}
            >
              <img
                src={toast.variant === 'success' ? '/icons/toast/success.svg' : '/icons/toast/warn.svg'}
                alt={toast.variant}
                className="mt-0.5 h-5 w-5"
              />
              <span className="flex-1 whitespace-pre-line">{toast.message}</span>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}
