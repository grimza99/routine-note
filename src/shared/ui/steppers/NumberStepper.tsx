import { cn } from '../../libs/cn';

type NumberStepperProps = {
  value: number;
  onDecrease: (value: number) => void;
  onIncrease: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  className?: string;
  disabled?: boolean;
  ariaLabel?: { increase: string; decrease: string };
};

export function NumberStepper({
  value,
  min,
  max,
  onDecrease,
  onIncrease,
  step = 1,
  className,
  disabled = false,
  ariaLabel,
}: NumberStepperProps) {
  const nextDecrement = value - step;
  const nextIncrement = value + step;
  const isDecrementDisabled = disabled || (min !== undefined && nextDecrement < min);
  const isIncrementDisabled = disabled || (max !== undefined && nextIncrement > max);

  const handleDecrement = () => {
    if (isDecrementDisabled) return;
    onDecrease(nextDecrement);
  };

  const handleIncrement = () => {
    if (isIncrementDisabled) return;
    onIncrease(nextIncrement);
  };

  return (
    <div className={cn('inline-flex items-center gap-1 rounded-lg bg-primary p-1 text-white', className)}>
      <button
        type="button"
        aria-label={ariaLabel?.decrease}
        className="grid h-6 w-6 place-items-center rounded-full text-white transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-60"
        onClick={handleDecrement}
        disabled={isDecrementDisabled}
      >
        <MinusIcon />
      </button>
      <span className="min-w-6 text-center text-sm font-semibold tabular-nums text-white">{value}</span>
      <button
        type="button"
        aria-label={ariaLabel?.increase}
        className="grid h-6 w-6 place-items-center rounded-full text-white transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-60"
        onClick={handleIncrement}
        disabled={isIncrementDisabled}
      >
        <PlusIcon />
      </button>
    </div>
  );
}

function MinusIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
      <path d="M3 7H11" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
      <path d="M3 7H11" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M7 3V11" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}
