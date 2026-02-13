export { json } from './json/json';

// date utils
export { getMonthRange } from './date/getMonthRange'; // 'YYYY-MM' -> { start: 'YYYY-MM-01', end: 'YYYY-MM-DD' (last day of month) }
export { getCurrentWeekRange } from './date/getWeekRange'; // 현재 주의 { startDate, endDate, start: 'YYYY-MM-DD', end: 'YYYY-MM-DD' }
export { getDayLabel } from './date/getDayLabel';
// report utils
export { getMaxConsecutiveDays } from './report/getMaxConsecutiveDays'; // 'YYYY-MM-DD' 배열 -> 최장 연속 날짜 수

// header utils
export { getClientMeta, type ClientMeta } from './header/getClientMeta';
