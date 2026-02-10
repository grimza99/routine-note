/**
 *
 * @returns 금월의 연도, 월, 월의 주 수를 반환합니다.
 */
//
export function getCurrentMonthInfo() {
  const today = new Date();
  const year = today.getUTCFullYear();
  const monthNumber = today.getUTCMonth() + 1;
  const daysInMonth = new Date(Date.UTC(year, monthNumber, 0)).getUTCDate();
  const weeksInMonth = Math.ceil(daysInMonth / 7);
  return {
    year: String(year),
    month: String(monthNumber).padStart(2, '0'),
    weeksInMonth,
  };
}
