'use client';
import { useEffect, useState } from 'react';
import { createDate } from '../libs';

/**
 * @param initialMonthValue //초기 달 값 없으면 현재 달로 대체
 * @returns {
 *  currentMonth: Date; //현재 달의 첫째 날
 *  handleChangeSetMonth: (date: Date) => void; //달 변경 함수
 *  monthLabel: string; //달 라벨 (예: "2023년 8월")
 *  handlePrevMonth: () => void; //이전 달로 이동 함수
 *  handleNextMonth: (isNextMonthBlock?: boolean) => void; //다음 달로 이동 함수, isNextMonthBlock이 true면 현재 달 이후로 이동 불가
 * }
 */
export function useMonth(initialMonthValue?: Date | null) {
  const initialMonth = initialMonthValue ?? new Date();
  const [currentMonth, setCurrentMonth] = useState(() =>
    createDate(initialMonth.getFullYear(), initialMonth.getMonth(), 1),
  );
  useEffect(() => {
    if (initialMonthValue) {
      setCurrentMonth(createDate(initialMonthValue.getFullYear(), initialMonthValue.getMonth(), 1));
    }
  }, [initialMonthValue]);
  const monthLabel = `${currentMonth.getFullYear()}년 ${currentMonth.getMonth() + 1}월`;

  const handlePrevMonth = () => {
    setCurrentMonth((prev) => createDate(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = (isNextMonthBlock?: boolean) => {
    isNextMonthBlock = isNextMonthBlock ?? false;
    if (isNextMonthBlock) {
      const today = new Date();
      if (currentMonth.getFullYear() === today.getFullYear() && currentMonth.getMonth() >= today.getMonth()) {
        return;
      }
    }
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
