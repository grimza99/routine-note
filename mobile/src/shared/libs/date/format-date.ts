const pad2 = (value: number) => String(value).padStart(2, '0');

/**
 * @description year,month,day을 받아 Date 객체로 반환하는 함수
 */
export const createDate = (year: number, month: number, day: number) => new Date(year, month, day);

/**
 * @description Date 객체를 "MM월 DD일" 형식의 문자열로 반환하는 함수
 */
export const formatMonthDay = (date: Date) => {
  const month = pad2(date.getMonth() + 1);
  const day = pad2(date.getDate());
  return `${month}월 ${day}일`;
};

/**
 * @description Date 객체를 받아 "YYYY-MM-DD" 형식의 문자열로 반환하는 함수
 */
export const formatDate = (date: Date) => {
  const year = date.getFullYear();
  const month = pad2(date.getMonth() + 1);
  const day = pad2(date.getDate());
  return `${year}-${month}-${day}`;
};
