function getWeekdayOffset(date: Date) {
  const day = date.getUTCDay();
  return day === 0 ? 6 : day - 1;
}
export function getCurrentWeekRange() {
  const today = new Date();
  const startDate = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));
  startDate.setUTCDate(startDate.getUTCDate() - getWeekdayOffset(startDate));
  const endDate = new Date(startDate);
  endDate.setUTCDate(endDate.getUTCDate() + 6);
  const start = startDate.toISOString().slice(0, 10);
  const end = endDate.toISOString().slice(0, 10);
  return { startDate, endDate, start, end };
}
