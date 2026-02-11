import { cn } from '../../libs/cn';

type NoteBadgeProps = {
  note?: string;
  className?: string;
};

export function NoteBadge({ note, className }: NoteBadgeProps) {
  if (!note?.trim()) {
    return null;
  }

  return (
    <div
      className={cn(
        'inline-flex min-w-20  max-w-40 rounded-md border border-border bg-surface px-2 py-1 text-xs text-text-secondary h-30',
        className,
      )}
      title={note}
    >
      <p className="whitespace-pre-wrap overflow-y-auto">{note}</p>
    </div>
  );
}
