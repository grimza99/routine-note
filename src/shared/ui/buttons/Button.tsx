import type { ButtonHTMLAttributes } from 'react';
import { cn } from '@/shared';

type ButtonVariant = 'primary' | 'secondary';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  label?: string | React.ReactNode;
};

export function Button({ variant = 'primary', className, type, style, label, ...props }: ButtonProps) {
  const isDisabled = Boolean(props.disabled);

  return (
    <button
      {...props}
      type={type ?? 'button'}
      className={cn(
        'w-full rounded-lg px-4 py-2 text-sm font-semibold',
        variant === 'primary' ? 'border-primary bg-primary text-white' : 'border-primary bg-white text-primary border',
        isDisabled && 'cursor-not-allowed border-disabeld bg-white text-disabled',
        className,
      )}
    >
      {label}
    </button>
  );
}
