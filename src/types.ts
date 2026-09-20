export type Category =
  | 'kesehatan'
  | 'produktivitas'
  | 'belajar'
  | 'olahraga'
  | 'mindfulness'
  | 'keuangan'
  | 'sosial';

export type TimeOfDay = 'anytime' | 'pagi' | 'siang' | 'sore' | 'malam';

export type Frequency = 'daily' | 'weekdays' | 'weekends';

export type HabitType = 'boolean' | 'counter' | 'timer';

export interface Habit {
  id: string;
  title: string;
  description?: string;
  category: Category;
  timeOfDay: TimeOfDay;
  frequency: Frequency;
  habitType: HabitType;
  color: string;
  icon: string;
  targetCount?: number;
  durationMinutes?: number;
  unit?: string;
  createdAt: string;
  completedDates: string[]; // list of 'YYYY-MM-DD'
  restDays?: string[]; // list of 'YYYY-MM-DD' for streak freeze
  progressMap?: Record<string, number>; // 'YYYY-MM-DD' -> count
  notesMap?: Record<string, string>; // 'YYYY-MM-DD' -> quick note
  archived?: boolean;
  // Habit Stacking (Atomic Habits: "Setelah [kebiasaan/pemicu], saya akan [kebiasaan ini]")
  stackParentHabitId?: string; // ID of the anchor habit this stacks after
  triggerCue?: string; // Custom cue e.g. "Setelah bangun tidur" or "Setelah sarapan"
}

export interface DayStatus {
  dateStr: string; // 'YYYY-MM-DD'
  dayName: string; // 'Sen', 'Sel', etc.
  dayNumber: number; // 18
  isToday: boolean;
  isFuture: boolean;
}

export interface HabitStats {
  totalHabits: number;
  completedTodayCount: number;
  todayPercentage: number;
  currentStreak: number;
  bestStreak: number;
  totalCompletionsAllTime: number;
}

export interface ReminderSettings {
  systemNotificationsEnabled: boolean;
  inAppAlertsEnabled: boolean;
  reminderSlots: {
    pagi: boolean; // 08:00
    siang: boolean; // 12:00
    sore: boolean; // 17:00
    malam: boolean; // 20:00
  };
  customSlotTimes?: {
    pagi?: string; // '08:00'
    siang?: string; // '12:00'
    sore?: string; // '17:00'
    malam?: string; // '20:00'
  };
  lastNotifiedDate?: string;
  lastNotifiedSlot?: string;
}

export type ThemeMode = 'light' | 'dark' | 'system';

export interface DailyBackup {
  id: string;
  dateStr: string; // 'YYYY-MM-DD'
  timestamp: number;
  timeStr: string; // 'HH:mm'
  habitsCount: number;
  totalCompletions: number;
  isAuto: boolean;
  habits: Habit[];
}

export type MoodValue = 1 | 2 | 3 | 4 | 5;
export type MoodMap = Record<string, MoodValue>;
