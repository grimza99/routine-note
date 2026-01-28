'use client';
import { useEffect } from 'react';

type UseOnClickOutsideOptions = {
  enabled?: boolean;
};

export function useOnClickOutside<T extends HTMLElement>(
  ref: React.RefObject<T | null>,
  onClickOutside: () => void,
  options: UseOnClickOutsideOptions = {},
) {
  const { enabled = true } = options;

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node | null;
      if (!ref.current || !target || ref.current.contains(target)) {
        return;
      }
      onClickOutside();
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('touchstart', handlePointerDown);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('touchstart', handlePointerDown);
    };
  }, [enabled, onClickOutside, ref]);
}
