import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Check, RotateCcw, Sparkles, Calendar, Bell, Moon, Sun } from 'lucide-react';
import { DayStatus, Habit } from '../types';
import { formatIndonesianDate, getTodayStr, isHabitScheduledForDate } from '../utils/dateUtils';
import { AppLogo } from './AppLogo';

interface MobileHeaderProps {
  selectedDateStr: string;
  onSelectDate: (dateStr: string) => void;
  weekDays: (DayStatus & { isFuture: boolean })[];
  habits: Habit[];
  onOpenAddModal: () => void;
  onOpenNotificationCenter: () => void;
  pendingCount: number;
  isDarkMode?: boolean;
  onToggleTheme?: () => void;
}

export const MobileHeader: React.FC<MobileHeaderProps> = ({
  selectedDateStr,
  onSelectDate,
  weekDays,
  habits,
  onOpenAddModal,
  onOpenNotificationCenter,
  pendingCount,
  isDarkMode = false,
  onToggleTheme,
}) => {
  const todayStr = getTodayStr();
  const isSelectedToday = selectedDateStr === todayStr;

  // Calculate completion for selected date
  const selectedStats = React.useMemo(() => {
    let scheduled = 0;
    let completed = 0;

    habits.forEach((h) => {
      if (isHabitScheduledForDate(selectedDateStr, h.frequency)) {
        scheduled++;
        if (h.completedDates.includes(selectedDateStr)) {
          completed++;
        }
      }
    });

    const percent = scheduled > 0 ? Math.round((completed / scheduled) * 100) : 0;
    return { scheduled, completed, percent };
  }, [habits, selectedDateStr]);

  return (
    <div className="bg-white dark:bg-[#1c1c1a] border-b border-stone-100/80 dark:border-[#282825] px-5 pt-5 pb-3 transition-colors">
      {/* Top Row: App Title & Clean Minimalist Action Buttons */}
      <div className="flex items-center justify-between gap-3 mb-3.5">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider mb-0.5">
            <Calendar className="w-3.5 h-3.5 text-stone-400 dark:text-stone-500 shrink-0" />
            <span className="truncate">
              {isSelectedToday
                ? 'Hari Ini'
                : formatIndonesianDate(selectedDateStr, true)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <AppLogo size={28} className="rounded-lg shrink-0" />
            <div className="flex flex-col">
              <h1 className="text-xl font-bold text-stone-900 dark:text-[#f4f4f1] tracking-tight leading-none">
                Rima Karsa
              </h1>
              <span className="text-[9px] text-emerald-600 dark:text-emerald-500 font-bold tracking-[0.18em] uppercase mt-1">
                Make It a Rhythm
              </span>
            </div>
          </div>
        </div>

        {/* Clean, Minimalist Action Area */}
        <div className="flex items-center gap-2 shrink-0">
          <AnimatePresence>
            {!isSelectedToday && (
              <motion.button
                key="jump-to-today"
                initial={{ opacity: 0, scale: 0.85, x: 8 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.85, x: 8 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                whileTap={{ scale: 0.92 }}
                onClick={() => onSelectDate(todayStr)}
                className="h-9 px-2.5 sm:px-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200/80 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 active:scale-95 text-xs font-semibold shadow-2xs inline-flex items-center gap-1.5 whitespace-nowrap transition"
                title="Lompat ke Hari Ini"
                aria-label="Lompat ke Hari Ini"
              >
                <RotateCcw className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>Hari Ini</span>
              </motion.button>
            )}
          </AnimatePresence>

          <button
            onClick={onOpenNotificationCenter}
            className="w-9 h-9 rounded-xl bg-stone-100/80 dark:bg-[#252522] text-stone-700 dark:text-stone-300 hover:bg-stone-200/70 dark:hover:bg-[#2e2e2a] active:scale-95 flex items-center justify-center transition relative"
            aria-label="Pengingat Aktivitas"
            title="Pengingat Aktivitas"
          >
            <Bell className="w-4 h-4" />
            {pendingCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center shadow-xs">
                {pendingCount > 9 ? '9+' : pendingCount}
              </span>
            )}
          </button>

          <button
            onClick={onOpenAddModal}
            className="w-9 h-9 rounded-xl bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 hover:bg-stone-800 dark:hover:bg-white active:scale-95 flex items-center justify-center transition shadow-xs"
            aria-label="Tambah Kebiasaan"
            title="Tambah Kebiasaan"
          >
            <Plus className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>
      </div>

      {/* Progress Bar (Seamless line) */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-xs mb-1.5">
          <span className="text-stone-600 dark:text-stone-400 font-medium">
            {selectedStats.completed} dari {selectedStats.scheduled} kebiasaan tuntas
          </span>
          <span className="font-semibold text-stone-900 dark:text-[#f4f4f1] tabular-nums">
            {selectedStats.percent}%
          </span>
        </div>
        <div className="w-full h-1.5 bg-stone-100 dark:bg-[#272724] rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald-600 dark:bg-emerald-500 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${selectedStats.percent}%` }}
          />
        </div>
      </div>

      {/* Scrollable Date Strip */}
      <div className="flex overflow-x-auto gap-2 pb-1.5 -mx-5 px-5 snap-x [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {weekDays.map((day) => {
          const isSelected = day.dateStr === selectedDateStr;
          const isToday = day.dateStr === todayStr;

          // Check how many habits completed on that day
          let dayDoneCount = 0;
          let dayScheduled = 0;
          habits.forEach((h) => {
            if (isHabitScheduledForDate(day.dateStr, h.frequency)) {
              dayScheduled++;
              if (h.completedDates.includes(day.dateStr)) {
                dayDoneCount++;
              }
            }
          });
          const allDone = dayScheduled > 0 && dayDoneCount === dayScheduled;
          const someDone = dayDoneCount > 0 && !allDone;

          return (
            <button
              key={day.dateStr}
              onClick={() => onSelectDate(day.dateStr)}
              className={`shrink-0 w-[44px] sm:w-[48px] py-2 px-1 rounded-2xl transition-all flex flex-col items-center justify-center snap-center relative ${
                isSelected
                  ? 'bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 shadow-xs'
                  : isToday
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-300 font-semibold'
                  : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100/70 dark:hover:bg-[#272724]'
              }`}
            >
              <span className={`text-[10px] uppercase font-medium ${isSelected ? 'text-stone-300 dark:text-stone-600' : 'text-stone-500 dark:text-stone-400'}`}>
                {day.dayName}
              </span>
              <span className="text-sm font-bold my-0.5">
                {day.dayNumber}
              </span>

              {/* Status indicator dot */}
              <div className="h-1 flex items-center justify-center">
                {allDone ? (
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      isSelected ? (isDarkMode ? 'bg-emerald-700' : 'bg-emerald-400') : 'bg-emerald-500'
                    }`}
                  />
                ) : someDone ? (
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      isSelected ? (isDarkMode ? 'bg-amber-700' : 'bg-amber-400') : 'bg-amber-500'
                    }`}
                  />
                ) : (
                  <span className="w-1.5 h-1.5" />
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
