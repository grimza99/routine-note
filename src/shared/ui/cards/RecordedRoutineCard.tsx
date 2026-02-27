import { IExercise } from '@/shared/types/domain.type';
import { cn } from '../../libs/cn';
import { NoteBadge } from '../badges/NoteBadge';

type RecordedRoutineCardProps = {
  title: string;
  exercises: IExercise[];
  className?: string;
  note?: string;
};

export function RecordedRoutineCard({ title, exercises, note, className }: RecordedRoutineCardProps) {
  if (exercises.length < 1) {
    return null;
  }

  return (
    <div
      className={cn(
        'min-w-60 max-w-100 rounded-xl border p-3 shadow-md border-border bg-white text-primary relative',
        className,
      )}
    >
      <header className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-sm">{title}</h3>
        </div>
      </header>

      <ul className="mt-2 flex flex-col gap-2 text-xs font-semibold">
        {exercises.map((exercise) => (
          <li key={exercise.id} className={cn('flex items-center justify-between rounded px-3 py-2 bg-gray-50')}>
            <span className="text-primary">{exercise.exerciseName}</span>
            {exercise.sets && <span className="text-xs">{exercise.sets.length}세트</span>}
          </li>
        ))}
      </ul>
      {note && <NoteBadge />}
    </div>
  );
}
