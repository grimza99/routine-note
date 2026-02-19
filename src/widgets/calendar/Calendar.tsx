'use client';
import { useMemo } from 'react';

import { useMonth } from '@/shared/hooks';
import { cn, createDate, formatDate } from '@/shared/libs';
import { Button, Dot } from '@/shared/ui';

type CalendarProps = {
  value?: Date | null;
  recordDates?: string[];
  onSelectDate?: (date: Date) => void;
  className?: string;
};

const WEEK_DAYS = ['일', '월', '화', '수', '목', '금', '토'];

const isSameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

export function Calendar({ value, onSelectDate, recordDates, className }: CalendarProps) {
  const { currentMonth, handleChangeSetMonth, monthLabel, handlePrevMonth, handleNextMonth } = useMonth(value);
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

  const handleToday = () => {
    const nextToday = new Date();
    handleChangeSetMonth(nextToday);
    onSelectDate?.(nextToday);
  };

  return (
    <section
      className={cn(
        'w-full max-w-200 min-h-80 md:min-h-92 rounded-xl border-2 bg-white p-4 md:p-10 border-primary',
        className,
      )}
    >
      <header className="flex items-center justify-center w-full relative mb-10">
        <div className="flex items-center gap-1 md:gap-4">
          <button onClick={handlePrevMonth} className={cn('flex p-1 items-center justify-center')} aria-label="이전 달">
            <img src="/icons/craft.left.svg" alt="이전 달" className="w-4 h-4 md:w-7 md:h-7" />
          </button>
          <span className="font-semibold text-lg md:text-2xl lg:text-3xl text-primary">{monthLabel}</span>
          <button
            onClick={() => handleNextMonth()}
            className={cn('flex p-1 items-center justify-center')}
            aria-label="다음 달"
          >
            <img src="/icons/craft.right.svg" alt="다음 달" className="w-4 h-4 md:w-7 md:h-7" />
          </button>
        </div>

        <Button
          label="오늘"
          onClick={handleToday}
          variant="primary"
          className={cn('absolute right-0 w-fit px-2 md:px-4')}
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
              label={
                <div className="flex flex-col items-center w-full h-full">
                  {date.getDate().toString()}
                  {recordDates?.includes(formatDate(date)) && <Dot color={isSelected ? 'bg-white' : ''} />}
                </div>
              }
              variant={isSelected ? 'primary' : 'secondary'}
              className={cn(
                'text-sm border-none',
                isSelected ? 'text-white bg-primary' : isCurrentMonth ? 'text-primary' : 'text-text-secondary',
                !isCurrentMonth && 'bg-white',
              )}
              disabled={!isCurrentMonth}
            />
          );
        })}
      </div>
    </section>
  );
}
