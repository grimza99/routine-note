import { cn } from '../../libs/cn';

type SpinnerProps = {
  size?: number;
  className?: string;
};

export function Spinner({ size = 16, className }: SpinnerProps) {
  return (
    <span
      role="status"
      aria-label="로딩 중"
      className={cn('inline-block animate-spin rounded-full border-2 border-transparent border-t-primary', className)}
      style={{ width: size, height: size }}
    />
  );
}
