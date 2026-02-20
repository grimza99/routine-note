/**
 * @param monthDate 금월의 날짜 객체 또는 날짜 문자열 (예: '2024-06-15'). 제공되지 않으면 현재 날짜를 사용합니다.
 * @returns 월의 연도, 월, 월의 주 수를 반환합니다.
 */
export function getCurrentMonthInfo(monthDate?: Date | string) {
  const currentMonth = monthDate ? (typeof monthDate === 'string' ? new Date(monthDate) : monthDate) : new Date();
  const year = currentMonth.getUTCFullYear();
  const monthNumber = currentMonth.getUTCMonth() + 1;
  const daysInMonth = new Date(Date.UTC(year, monthNumber, 0)).getUTCDate();
  const weeksInMonth = Math.ceil(daysInMonth / 7);
  return {
    year: String(year),
    month: String(monthNumber).padStart(2, '0'),
    weeksInMonth,
  };
}
