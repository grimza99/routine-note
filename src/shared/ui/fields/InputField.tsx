import { cn } from '@/shared/libs/cn';
import type { InputHTMLAttributes } from 'react';

type InputFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  helperText?: string;
  className?: string;
};

export function InputField({ label, helperText, className, ...props }: InputFieldProps) {
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
        className="w-full rounded px-3 py-2 text-sm"
        style={{
          border: `1px solid ${isDisabled ? 'var(--error)' : 'var(--primary)'}`,
          borderRadius: 'var(--radius-base)',
          color: isDisabled ? 'var(--disabled)' : 'var(--text-secondary)',
          background: 'var(--white)',
        }}
      />
      {helperText ? (
        <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
          {helperText}
        </span>
      ) : null}
    </label>
  );
}
