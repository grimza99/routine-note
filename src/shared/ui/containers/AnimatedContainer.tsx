'use client';
import { useInView } from '@/shared/hooks';
import { cn } from '@/shared/libs/cn';
import { ReactNode } from 'react';

interface AnimatedSectionProps {
  children: ReactNode;
  animationType?: 'fade-up';
  delay?: 1 | 2 | 3 | 4;
  className?: string;
}

export function AnimatedContainer({
  children,
  animationType = 'fade-up',
  delay,
  className = '',
}: AnimatedSectionProps) {
  const { ref, isInView } = useInView();

  const delayClass = delay ? `${animationType}-delay-${delay}` : '';
  const animateClass = isInView ? 'animate' : '';

  return (
    <div ref={ref} className={cn(`${animationType} ${delayClass} ${animateClass} ${className}`)}>
      {children}
    </div>
  );
}
