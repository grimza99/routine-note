const pad2 = (value: number) => String(value).padStart(2, '0');

export const formatDate = (date: Date) => {
  const year = date.getFullYear();
  const month = pad2(date.getMonth() + 1);
  const day = pad2(date.getDate());
  return `${year}-${month}-${day}`;
};
export const formatDateYearMonth = (date?: Date | null) => {
  const currentDate = date || new Date();
  const year = currentDate.getFullYear();
  const month = pad2(currentDate.getMonth() + 1);
  return `${year}-${month}`;
};

export const formatMonthDay = (date: Date) => {
  const month = pad2(date.getMonth() + 1);
  const day = pad2(date.getDate());
  return `${month}월 ${day}일`;
};

export const createDate = (year: number, month: number, day: number) => new Date(year, month, day);
