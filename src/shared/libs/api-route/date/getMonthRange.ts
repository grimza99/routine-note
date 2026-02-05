/**
 *
 * @param year_month - format: 'YYYY-MM'
 * @returns start - 'YYYY-MM-01', end - 'YYYY-MM-DD' (last day of month)
 */
export const getMonthRange = (year_month: string) => {
  const [year, month] = year_month.split('-');
  const start = `${year_month}-01`;
  const end = new Date(Date.UTC(Number(year), Number(month), 0)).toISOString().slice(0, 10);

  return { start, end };
};
