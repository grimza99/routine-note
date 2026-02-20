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
  secondary: 'bg-white border-secondary text-text-primary',
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
    <div
      className={cn(
        'flex flex-col gap-1 md:gap-3 rounded-xl border-2 p-2 md:px-5 md:py-4 justify-center items-center',
        variantClassName,
        className,
      )}
    >
      {iconSrc && <img src={iconSrc} alt="화살표 아이콘" className={cn('w-7 h-7 md:w-9 md:h-9', iconClassName)} />}
      <div className="text-xl md:text-3xl font-bold text-primary">{value}</div>
      <div className={cn('text-xs md:text-sm', variant === 'primary' ? 'text-white' : 'text-text-secondary')}>
        {title}
      </div>
    </div>
  );
}
