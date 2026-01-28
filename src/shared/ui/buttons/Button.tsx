import type { ButtonHTMLAttributes } from 'react';

type ButtonVariant = 'primary' | 'secondary';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
};

export function Button({ variant = 'primary', className, type, style, ...props }: ButtonProps) {
  const isDisabled = Boolean(props.disabled);

  const baseClassName = ['w-full rounded px-4 py-2 text-sm font-semibold', className]
    .filter(Boolean)
    .join(' ');

  const variantStyle = isDisabled
    ? {
        border: '1px solid var(--disabled)',
        background: 'var(--white)',
        color: 'var(--disabled)',
      }
    : variant === 'secondary'
      ? {
          border: '1px solid var(--primary)',
          background: 'var(--white)',
          color: 'var(--primary)',
        }
      : {
          border: '1px solid var(--primary)',
          background: 'var(--primary)',
          color: 'var(--white)',
        };

  return (
    <button
      {...props}
      type={type ?? 'button'}
      className={baseClassName}
      style={{
        borderRadius: 'var(--radius-base)',
        ...variantStyle,
        ...style,
      }}
    />
  );
}
