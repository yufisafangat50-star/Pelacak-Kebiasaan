import React, { useState, useEffect, useMemo, useRef, Suspense, lazy } from 'react';
import { Plus, Search, X, AlertCircle, CheckCircle2, Sparkles, Bell, LayoutList, Workflow } from 'lucide-react';
import { Habit, Category, DayStatus, TimeOfDay, ReminderSettings, ThemeMode, DailyBackup, MoodMap } from './types';
import { INITIAL_HABITS, CATEGORY_DETAILS } from './data/defaultHabits';
import { getTodayStr, getRecentDays, isHabitScheduledForDate, calculateHabitStreaks } from './utils/dateUtils';
import { playCompletionSound } from './utils/sound';
import {
  getDailyBackups,
  performDailyAutoBackup,
  saveDailyBackup,
  deleteDailyBackup,
} from './utils/backupService';
import { MobileHeader } from './components/MobileHeader';
import { HabitCard } from './components/HabitCard';
import { TodayView } from './components/views/TodayView';
import { HabitModal } from './components/HabitModal';
import { HabitStackTimelineView } from './components/HabitStackTimelineView';
import { BottomNav, TabType } from './components/BottomNav';
const WeeklyOverview = lazy(() => import('./components/WeeklyOverview').then(module => ({ default: module.WeeklyOverview })));
const StatsView = lazy(() => import('./components/StatsView').then(module => ({ default: module.StatsView })));
const SettingsView = lazy(() => import('./components/SettingsView').then(module => ({ default: module.SettingsView })));
const ShareAchievementModal = lazy(() => import('./components/ShareAchievementModal').then(module => ({ default: module.ShareAchievementModal })));
const HabitPackModal = lazy(() => import('./components/HabitPackModal').then(module => ({ default: module.HabitPackModal })));
const FocusTimerModal = lazy(() => import('./components/FocusTimerModal').then(module => ({ default: module.FocusTimerModal })));
const OnboardingTutorial = lazy(() => import('./components/OnboardingTutorial').then(module => ({ default: module.OnboardingTutorial })));
import { InAppNotificationCenter } from './components/InAppNotificationCenter';
import { PWAInstallBanner } from './components/PWAInstallBanner';
import { AtRiskOverlay } from './components/AtRiskOverlay';
import { MoodTracker } from './components/MoodTracker';
import { MotivationalQuote } from './components/MotivationalQuote';
import { HabitTemplate } from './data/habitPacks';
import {
  DEFAULT_REMINDER_SETTINGS,
  getNotificationPermission,
  getPendingHabitsForDate,
  requestNotificationPermission,
  triggerScheduledReminderCheck,
  getCurrentTimeSlot,
  setupNotificationClickListener,
} from './utils/notificationService';

const STORAGE_KEY = 'pelacak_kebiasaan_v2';
const SOUND_PREF_KEY = 'pelacak_kebiasaan_sound';
const REMINDER_PREF_KEY = 'pelacak_kebiasaan_reminders';
const THEME_PREF_KEY = 'pelacak_kebiasaan_theme';
const MOOD_STORAGE_KEY = 'pelacak_kebiasaan_mood';

export default function App() {
  const [habits, setHabits] = useState<Habit[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error(e);
    }
    return INITIAL_HABITS;
  });

  const TUTORIAL_STORAGE_KEY = 'rima_karsa_tutorial_seen';
  const [showTutorial, setShowTutorial] = useState(() => {
    return !localStorage.getItem(TUTORIAL_STORAGE_KEY);
  });

  const handleTutorialComplete = () => {
    localStorage.setItem(TUTORIAL_STORAGE_KEY, 'true');
    setShowTutorial(false);
  };

  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    try {
      const val = localStorage.getItem(SOUND_PREF_KEY);
      return val !== 'false';
    } catch {
      return true;
    }
  });

  const [themeMode, setThemeMode] = useState<ThemeMode>(() => {
    try {
      const val = localStorage.getItem(THEME_PREF_KEY);
      if (val === 'dark' || val === 'light' || val === 'system') {
        return val;
      }
    } catch {
      // ignore
    }
    return 'system';
  });

  // Determine active dark state
  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    const val = localStorage.getItem(THEME_PREF_KEY);
    if (val === 'dark') return true;
    if (val === 'light') return false;
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
  });

  // Apply dark mode class to document element and sync with system preference
  useEffect(() => {
    const root = document.documentElement;
    const mediaQuery = window.matchMedia?.('(prefers-color-scheme: dark)');

    const updateTheme = () => {
      let active = false;
      if (themeMode === 'dark') {
        active = true;
      } else if (themeMode === 'light') {
        active = false;
      } else {
        active = mediaQuery?.matches ?? false;
      }

      setIsDark(active);
      if (active) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    };

    updateTheme();
    try {
      localStorage.setItem(THEME_PREF_KEY, themeMode);
    } catch (e) {
      console.error(e);
    }

    if (themeMode === 'system' && mediaQuery) {
      mediaQuery.addEventListener('change', updateTheme);
      return () => mediaQuery.removeEventListener('change', updateTheme);
    }
  }, [themeMode]);

  const handleToggleTheme = () => {
    setThemeMode((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const [reminderSettings, setReminderSettings] = useState<ReminderSettings>(() => {
    try {
      const saved = localStorage.getItem(REMINDER_PREF_KEY);
      if (saved) {
        return { ...DEFAULT_REMINDER_SETTINGS, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.error(e);
    }
    return DEFAULT_REMINDER_SETTINGS;
  });

  const [notificationPermission, setNotificationPermission] = useState<
    NotificationPermission | 'unsupported'
  >(() => getNotificationPermission());

  const todayStr = getTodayStr();
  const [selectedDateStr, setSelectedDateStr] = useState<string>(todayStr);
  const [activeTab, setActiveTab] = useState<TabType>('tracker');

  const [isNotificationCenterOpen, setIsNotificationCenterOpen] = useState(false);

  const [isDynamicThemeEnabled, setIsDynamicThemeEnabled] = useState<boolean>(() => {
    try {
      const val = localStorage.getItem('pelacak_kebiasaan_dynamic_theme');
      return val !== 'false';
    } catch {
      return true;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('pelacak_kebiasaan_dynamic_theme', String(isDynamicThemeEnabled));
    } catch (e) {
      console.error(e);
    }
  }, [isDynamicThemeEnabled]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [preselectedParentHabitId, setPreselectedParentHabitId] = useState<string | undefined>(undefined);

  const [hasCheckedAtRisk, setHasCheckedAtRisk] = useState(false);
  const [showAtRiskOverlay, setShowAtRiskOverlay] = useState(false);
  const [atRiskHabits, setAtRiskHabits] = useState<Habit[]>([]);

  const [timerHabit, setTimerHabit] = useState<Habit | null>(null);

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimeoutRef = useRef<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [shareHabit, setShareHabit] = useState<Habit | null>(null);

  const [isPackModalOpen, setIsPackModalOpen] = useState(false);

  const [dailyBackups, setDailyBackups] = useState<DailyBackup[]>(() => getDailyBackups());
  useEffect(() => {
    try {
      const res = performDailyAutoBackup(habits);
      if (res.performed) {
        setDailyBackups(getDailyBackups());
      }
    } catch (error) {
      console.error("Failed to load daily backups", error);
    }
  }, [habits]);

  const [moodMap, setMoodMap] = useState<MoodMap>(() => {
    try {
      const saved = localStorage.getItem(MOOD_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error("Failed to load mood map", e);
    }
    return {};
  });

  useEffect(() => {
    try {
      localStorage.setItem(MOOD_STORAGE_KEY, JSON.stringify(moodMap));
    } catch (e) {
      console.error(e);
    }
  }, [moodMap]);

  useEffect(() => {
    if (habits.length > 0 && !hasCheckedAtRisk) {
      const today = getTodayStr();
      const risky = habits.filter(h => {
        if (!isHabitScheduledForDate(today, h.frequency)) return false;
        if (h.completedDates.includes(today)) return false;
        // Does it have a streak >= 3?
        const streak = calculateHabitStreaks(h.completedDates, h.frequency, h.restDays);
        return streak.currentStreak >= 3;
      });
      if (risky.length > 0) {
        setAtRiskHabits(risky);
        setShowAtRiskOverlay(true);
      }
      setHasCheckedAtRisk(true);
    }
  }, [habits, hasCheckedAtRisk]);

  // Sync to local storage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(habits));
    } catch (e) {
      console.error(e);
    }
  }, [habits]);

  useEffect(() => {
    try {
      localStorage.setItem(SOUND_PREF_KEY, String(soundEnabled));
    } catch (e) {
      console.error(e);
    }
  }, [soundEnabled]);

  useEffect(() => {
    try {
      localStorage.setItem(REMINDER_PREF_KEY, JSON.stringify(reminderSettings));
    } catch (e) {
      console.error(e);
    }
  }, [reminderSettings]);

  // Update notification permission status periodically / on focus
  useEffect(() => {
    setupNotificationClickListener();
    const updatePerm = () => setNotificationPermission(getNotificationPermission());
    updatePerm();
    window.addEventListener('focus', updatePerm);
    return () => window.removeEventListener('focus', updatePerm);
  }, []);

  // Compute pending habits for today
  const pendingHabitsToday = useMemo(() => {
    return getPendingHabitsForDate(habits, todayStr);
  }, [habits, todayStr]);

  // Periodic Reminder Checker (Checks every 60 seconds if system notifications are enabled)
  useEffect(() => {
    if (!reminderSettings.systemNotificationsEnabled || notificationPermission !== 'granted') {
      return;
    }

    const checkReminders = async () => {
      const slot = getCurrentTimeSlot();
      const slotKey = `${todayStr}_${slot}`;

      if (reminderSettings.lastNotifiedSlot !== slotKey) {
        const res = await triggerScheduledReminderCheck(habits, reminderSettings);
        if (res.sent) {
          setReminderSettings((prev) => ({
            ...prev,
            lastNotifiedDate: todayStr,
            lastNotifiedSlot: slotKey,
          }));
        }
      }
    };

    // Run check on mount and every 60s
    const timer = window.setInterval(checkReminders, 60000);
    return () => window.clearInterval(timer);
  }, [habits, reminderSettings, notificationPermission, todayStr]);

  const showToast = (msg: string) => {
    if (toastTimeoutRef.current) {
      window.clearTimeout(toastTimeoutRef.current);
    }
    setToastMessage(msg);
    toastTimeoutRef.current = window.setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const handleRequestSystemPermission = async () => {
    const granted = await requestNotificationPermission();
    setNotificationPermission(getNotificationPermission());
    if (granted) {
      setReminderSettings((prev) => ({
        ...prev,
        systemNotificationsEnabled: true,
      }));
      showToast('Izin notifikasi ponsel aktif! Pengingat akan dikirim saat rutinitas belum selesai.');
    } else {
      showToast('Izin notifikasi belum diberikan atau diblokir.');
    }
  };

  const handleTriggerSystemTest = async () => {
    if (notificationPermission !== 'granted') {
      const granted = await requestNotificationPermission();
      setNotificationPermission(getNotificationPermission());
      if (!granted) {
        showToast('Mohon izinkan notifikasi browser untuk mengirim pemberitahuan');
        return;
      }
    }

    const res = await triggerScheduledReminderCheck(habits, reminderSettings, true);
    showToast(res.message);
  };

  const headerDays = useMemo(() => getRecentDays(30, todayStr), [todayStr]);
  const weeklyDays = useMemo(() => getRecentDays(7, todayStr), [todayStr]);

  const handleToggleDate = (habitId: string, dateStr: string = selectedDateStr) => {
    setHabits((prev) =>
      prev.map((h) => {
        if (h.id !== habitId) return h;

        const isCurrentlyCompleted = h.completedDates.includes(dateStr);
        let newDates: string[];

        if (isCurrentlyCompleted) {
          newDates = h.completedDates.filter((d) => d !== dateStr);
          showToast(`"${h.title}" dibatalkan`);
        } else {
          newDates = [...h.completedDates, dateStr];
          if (soundEnabled) {
            playCompletionSound();
          }
          showToast(`"${h.title}" ditandai selesai!`);
        }

        return {
          ...h,
          completedDates: newDates,
        };
      })
    );
  };

  const handleToggleRestDay = (habitId: string, dateStr: string = selectedDateStr) => {
    setHabits((prev) =>
      prev.map((h) => {
        if (h.id !== habitId) return h;
        const currentRestDays = h.restDays || [];
        const isRest = currentRestDays.includes(dateStr);
        let newRestDays: string[];
        
        if (isRest) {
          newRestDays = currentRestDays.filter((d) => d !== dateStr);
          showToast(`"${h.title}" batal istirahat`);
        } else {
          newRestDays = [...currentRestDays, dateStr];
          showToast(`"${h.title}" ditandai istirahat`);
        }

        return {
          ...h,
          restDays: newRestDays,
        };
      })
    );
  };

  const handleUpdateCounter = (habitId: string, dateStr: string, newCount: number) => {
    setHabits((prev) =>
      prev.map((h) => {
        if (h.id !== habitId) return h;

        const currentMap = h.progressMap || {};
        const updatedMap = { ...currentMap, [dateStr]: newCount };
        const target = h.targetCount || 1;

        const wasCompleted = h.completedDates.includes(dateStr);
        const isNowCompleted = newCount >= target;

        let newCompletedDates = h.completedDates;
        if (isNowCompleted && !wasCompleted) {
          newCompletedDates = [...h.completedDates, dateStr];
          if (soundEnabled) {
            playCompletionSound();
          }
          showToast(`Target "${h.title}" tercapai!`);
        } else if (!isNowCompleted && wasCompleted) {
          newCompletedDates = h.completedDates.filter((d) => d !== dateStr);
        }

        return {
          ...h,
          progressMap: updatedMap,
          completedDates: newCompletedDates,
        };
      })
    );
  };

  const handleSaveNote = (habitId: string, dateStr: string, note: string) => {
    setHabits((prev) =>
      prev.map((h) => {
        if (h.id !== habitId) return h;
        const currentNotes = h.notesMap || {};
        return {
          ...h,
          notesMap: { ...currentNotes, [dateStr]: note },
        };
      })
    );
    showToast('Catatan harian disimpan');
  };

  // Add / Edit habit
  const handleSaveHabit = (
    habitData: Omit<Habit, 'id' | 'createdAt' | 'completedDates'> & { id?: string }
  ) => {
    if (habitData.id) {
      setHabits((prev) =>
        prev.map((h) => (h.id === habitData.id ? { ...h, ...habitData } : h))
      );
      showToast('Kebiasaan berhasil diperbarui');
    } else {
      const newHabit: Habit = {
        id: `habit-${Date.now()}`,
        ...habitData,
        createdAt: todayStr,
        completedDates: [],
        progressMap: {},
        notesMap: {},
      };
      setHabits((prev) => [newHabit, ...prev]);
      showToast(`"${newHabit.title}" ditambahkan`);
    }
  };

  const handleImportHabitsFromPack = (packHabits: HabitTemplate[]) => {
    const newHabits: Habit[] = packHabits.map((h, i) => ({
      ...h,
      id: `habit-${Date.now()}-${i}`,
      createdAt: todayStr,
      completedDates: [],
      progressMap: {},
      notesMap: {},
    }));
    setHabits((prev) => [...newHabits, ...prev]);
    showToast(`${packHabits.length} kebiasaan dari template berhasil ditambahkan!`);
  };

  // Delete habit
  const handleDeleteHabit = (habitId: string) => {
    const target = habits.find((h) => h.id === habitId);
    if (window.confirm(`Hapus kebiasaan "${target?.title || ''}"?`)) {
      setHabits((prev) => prev.filter((h) => h.id !== habitId));
      showToast('Kebiasaan dihapus');
    }
  };

  // Export JSON
  const handleExportData = () => {
    try {
      const dataStr =
        'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(habits, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', `pelacak-kebiasaan-${todayStr}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      showToast('Cadangan data berhasil diunduh');
    } catch (e) {
      console.error(e);
      showToast('Gagal mengunduh cadangan');
    }
  };

  // Import JSON
  const handleImportTrigger = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const content = ev.target?.result as string;
        const parsed = JSON.parse(content);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setHabits(parsed);
          showToast(`${parsed.length} kebiasaan berhasil dipulihkan`);
        } else {
          showToast('Berkas tidak valid');
        }
      } catch {
        showToast('Gagal membaca berkas JSON');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Reset to default
  const handleResetDefault = () => {
    if (window.confirm('Kembalikan kebiasaan bawaan? Data saat ini akan digantikan.')) {
      setHabits(INITIAL_HABITS);
      showToast('Data dikembalikan ke default');
    }
  };

  // Daily backup actions
  const handleCreateManualBackup = () => {
    saveDailyBackup(habits, true);
    setDailyBackups(getDailyBackups());
    showToast('Titik cadangan berhasil disimpan');
  };

  const handleRestoreDailyBackup = (backup: DailyBackup) => {
    if (Array.isArray(backup.habits) && backup.habits.length > 0) {
      setHabits(backup.habits);
      showToast(`Data dipulihkan dari cadangan ${backup.dateStr} (${backup.timeStr})`);
    } else {
      showToast('Cadangan tidak valid');
    }
  };

  const handleDeleteDailyBackup = (backupId: string) => {
    const updated = deleteDailyBackup(backupId);
    setDailyBackups(updated);
    showToast('Cadangan dihapus');
  };

  const currentHour = new Date().getHours();
  const isEvening = currentHour >= 17 || currentHour < 5;

  return (
    <div className={`min-h-screen font-sans antialiased text-stone-900 transition-colors ${isDark ? 'dark bg-[#141413] text-[#f4f4f1]' : 'bg-stone-50'}`}>
      {/* Dynamic Theme: Warm Evening Overlay */}
      {isEvening && isDynamicThemeEnabled && (
        <div className="fixed inset-0 pointer-events-none z-50 bg-amber-500/[0.03] dark:bg-amber-900/[0.03] mix-blend-multiply dark:mix-blend-screen" />
      )}
      
      <AtRiskOverlay 
        isOpen={showAtRiskOverlay} 
        habits={atRiskHabits} 
        onClose={() => setShowAtRiskOverlay(false)} 
      />
      
      <PWAInstallBanner />

      {/* Mobile-First Centered Container */}
      <div className="flex justify-center w-full min-h-screen transition-colors">
        <div className="w-full max-w-md min-h-screen bg-[#f8f9fa] dark:bg-[#141413] flex flex-col relative pb-24 sm:shadow-[0_0_50px_rgba(0,0,0,0.03)] dark:sm:shadow-[0_0_50px_rgba(0,0,0,0.3)] transition-colors">
          {/* Hidden File Input for import */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".json"
          className="hidden"
        />

        {/* Top Header with Date Scroller & Notification Bell */}
        <MobileHeader
          selectedDateStr={selectedDateStr}
          onSelectDate={setSelectedDateStr}
          weekDays={headerDays}
          habits={habits}
          onOpenAddModal={() => {
            setEditingHabit(null);
            setIsModalOpen(true);
          }}
          onOpenNotificationCenter={() => setIsNotificationCenterOpen(true)}
          pendingCount={pendingHabitsToday.length}
          isDarkMode={isDark}
          onToggleTheme={handleToggleTheme}
        />

        {/* Main Body View based on activeTab */}
        <div className="flex-1 px-4 pt-1 pb-6 space-y-3.5">
          <Suspense fallback={
            <div className="flex items-center justify-center h-48">
              <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          }>
            {activeTab === 'tracker' && (
              <TodayView
                habits={habits}
                selectedDateStr={selectedDateStr}
                moodMap={moodMap}
                setMoodMap={setMoodMap}
                onToggleDate={(id) => handleToggleDate(id, selectedDateStr)}
                onUpdateCounter={handleUpdateCounter}
                onSaveNote={handleSaveNote}
                onEditHabit={(h) => {
                  setEditingHabit(h);
                  setPreselectedParentHabitId(undefined);
                  setIsModalOpen(true);
                }}
                onDeleteHabit={handleDeleteHabit}
                onToggleRestDay={handleToggleRestDay}
                onShareHabit={(h) => setShareHabit(h)}
                onOpenPackModal={() => setIsPackModalOpen(true)}
                onAddManual={(parentHabit) => {
                  setEditingHabit(null);
                  setPreselectedParentHabitId(parentHabit?.id);
                  setIsModalOpen(true);
                }}
                onStartTimer={setTimerHabit}
                showToast={showToast}
              />
            )}

            {activeTab === 'matrix' && (
              <WeeklyOverview
                habits={habits}
                weekDays={weeklyDays}
                onToggleDate={(id, date) => handleToggleDate(id, date)}
              />
            )}

            {activeTab === 'stats' && (
              <StatsView
                habits={habits}
                onSelectDate={(dateStr) => {
                  setSelectedDateStr(dateStr);
                  setActiveTab('tracker');
                  showToast(`Melihat tanggal ${dateStr}`);
                }}
                moodMap={moodMap}
              />
            )}

            {activeTab === 'settings' && (
              <SettingsView
                soundEnabled={soundEnabled}
                setSoundEnabled={setSoundEnabled}
                reminderSettings={reminderSettings}
                onUpdateReminderSettings={setReminderSettings}
                notificationPermission={notificationPermission}
                onRequestSystemPermission={handleRequestSystemPermission}
                onTriggerSystemTest={handleTriggerSystemTest}
                onExport={handleExportData}
                onImport={handleImportTrigger}
                onReset={handleResetDefault}
                habitsCount={habits.length}
                themeMode={themeMode}
                setThemeMode={setThemeMode}
                isDynamicThemeEnabled={isDynamicThemeEnabled}
                setIsDynamicThemeEnabled={setIsDynamicThemeEnabled}
                dailyBackups={dailyBackups}
                onCreateManualBackup={handleCreateManualBackup}
                onRestoreDailyBackup={handleRestoreDailyBackup}
                onDeleteDailyBackup={handleDeleteDailyBackup}
              />
            )}
          </Suspense>
        </div>

          {/* Tab Navigation */}
        <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* In-App Notification Center Drawer / Modal */}
        <InAppNotificationCenter
          isOpen={isNotificationCenterOpen}
          onClose={() => setIsNotificationCenterOpen(false)}
          pendingHabits={pendingHabitsToday}
          allHabitsCount={habits.length}
          onToggleHabit={(id) => handleToggleDate(id, todayStr)}
          onTriggerSystemTest={handleTriggerSystemTest}
          systemNotificationGranted={notificationPermission === 'granted'}
          onRequestSystemPermission={handleRequestSystemPermission}
        />

        {/* Toast Alert (Zero emojis, clean SVG) */}
        {toastMessage && (
          <div className="fixed bottom-16 left-1/2 -translate-x-1/2 z-50 pointer-events-none max-w-xs w-full px-4">
            <div className="bg-stone-900 dark:bg-[#252522] dark:border dark:border-[#33332f] text-white text-xs font-medium px-3.5 py-2.5 rounded-xl shadow-lg flex items-center gap-2 justify-center">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="truncate">{toastMessage}</span>
            </div>
          </div>
        )}

        {/* Habit Modal (Bottom Sheet on Mobile) */}
        <HabitModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingHabit(null);
            setPreselectedParentHabitId(undefined);
          }}
          onSave={handleSaveHabit}
          editingHabit={editingHabit}
          existingHabits={habits}
          preselectedParentHabitId={preselectedParentHabitId}
        />

        {/* Share Achievement Modal */}
        <Suspense fallback={null}>
          <ShareAchievementModal
            habit={shareHabit}
            onClose={() => setShareHabit(null)}
          />
        </Suspense>

        {/* Habit Pack Modal */}
        <Suspense fallback={null}>
          <HabitPackModal
            isOpen={isPackModalOpen}
            onClose={() => setIsPackModalOpen(false)}
            onImportHabits={handleImportHabitsFromPack}
          />
        </Suspense>

        {/* Focus Timer Modal */}
        <Suspense fallback={null}>
          <FocusTimerModal
            isOpen={!!timerHabit}
            habit={timerHabit}
            onClose={() => setTimerHabit(null)}
            onComplete={(habitId) => {
              // Mark habit as complete
              handleToggleDate(habitId, selectedDateStr);
              setTimerHabit(null);
              showToast('Sesi Fokus Selesai! Kebiasaan ditandai tuntas.');
            }}
          />
        </Suspense>
      </div>
      
      {showTutorial && (
        <Suspense fallback={null}>
          <OnboardingTutorial onComplete={handleTutorialComplete} />
        </Suspense>
      )}
      </div>
    </div>
  );
}
