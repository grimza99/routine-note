import { cn } from '@/shared/libs';

type BinaryTabsOption<T extends string> = {
  label: string;
  value: T;
  disabled?: boolean;
};

type BinaryTabsProps<T extends string> = {
  options: [BinaryTabsOption<T>, BinaryTabsOption<T>];
  value: T;
  onChange: (value: T) => void;
  className?: string;
};

export function BinaryTabs<T extends string>({ options, value, onChange, className }: BinaryTabsProps<T>) {
  return (
    <div
      className={cn('flex w-fit rounded-lg border border-border bg-white p-1', className)}
      role="group"
      aria-label="binary tabs"
    >
      {options.map((option) => {
        const isActive = option.value === value;

        return (
          <button
            key={option.value}
            type="button"
            className={cn(
              'flex-1 rounded-md px-2 py-1.5 text-xs font-semibold transition-colors text-nowrap',
              option.disabled && 'cursor-not-allowed opacity-50',
              isActive ? 'bg-primary text-white' : 'bg-white text-text-secondary',
            )}
            onClick={() => onChange(option.value)}
            disabled={option.disabled}
            aria-pressed={isActive}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
