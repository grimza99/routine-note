'use client';
import { useMemo, useState } from 'react';

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

    const remaining = 42 - cells.length;
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
    <section className={`w-full rounded-xl border bg-white p-10 border-(--primary)`}>
      <header className="flex items-center justify-center w-full relative">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePrevMonth}
            className="flex p-2 items-center justify-center rounded border-(--primary) border"
            aria-label="이전 달"
          >
            <img src="/icons/craft.left.svg" alt="이전 달" className="w-6 h-6" />
          </button>
          <span className="font-semibold text-3xl text-(--primary)">{monthLabel}</span>
          <button
            type="button"
            onClick={handleNextMonth}
            className="flex p-2 items-center justify-center rounded border-(--primary) border"
            aria-label="다음 달"
          >
            <img src="/icons/craft.right.svg" alt="다음 달" className="w-6 h-6" />
          </button>
        </div>
        <button
          type="button"
          onClick={handleToday}
          className="rounded px-3 py-1 text-sm font-semibold absolute right-0 border-(--primary) border text-(--white) bg-(--primary)"
        >
          오늘
        </button>
      </header>

      <div
        className="mt-4 grid grid-cols-7 gap-2 text-center text-xs font-semibold"
        style={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(0, 1fr))', gap: '8px' }}
      >
        {WEEK_DAYS.map((day) => (
          <div key={day} style={{ color: 'var(--text-secondary)' }}>
            {day}
          </div>
        ))}
      </div>

      <div
        className="mt-3 grid grid-cols-7 gap-2"
        style={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(0, 1fr))', gap: '8px' }}
      >
        {days.map(({ date, isCurrentMonth }) => {
          const isSelected = value ? isSameDay(value, date) : false;
          const isToday = isSameDay(today, date);
          const textColor = isSelected
            ? 'var(--white)'
            : isCurrentMonth
              ? 'var(--text-primary)'
              : 'var(--text-secondary)';

          return (
            <button
              key={date.toISOString()}
              type="button"
              className="flex h-10 w-full items-center justify-center rounded text-sm"
              onClick={() => onSelectDate?.(date)}
              style={{
                background: isSelected ? 'var(--primary)' : 'transparent',
                color: textColor,
                border: isToday && !isSelected ? '1px solid var(--primary)' : '1px solid transparent',
                borderRadius: 'var(--radius-base)',
              }}
            >
              {date.getDate()}
            </button>
          );
        })}
      </div>
    </section>
  );
}
