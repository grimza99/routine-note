const pad2 = (value: number) => String(value).padStart(2, "0");

export const formatDate = (date: Date) => {
  const year = date.getFullYear();
  const month = pad2(date.getMonth() + 1);
  const day = pad2(date.getDate());
  return `${year}-${month}-${day}`;
};

export const formatMonthDay = (date: Date) => {
  const month = pad2(date.getMonth() + 1);
  const day = pad2(date.getDate());
  return `${month}월 ${day}일`;
};
