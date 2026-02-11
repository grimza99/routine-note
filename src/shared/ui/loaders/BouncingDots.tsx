import { cn } from '../../libs/cn';

type BouncingDotsProps = {
  size?: number;
  className?: string;
  color?: string;
};

export function BouncingDots({ size = 6, className, color = 'white' }: BouncingDotsProps) {
  return (
    <span className={cn('inline-flex items-center gap-1', className)}>
      {[0, 1, 2].map((index) => (
        <span
          key={index}
          className={cn('inline-block rounded-full animate-bounce', `bg-${color}`)}
          style={{ width: size, height: size, animationDelay: `${index * 0.15}s` }}
        />
      ))}
    </span>
  );
}
