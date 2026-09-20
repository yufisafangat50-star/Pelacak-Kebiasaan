import { Habit, ReminderSettings, TimeOfDay } from '../types';
import { getTodayStr, isHabitScheduledForDate } from './dateUtils';

export const DEFAULT_REMINDER_SETTINGS: ReminderSettings = {
  systemNotificationsEnabled: false,
  inAppAlertsEnabled: true,
  reminderSlots: {
    pagi: true,  // 08:00
    siang: true, // 12:00
    sore: true,  // 17:00
    malam: true, // 20:00
  },
};

export const isNotificationSupported = (): boolean => {
  return typeof window !== 'undefined' && 'Notification' in window;
};

export const getNotificationPermission = (): NotificationPermission | 'unsupported' => {
  if (!isNotificationSupported()) return 'unsupported';
  return Notification.permission;
};

export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!isNotificationSupported()) {
    return false;
  }

  try {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return false;
  }
};

export const sendSystemNotification = async (
  title: string,
  options: {
    body?: string;
    icon?: string;
    badge?: string;
    tag?: string;
    data?: unknown;
    actions?: { action: string; title: string }[];
  } = {}
): Promise<boolean> => {
  if (!isNotificationSupported() || Notification.permission !== 'granted') {
    return false;
  }

  const notificationOptions = {
    body: options.body || 'Waktunya menyelesaikan rutinitas harianmu!',
    icon: options.icon || '/pwa-192x192.png',
    badge: options.badge || '/icon.svg',
    tag: options.tag || 'habit-reminder',
    vibrate: [200, 100, 200],
    requireInteraction: false,
    ...options,
  };

  try {
    // 1. Prefer Service Worker registration to show rich notifications in background/PWA
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.ready;
        if (registration && typeof registration.showNotification === 'function') {
          await registration.showNotification(title, notificationOptions as NotificationOptions);
          return true;
        }
      } catch (swErr) {
        console.warn('Service worker notification fallback:', swErr);
      }
    }

    // 2. Direct Window Notification API fallback
    new Notification(title, notificationOptions);
    return true;
  } catch (e) {
    console.error('Failed to send notification:', e);
    return false;
  }
};

/**
 * Register Service Worker click listener if available
 */
export const setupNotificationClickListener = () => {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;

  navigator.serviceWorker.ready.then((registration) => {
    // Listen for messages from service worker
    navigator.serviceWorker.addEventListener('message', (event) => {
      if (event.data && event.data.type === 'NOTIFICATION_CLICK') {
        window.focus();
      }
    });
  }).catch(() => {
    // Ignore in unsupported environments
  });
};

// Check which habits are pending for today
export const getPendingHabitsForDate = (
  habits: Habit[],
  dateStr: string = getTodayStr(),
  filterTime?: TimeOfDay
): Habit[] => {
  return habits.filter((h) => {
    // Scheduled for this date?
    if (!isHabitScheduledForDate(dateStr, h.frequency)) {
      return false;
    }
    // Completed?
    if (h.completedDates.includes(dateStr)) {
      return false;
    }
    // Filter by time of day if requested
    if (filterTime && filterTime !== 'anytime' && h.timeOfDay !== 'anytime' && h.timeOfDay !== filterTime) {
      return false;
    }
    return true;
  });
};

// Determine current time slot (pagi, siang, sore, malam)
export const getCurrentTimeSlot = (date: Date = new Date()): 'pagi' | 'siang' | 'sore' | 'malam' => {
  const hour = date.getHours();
  if (hour >= 5 && hour < 11) return 'pagi';
  if (hour >= 11 && hour < 15) return 'siang';
  if (hour >= 15 && hour < 18) return 'sore';
  return 'malam';
};

// Send reminder outside the app if habits are pending
export const triggerScheduledReminderCheck = async (
  habits: Habit[],
  settings: ReminderSettings,
  force: boolean = false
): Promise<{ sent: boolean; count: number; message: string }> => {
  const today = getTodayStr();
  const pending = getPendingHabitsForDate(habits, today);

  if (pending.length === 0) {
    return { sent: false, count: 0, message: 'Semua rutinitas hari ini telah selesai!' };
  }

  const slot = getCurrentTimeSlot();
  const slotEnabled = settings.reminderSlots[slot];

  // In non-force mode, verify slot enabled and prevent duplicate spamming in same slot
  const slotKey = `${today}_${slot}`;
  if (!force) {
    if (!settings.systemNotificationsEnabled) {
      return { sent: false, count: pending.length, message: 'Notifikasi sistem belum diaktifkan' };
    }
    if (!slotEnabled) {
      return { sent: false, count: pending.length, message: `Pengingat waktu ${slot} nonaktif` };
    }
    if (settings.lastNotifiedSlot === slotKey) {
      return { sent: false, count: pending.length, message: `Sudah dikirim untuk slot ${slot}` };
    }
  }

  const habitNames = pending.slice(0, 3).map((h) => h.title).join(', ');
  const moreCount = pending.length > 3 ? ` dan ${pending.length - 3} lainnya` : '';
  const bodyText = `Ada ${pending.length} kebiasaan belum selesai (${habitNames}${moreCount}). Jangan biarkan streak terputus!`;

  const success = await sendSystemNotification(`Pengingat Rutinitas ${slot.toUpperCase()} ⏰`, {
    body: bodyText,
    tag: `habit-slot-${slot}`,
  });

  return {
    sent: success,
    count: pending.length,
    message: success ? `Notifikasi pengingat berhasil dikirim (${pending.length} kebiasaan)` : 'Gagal mengirim notifikasi',
  };
};
