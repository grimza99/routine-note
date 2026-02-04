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
  experience: number | string;
  rank: number | string;
  streakDays: number;
  className?: string;
  classNames?: RankClassNames;
}

export function Rank({ imageUrl, nickname, experience, rank, streakDays, className, classNames }: RankProps) {
  return (
    <div
      className={cn(
        'flex w-full items-center justify-between gap-4 rounded-xl border-2 border-border bg-white p-4',
        className,
        classNames?.container,
      )}
    >
      <div className="flex items-center gap-4">
        <div
          className={cn(
            'flex h-10 w-10 items-center justify-center rounded-full bg-surface text-sm font-bold text-text-secondary',
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
              className={cn('h-12 w-12 rounded-full border border-border object-cover', classNames?.avatar)}
            />
          ) : (
            <DefaultProfile />
          )}
          <div className="flex flex-col">
            <span className={cn('font-bold text-text-primary', classNames?.name)}>{nickname}</span>
            <span className={cn('text-sm text-text-secondary', classNames?.experience)}>{experience}xp</span>
          </div>
        </div>
      </div>
      <ConsecutiveWorkoutDaysBadge days={streakDays} />
    </div>
  );
}
