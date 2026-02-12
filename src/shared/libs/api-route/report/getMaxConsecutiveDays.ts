/**
 *
 * @param dates Array of date strings in 'YYYY-MM-DD' format
 * @returns number of maximum consecutive days
 */
export function getMaxConsecutiveDays(dates: string[]) {
  if (!dates.length) return 0;

  const uniqueDates = Array.from(new Set(dates));
  const dayNumbers = uniqueDates
    .map((date) => Date.parse(`${date}T00:00:00Z`))
    .filter((value) => Number.isFinite(value))
    .sort((a, b) => a - b)
    .map((value) => Math.floor(value / 86400000));

  if (!dayNumbers.length) return 0;

  let maxStreak = 1;
  let currentStreak = 1;

  for (let i = 1; i < dayNumbers.length; i += 1) {
    if (dayNumbers[i] - dayNumbers[i - 1] === 1) {
      currentStreak += 1;
    } else {
      currentStreak = 1;
    }
    if (currentStreak > maxStreak) {
      maxStreak = currentStreak;
    }
  }

  return maxStreak;
}
