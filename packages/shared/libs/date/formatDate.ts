/**
 * @description 숫자 값을 받아 문자열로 변환한 후, 길이가 2가 되도록 앞에 '0'을 추가하는 함수
 */
const pad2 = (value: number) => String(value).padStart(2, '0');

/**
 * @description Date 객체를 받아 "YYYY-MM-DD" 형식의 문자열로 반환
 */
export const formatDate = (date: Date) => {
  const year = date.getFullYear();
  const month = pad2(date.getMonth() + 1);
  const day = pad2(date.getDate());
  return `${year}-${month}-${day}`;
};
/**
 * @description Date 객체를 받아 "YYYY-MM" 형식의 문자열로 반환
 */
export const formatDateYearMonth = (date?: Date | null) => {
  const currentDate = date || new Date();
  const year = currentDate.getFullYear();
  const month = pad2(currentDate.getMonth() + 1);
  return `${year}-${month}`;
};

/**
 * @description Date 객체를 "MM월 DD일" 형식의 문자열로 반환
 */
export const formatMonthDay = (date: Date) => {
  const month = pad2(date.getMonth() + 1);
  const day = pad2(date.getDate());
  return `${month}월 ${day}일`;
};
