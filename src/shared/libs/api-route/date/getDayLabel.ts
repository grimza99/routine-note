export function getDayLabel(date: Date) {
  const day = date.getUTCDay();
  switch (day) {
    case 1:
      return '월';
    case 2:
      return '화';
    case 3:
      return '수';
    case 4:
      return '목';
    case 5:
      return '금';
    case 6:
      return '토';
    default:
      return '일';
  }
}
