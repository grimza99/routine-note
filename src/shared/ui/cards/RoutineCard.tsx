import { cn } from '../../libs/cn';

type RoutineExercise = {
  id: string;
  name: string;
  sets: number;
};

type RoutineCardProps = {
  title: string;
  description?: string;
  exercises: RoutineExercise[];
  className?: string;
  descriptionPlaceholder?: string;
};

export function RoutineCard({
  title,
  description,
  exercises,
  className,
  descriptionPlaceholder = '설명을 입력하세요',
}: RoutineCardProps) {
  const descriptionText = description?.trim() ? description : descriptionPlaceholder;

  if (exercises.length < 1) {
    return null;
  }

  return (
    <section
      className={cn('w-full max-w-100 rounded-xl border p-4 shadow-md border-primary bg-white text-primary', className)}
    >
      <header className="flex flex-col gap-2">
        <h3 className="text-lg font-semibold">{title}</h3>
        {description && <p className={cn('text-sm text-text-secondary')}>{descriptionText}</p>}
      </header>

      <ul className="mt-2 flex flex-col gap-2 text-sm font-semibold">
        {exercises.map((exercise) => (
          <li key={exercise.id} className={cn('flex items-center justify-between rounded px-3 py-2 bg-gray-50')}>
            <span>{exercise.name}</span>
            <span className="text-xs">{exercise.sets}세트</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
