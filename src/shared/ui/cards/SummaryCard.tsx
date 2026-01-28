import { cn } from '../../libs/cn';

type SummaryCardVariant = 'primary' | 'secondary';

type SummaryCardProps = {
  title: string;
  value: string;
  iconSrc?: string;
  variant?: SummaryCardVariant;
  className?: string;
  iconClassName?: string;
};

const VARIANT_CLASSES: Record<SummaryCardVariant, string> = {
  primary: 'bg-primary border-primary text-white',
  secondary: 'bg-white border-primary text-text-primary',
};

export function SummaryCard({
  title,
  value,
  iconSrc,
  variant = 'primary',
  iconClassName,
  className,
}: SummaryCardProps) {
  const variantClassName = VARIANT_CLASSES[variant];

  return (
    <section
      className={cn(
        'flex flex-col gap-3 rounded-xl border px-5 py-4 border-secondary justify-center items-center',
        variantClassName,
        className,
      )}
    >
      {iconSrc && <img src={iconSrc} alt="화살표 아이콘" className={cn('w-9 h-9', iconClassName)} />}
      <div className="text-3xl font-bold text-primary">{value}</div>
      <div className={cn('text-sm', variant === 'primary' ? 'text-white' : 'text-text-secondary')}>{title}</div>
    </section>
  );
}
