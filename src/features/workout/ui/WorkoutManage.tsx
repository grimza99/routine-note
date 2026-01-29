import { useWorkoutByDate } from '@/entities';
import { Button, formatMonthDay } from '@/shared';

export default function WorkoutManage({ selectedDate }: { selectedDate: Date }) {
  const { data: workoutByDateData } = useWorkoutByDate(selectedDate.toISOString().slice(0, 10));
  return (
    <section className="border-2 rounded-xl border-primary w-full min-h-50 p-4">
      <header className="flex items-center justify-between">
        <span className="text-primary font-bold text-lg md:text-xl">{formatMonthDay(selectedDate)}</span>
        <Button
          label="+"
          aria-label="운동 기록 추가"
          onClick={() => {
            //todo 모달 열기
          }}
          className="w-fit"
        />
      </header>
      <>{workoutByDateData ? <></> : <p className="mt-4 text-text-secondary">운동 기록이 없습니다.</p>}</>
    </section>
  );
}
