import { cn } from '@/shared/libs';

export function ConsecutiveWorkoutDaysBadge({ days, className }: { days: number; className?: string }) {
  return (
    <div
      className={cn(
        'flex items-center gap-2 border border-secondary rounded-lg bg-white px-2 py-0.5 text-sm text-primary font-semibold',
        className,
      )}
    >
      <img src="/icons/flame.svg" alt="연속 운동 일수 아이콘" className="w-4 h-4" />
      <p>{days}일</p>
    </div>
  );
}
