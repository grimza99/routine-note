import { IExercise } from '@/shared/types/domain.type';
import { cn } from '../../libs/cn';

type RecordedRoutineCardProps = {
  title: string;
  description?: string;
  exercises: IExercise[];
  className?: string;
  descriptionPlaceholder?: string;
};

export function RecordedRoutineCard({
  title,
  description,
  exercises,
  className,
  descriptionPlaceholder = '설명을 입력하세요',
}: RecordedRoutineCardProps) {
  const descriptionText = description?.trim() ? description : descriptionPlaceholder;

  if (exercises.length < 1) {
    return null;
  }

  return (
    <section
      className={cn('w-full max-w-60 rounded-xl border p-3 shadow-md border-border bg-white text-primary', className)}
    >
      <header className="flex flex-col gap-2">
        <h3 className="font-semibold text-sm">{title}</h3>
        {description && <p className={cn('text-sm text-text-secondary')}>{descriptionText}</p>}
      </header>

      <ul className="mt-2 flex flex-col gap-2 text-xs font-semibold">
        {exercises.map((exercise) => (
          <li key={exercise.id} className={cn('flex items-center justify-between rounded px-3 py-2 bg-gray-50')}>
            <span>{exercise.name}</span>
            {exercise.sets && <span className="text-xs">{exercise.sets.length}세트</span>}
          </li>
        ))}
      </ul>
    </section>
  );
}
