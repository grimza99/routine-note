import { cn, ConsecutiveWorkoutDaysBadge, DefaultProfile } from '@/shared';

interface RankClassNames {
  container?: string;
  rank?: string;
  avatar?: string;
  name?: string;
  experience?: string;
  streakLabel?: string;
  streakValue?: string;
}

interface RankProps {
  imageUrl: string;
  nickname: string;
  experience?: number | string;
  rank: number | string;
  workoutDays: number;
  className?: string;
  classNames?: RankClassNames;
}

export function Rank({ imageUrl, nickname, experience, rank, workoutDays, className, classNames }: RankProps) {
  return (
    <div
      className={cn(
        'flex w-full items-center justify-between gap-4 rounded-xl border-2 border-border bg-white p-2 md:p-4',
        className,
        classNames?.container,
      )}
    >
      <div className="flex items-center gap-4">
        <div
          className={cn(
            'flex w-8 h-8 md:w-10 md:h-10 items-center justify-center rounded-full bg-surface text-sm font-bold text-text-secondary',
            classNames?.rank,
          )}
        >
          {rank}
        </div>
        <div className="flex items-center gap-4">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={`${nickname} 프로필`}
              className={cn(
                'w-8 h-8 md:w-10 md:h-10 rounded-full border border-border object-cover',
                classNames?.avatar,
              )}
            />
          ) : (
            <DefaultProfile />
          )}
          <div className="flex flex-col">
            <span
              className={cn('text-sm md:text-base font-bold text-text-primary truncate max-w-30', classNames?.name)}
            >
              {nickname}
            </span>
            {experience && (
              <span className={cn('text-sm text-text-secondary', classNames?.experience)}>{experience}xp</span>
            )}
          </div>
        </div>
      </div>
      <ConsecutiveWorkoutDaysBadge days={workoutDays} />
    </div>
  );
}
