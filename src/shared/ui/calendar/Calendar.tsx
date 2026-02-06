'use client';
import { useMemo, useState } from 'react';
import { Button, cn } from '@/shared';

type CalendarProps = {
  value?: Date | null;
  onSelectDate?: (date: Date) => void;
  className?: string;
};

const WEEK_DAYS = ['일', '월', '화', '수', '목', '금', '토'];

const createDate = (year: number, month: number, day: number) => new Date(year, month, day);

const isSameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

export function Calendar({ value, onSelectDate, className }: CalendarProps) {
  const today = new Date();
  const initialMonth = value ?? today;
  const [currentMonth, setCurrentMonth] = useState(() =>
    createDate(initialMonth.getFullYear(), initialMonth.getMonth(), 1),
  );

  const monthLabel = `${currentMonth.getFullYear()}년 ${currentMonth.getMonth() + 1}월`;

  const days = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const startOfMonth = createDate(year, month, 1);
    const endOfMonth = createDate(year, month + 1, 0);
    const startWeekday = startOfMonth.getDay();
    const totalDays = endOfMonth.getDate();
    const cells: { date: Date; isCurrentMonth: boolean }[] = [];

    for (let i = 0; i < startWeekday; i += 1) {
      const date = createDate(year, month, -(startWeekday - i - 1));
      cells.push({ date, isCurrentMonth: false });
    }

    for (let day = 1; day <= totalDays; day += 1) {
      cells.push({ date: createDate(year, month, day), isCurrentMonth: true });
    }

    const totalCells = Math.ceil((startWeekday + totalDays) / 7) * 7;
    const remaining = totalCells - cells.length;
    for (let i = 1; i <= remaining; i += 1) {
      cells.push({ date: createDate(year, month + 1, i), isCurrentMonth: false });
    }

    return cells;
  }, [currentMonth]);

  const handlePrevMonth = () => {
    setCurrentMonth((prev) => createDate(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth((prev) => createDate(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const handleToday = () => {
    const nextToday = new Date();
    setCurrentMonth(createDate(nextToday.getFullYear(), nextToday.getMonth(), 1));
    onSelectDate?.(nextToday);
  };

  return (
    <section
      className={cn('w-full max-w-200 min-h-100 rounded-xl border bg-white p-4 md:p-10 border-primary', className)}
    >
      <header className="flex items-center justify-center w-full relative mb-10">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={handlePrevMonth}
            className={cn('flex p-1 items-center justify-center rounded border-primary border')}
            aria-label="이전 달"
          >
            <img src="/icons/craft.left.svg" alt="이전 달" className="w-4 h-4 md:w-7 md:h-7" />
          </button>
          <span className="font-semibold text-xl md:text-3xl text-primary">{monthLabel}</span>
          <button
            type="button"
            onClick={handleNextMonth}
            className={cn('flex p-1 items-center justify-center rounded border-primary border')}
            aria-label="다음 달"
          >
            <img src="/icons/craft.right.svg" alt="다음 달" className="w-4 h-4 md:w-7 md:h-7" />
          </button>
        </div>

        <Button
          label="오늘"
          type="button"
          onClick={handleToday}
          variant="primary"
          className={cn('absolute right-0 w-fit')}
        />
      </header>

      <div className="mt-4 grid grid-cols-7 text-center font-bold">
        {WEEK_DAYS.map((day) => (
          <div key={day} className="text-primary">
            {day}
          </div>
        ))}
      </div>

      <div className="mt-3 grid grid-cols-7 ">
        {days.map(({ date, isCurrentMonth }) => {
          const isSelected = value ? isSameDay(value, date) : false;
          const key = `${date.getMonth()}-${date.getDate()}`;
          return (
            <Button
              key={key}
              onClick={() => onSelectDate?.(date)}
              type="button"
              label={date.getDate().toString()}
              variant={isSelected ? 'primary' : 'secondary'}
              className={cn(
                'text-sm border-none',
                isSelected ? 'text-white bg-primary' : isCurrentMonth ? 'text-primary' : 'text-text-secondary',
              )}
              disabled={!isCurrentMonth}
            />
          );
        })}
      </div>
    </section>
  );
}
