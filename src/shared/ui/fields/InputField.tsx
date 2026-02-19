import { cn } from '@/shared/libs/cn';
import type { InputHTMLAttributes } from 'react';

type InputFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  helperText?: string;
  className?: string;
  isValid?: boolean;
};

export function InputField({ label, helperText, isValid = true, className, ...props }: InputFieldProps) {
  const isDisabled = Boolean(props.disabled);

  return (
    <label className={cn('flex flex-col gap-2', className)}>
      {label ? (
        <span className="text-sm font-semibold text-(--text-primary)">
          {label} <span>{props.required && '*'}</span>
        </span>
      ) : null}
      <input
        {...props}
        className={cn(
          'bg-white w-full rounded px-3 py-2 text-sm border-border border',
          !isValid && 'border-primary',
          isDisabled && 'bg-gray-100 text-text-secondary cursor-not-allowed',
        )}
      />
      {helperText ? <span className="text-xs text-text-secondary">{helperText}</span> : null}
    </label>
  );
}
