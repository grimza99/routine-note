import { cn } from '../../libs/cn';

type PreparingCardProps = {
  title?: string;
  description?: string;
  badgeLabel?: string;
  className?: string;
};

export function PreparingCard({
  title = '준비 중입니다',
  description = '곧 멋지게 준비해서 보여드릴게요.',
  badgeLabel = 'Coming Soon',
  className,
}: PreparingCardProps) {
  return (
    <div
      className={cn(
        'flex w-full flex-col items-center gap-3 rounded-xl border border-border bg-white px-6 py-8 text-center shadow-sm',
        className,
      )}
    >
      <span className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-primary">{badgeLabel}</span>
      <h3 className="text-lg font-semibold text-text-primary">{title}</h3>
      <p className="text-sm text-text-secondary">{description}</p>
    </div>
  );
}
