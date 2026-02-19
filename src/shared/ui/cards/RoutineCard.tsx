import { cn } from '../../libs/cn';

interface Exercise {
  id: string;
  exerciseId: string;
  note?: string;
  exerciseName: string;
}
type RoutineCardProps = {
  routineName: string;
  exercises: Exercise[];
  className?: string;
};

export function RoutineCard({ routineName, exercises, className }: RoutineCardProps) {
  if (exercises.length < 1) {
    return null;
  }
  return (
    <div
      className={cn(
        'w-full max-w-100 rounded-xl border p-4 shadow-md border-border bg-white text-primary hover:shadow-xl hover:scale-[1.02] transition-transform duration-200',
        className,
      )}
    >
      <header className="flex flex-col gap-2">
        <h3 className="text-lg font-semibold">{routineName}</h3>
      </header>

      <ul className={cn('mt-2 flex gap-2 flex-row text-sm font-semibold flex-wrap')}>
        {exercises.map((exercise) => (
          <li key={exercise.exerciseId} className={cn('rounded px-3 py-2 bg-gray-100 w-fit h-fit whitespace-nowrap')}>
            <span>{exercise.exerciseName}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
