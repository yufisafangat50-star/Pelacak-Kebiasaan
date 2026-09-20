import { DailyBackup, Habit } from '../types';
import { getTodayStr } from './dateUtils';

const DAILY_BACKUP_STORAGE_KEY = 'pelacak_kebiasaan_daily_backups';
const LAST_AUTO_BACKUP_DATE_KEY = 'pelacak_kebiasaan_last_backup_date';
const MAX_DAILY_BACKUPS = 14; // Keep up to 14 days of rolling backups

/**
 * Retrieves all stored daily backups sorted from newest to oldest.
 */
export const getDailyBackups = (): DailyBackup[] => {
  try {
    const raw = localStorage.getItem(DAILY_BACKUP_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.sort((a, b) => b.timestamp - a.timestamp);
    }
  } catch (err) {
    console.error('Failed to load daily backups from storage:', err);
  }
  return [];
};

/**
 * Computes total completions across all habits.
 */
const countTotalCompletions = (habits: Habit[]): number => {
  return habits.reduce((acc, h) => acc + (h.completedDates?.length || 0), 0);
};

/**
 * Creates or updates today's daily backup.
 * If a backup for today already exists, it updates it with the latest progress.
 * If manual, it forces a timestamped snapshot.
 */
export const saveDailyBackup = (
  habits: Habit[],
  isManual: boolean = false
): { backup: DailyBackup; isNew: boolean } => {
  const existingBackups = getDailyBackups();
  const todayStr = getTodayStr();
  const now = new Date();
  const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  const totalCompletions = countTotalCompletions(habits);

  // Check if an automatic backup for today already exists
  const existingTodayIndex = isManual
    ? -1
    : existingBackups.findIndex((b) => b.dateStr === todayStr && b.isAuto);

  let updatedList: DailyBackup[];
  let targetBackup: DailyBackup;
  let isNew = false;

  if (existingTodayIndex >= 0) {
    // Update today's existing automatic backup with the newest state
    targetBackup = {
      ...existingBackups[existingTodayIndex],
      timestamp: Date.now(),
      timeStr,
      habitsCount: habits.length,
      totalCompletions,
      habits: JSON.parse(JSON.stringify(habits)),
    };
    updatedList = [...existingBackups];
    updatedList[existingTodayIndex] = targetBackup;
  } else {
    // Create new daily backup entry
    targetBackup = {
      id: `backup-${todayStr}-${Date.now()}`,
      dateStr: todayStr,
      timestamp: Date.now(),
      timeStr,
      habitsCount: habits.length,
      totalCompletions,
      isAuto: !isManual,
      habits: JSON.parse(JSON.stringify(habits)),
    };
    updatedList = [targetBackup, ...existingBackups];
    isNew = true;
  }

  // Enforce maximum backup retention limit (14 days)
  if (updatedList.length > MAX_DAILY_BACKUPS) {
    updatedList = updatedList.slice(0, MAX_DAILY_BACKUPS);
  }

  try {
    localStorage.setItem(DAILY_BACKUP_STORAGE_KEY, JSON.stringify(updatedList));
    localStorage.setItem(LAST_AUTO_BACKUP_DATE_KEY, todayStr);
  } catch (err) {
    console.error('Failed to save daily backup to storage:', err);
  }

  return { backup: targetBackup, isNew };
};

/**
 * Checks and performs daily automatic backup if needed.
 * Ensures the user has a reliable snapshot of their habits in browser storage.
 */
export const performDailyAutoBackup = (
  habits: Habit[]
): { performed: boolean; backup?: DailyBackup } => {
  if (!habits || habits.length === 0) {
    return { performed: false };
  }

  try {
    const todayStr = getTodayStr();
    const existing = getDailyBackups();
    const todayBackup = existing.find((b) => b.dateStr === todayStr && b.isAuto);

    // If no backup exists for today, or if habit data has progressed, update
    const shouldBackup =
      !todayBackup ||
      todayBackup.habitsCount !== habits.length ||
      todayBackup.totalCompletions !== countTotalCompletions(habits);

    if (shouldBackup) {
      const result = saveDailyBackup(habits, false);
      return { performed: true, backup: result.backup };
    }
  } catch (err) {
    console.error('Error during automatic daily backup check:', err);
  }

  return { performed: false };
};

/**
 * Restores habits from a specific daily backup.
 */
export const restoreDailyBackup = (backupId: string): Habit[] | null => {
  const backups = getDailyBackups();
  const found = backups.find((b) => b.id === backupId);
  if (!found || !Array.isArray(found.habits)) {
    return null;
  }
  return JSON.parse(JSON.stringify(found.habits));
};

/**
 * Deletes a single daily backup by ID.
 */
export const deleteDailyBackup = (backupId: string): DailyBackup[] => {
  const backups = getDailyBackups();
  const filtered = backups.filter((b) => b.id !== backupId);
  try {
    localStorage.setItem(DAILY_BACKUP_STORAGE_KEY, JSON.stringify(filtered));
  } catch (err) {
    console.error('Failed to delete backup:', err);
  }
  return filtered;
};

/**
 * Gets the most recent backup info.
 */
export const getLatestBackupInfo = (): DailyBackup | null => {
  const backups = getDailyBackups();
  return backups.length > 0 ? backups[0] : null;
};
