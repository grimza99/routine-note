import { cn } from '@/shared/libs/cn';

interface DotProps {
  size?: number;
  color?: string;
  className?: string;
}

export function Dot({ size = 6, color = 'bg-primary', className }: DotProps) {
  return <span className={cn(`inline-block rounded-full ${color}`, className)} style={{ width: size, height: size }} />;
}
