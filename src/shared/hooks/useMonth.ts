import { useState } from 'react';
import { createDate } from '../libs';

export function useMonth(initialMonthValue?: Date | null) {
  const initialMonth = initialMonthValue ?? new Date();
  const [currentMonth, setCurrentMonth] = useState(() =>
    createDate(initialMonth.getFullYear(), initialMonth.getMonth(), 1),
  );
  const monthLabel = `${currentMonth.getFullYear()}년 ${currentMonth.getMonth() + 1}월`;

  const handlePrevMonth = () => {
    setCurrentMonth((prev) => createDate(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth((prev) => createDate(prev.getFullYear(), prev.getMonth() + 1, 1));
  };
  const handleChangeSetMonth = (date: Date) => {
    setCurrentMonth(createDate(date.getFullYear(), date.getMonth(), 1));
  };
  return {
    currentMonth,
    handleChangeSetMonth,
    monthLabel,
    handlePrevMonth,
    handleNextMonth,
  };
}
