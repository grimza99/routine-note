'use client';

import type { ReactNode } from 'react';
import { ModalProvider } from './ModalProvider';
import { modalRegistry } from '@/features/modal-registry/modal-registry';

export function ModalBridgeProvider({ children }: { children: ReactNode }) {
  return <ModalProvider registry={modalRegistry}>{children}</ModalProvider>;
}
