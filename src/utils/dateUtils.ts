import { DayStatus, Frequency } from '../types';

export const INDONESIAN_DAYS = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
export const INDONESIAN_DAYS_SHORT = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
export const INDONESIAN_MONTHS = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];
export const INDONESIAN_MONTHS_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
  'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'
];

/**
 * Format Date object to 'YYYY-MM-DD'
 */
export function formatDateStr(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function parseDateStr(str: string): Date {
  const [year, month, day] = str.split('-').map(Number);
  const d = new Date(year, month - 1, day);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function getTodayStr(): string {
  return formatDateStr(new Date());
}

export function formatIndonesianDate(dateStr: string, withDayName = true): string {
  const [year, month, day] = dateStr.split('-').map(Number);
  if (!year || !month || !day) return dateStr;

  const d = new Date(year, month - 1, day);
  const dayName = INDONESIAN_DAYS[d.getDay()];
  const monthName = INDONESIAN_MONTHS[d.getMonth()];

  return withDayName ? `${dayName}, ${day} ${monthName} ${year}` : `${day} ${monthName} ${year}`;
}

export function formatShortDate(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number);
  if (!year || !month || !day) return dateStr;
  const monthName = INDONESIAN_MONTHS_SHORT[month - 1];
  return `${day} ${monthName}`;
}

/**
 * Get the 7 days of the week containing the specified date (starting Monday)
 */
export function getWeekDays(referenceDateStr: string = getTodayStr()): (DayStatus & { isFuture: boolean })[] {
  const refDate = parseDateStr(referenceDateStr);
  const todayStr = getTodayStr();
  const todayDate = parseDateStr(todayStr);

  // In JavaScript: 0 is Sunday, 1 is Monday...
  // We want Monday as day 0 of the week
  const dayOfWeek = refDate.getDay();
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;

  const monday = new Date(refDate);
  monday.setDate(refDate.getDate() + mondayOffset);

  const days: (DayStatus & { isFuture: boolean })[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const dateStr = formatDateStr(d);

    days.push({
      dateStr,
      dayName: INDONESIAN_DAYS_SHORT[d.getDay()],
      dayNumber: d.getDate(),
      isToday: dateStr === todayStr,
      isFuture: d.getTime() > todayDate.getTime(),
    });
  }

  return days;
}

/**
 * Get recent days from newest (today) to oldest.
 * Default count: 6 days (Hari ini, H-1, H-2, H-3, H-4, H-5)
 * Perfectly fits mobile screen without horizontal scroll!
 */
export function getRecentDays(count: number = 6, referenceDateStr: string = getTodayStr()): (DayStatus & { isFuture: boolean })[] {
  const refDate = parseDateStr(referenceDateStr);
  const todayStr = getTodayStr();
  const todayDate = parseDateStr(todayStr);

  const days: (DayStatus & { isFuture: boolean })[] = [];

  for (let i = 0; i < count; i++) {
    const d = new Date(refDate);
    d.setDate(refDate.getDate() - i);
    const dateStr = formatDateStr(d);

    days.push({
      dateStr,
      dayName: INDONESIAN_DAYS_SHORT[d.getDay()],
      dayNumber: d.getDate(),
      isToday: dateStr === todayStr,
      isFuture: d.getTime() > todayDate.getTime(),
    });
  }

  return days;
}

export function isHabitScheduledForDate(dateStr: string, frequency: Frequency = 'daily'): boolean {
  if (frequency === 'daily') return true;
  const d = parseDateStr(dateStr);
  const dayOfWeek = d.getDay(); // 0 Sunday, 6 Saturday

  if (frequency === 'weekdays') {
    return dayOfWeek >= 1 && dayOfWeek <= 5;
  }
  if (frequency === 'weekends') {
    return dayOfWeek === 0 || dayOfWeek === 6;
  }
  return true;
}

export function calculateHabitStreaks(
  completedDates: string[],
  frequency: Frequency = 'daily',
  restDays: string[] = []
): { currentStreak: number; bestStreak: number } {
  if (!completedDates || completedDates.length === 0) {
    return { currentStreak: 0, bestStreak: 0 };
  }

  const completedSet = new Set(completedDates);
  const restSet = new Set(restDays);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let currentStreak = 0;
  const checkDate = new Date(today);
  const todayStr = formatDateStr(today);
  const isTodayCompleted = completedSet.has(todayStr);

  if (!isTodayCompleted && !restSet.has(todayStr)) {
    checkDate.setDate(checkDate.getDate() - 1);
  } else if (!isTodayCompleted && restSet.has(todayStr)) {
    // If today is a rest day and not completed, start checking from yesterday, but today doesn't break it
    checkDate.setDate(checkDate.getDate() - 1);
  }

  while (true) {
    const str = formatDateStr(checkDate);
    const isScheduled = isHabitScheduledForDate(str, frequency);
    const isRest = restSet.has(str);

    if (isScheduled && !isRest) {
      if (completedSet.has(str)) {
        currentStreak++;
      } else {
        break;
      }
    } else if (isScheduled && isRest && completedSet.has(str)) {
      // If it's a rest day but completed anyway, count it
      currentStreak++;
    }
    checkDate.setDate(checkDate.getDate() - 1);
    if (currentStreak > 500) break;
  }

  const sortedDates = Array.from(completedSet).sort();
  let bestStreak = 0;
  let runningStreak = 0;
  let prevDate: Date | null = null;

  for (const dStr of sortedDates) {
    const curr = parseDateStr(dStr);

    if (!prevDate) {
      runningStreak = 1;
    } else {
      const diffTime = curr.getTime() - prevDate.getTime();
      const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        runningStreak++;
      } else if (diffDays > 1) {
        let validStreak = true;
        const test = new Date(prevDate);
        test.setDate(test.getDate() + 1);

        while (test < curr) {
          const testStr = formatDateStr(test);
          const isScheduled = isHabitScheduledForDate(testStr, frequency);
          if (isScheduled && !restSet.has(testStr)) {
            validStreak = false;
            break;
          }
          test.setDate(test.getDate() + 1);
        }

        if (validStreak) {
          runningStreak++;
        } else {
          runningStreak = 1;
        }
      }
    }

    if (runningStreak > bestStreak) {
      bestStreak = runningStreak;
    }
    prevDate = curr;
  }

  return {
    currentStreak,
    bestStreak: Math.max(bestStreak, currentStreak),
  };
}
