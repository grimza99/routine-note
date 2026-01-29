import { cn } from '../../libs/cn';

type BouncingDotsProps = {
  size?: number;
  className?: string;
};

export function BouncingDots({ size = 6, className }: BouncingDotsProps) {
  return (
    <span className={cn('inline-flex items-center gap-1', className)}>
      {[0, 1, 2].map((index) => (
        <span
          key={index}
          className="inline-block rounded-full bg-primary animate-bounce"
          style={{ width: size, height: size, animationDelay: `${index * 0.15}s` }}
        />
      ))}
    </span>
  );
}
