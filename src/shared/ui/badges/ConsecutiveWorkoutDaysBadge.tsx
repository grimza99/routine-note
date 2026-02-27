import { FireIcon } from '@heroicons/react/24/solid';

import { cn } from '@/shared/libs';

export function ConsecutiveWorkoutDaysBadge({ days, className }: { days: number; className?: string }) {
  return (
    <div
      className={cn(
        'flex items-center gap-2 border border-secondary rounded-lg bg-white px-2 py-0.5 text-sm text-primary font-semibold',
        className,
      )}
    >
      <FireIcon className="size-4 text-primary" />
      <p>{days}일</p>
    </div>
  );
}
