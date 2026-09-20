import React, { useState, useMemo } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Filter,
  Flame,
  CheckCircle2,
  Info,
  CalendarDays,
} from 'lucide-react';
import { Habit } from '../types';
import {
  formatDateStr,
  formatIndonesianDate,
  INDONESIAN_MONTHS,
  INDONESIAN_DAYS_SHORT,
  isHabitScheduledForDate,
  getTodayStr,
  parseDateStr,
} from '../utils/dateUtils';
import { HeatmapLegend } from './habit/HeatmapLegend';

interface HabitContributionHeatmapProps {
  habits: Habit[];
  onSelectDate?: (dateStr: string) => void;
}

type ViewRange = 'monthly' | 'yearly';

interface HeatmapDay {
  dateStr: string;
  dateObj: Date;
  dayOfWeek: number; // 0 Sunday, 1 Monday, ...
  isCurrentMonth: boolean;
  scheduled: number;
  completed: number;
  rate: number; // 0 to 1
  isToday: boolean;
  isFuture: boolean;
}

export const HabitContributionHeatmap: React.FC<HabitContributionHeatmapProps> = ({
  habits,
  onSelectDate,
}) => {
  const todayStr = getTodayStr();
  const today = useMemo(() => parseDateStr(todayStr), [todayStr]);

  // Selected view range: monthly or yearly
  const [viewRange, setViewRange] = useState<ViewRange>('monthly');

  // Filter by single habit or all habits
  const [selectedHabitId, setSelectedHabitId] = useState<string>('all');

  // Current month & year navigation state
  const [navDate, setNavDate] = useState<Date>(() => {
    const d = new Date();
    d.setDate(1);
    d.setHours(0, 0, 0, 0);
    return d;
  });

  // Selected cell hover/click detail
  const [activeHoverDay, setActiveHoverDay] = useState<HeatmapDay | null>(null);

  // Filtered habits list
  const activeHabits = useMemo(() => {
    if (selectedHabitId === 'all') return habits;
    return habits.filter((h) => h.id === selectedHabitId);
  }, [habits, selectedHabitId]);

  const selectedHabitObject = useMemo(() => {
    return habits.find((h) => h.id === selectedHabitId);
  }, [habits, selectedHabitId]);

  // Navigation handlers
  const handlePrev = () => {
    setNavDate((prev) => {
      const next = new Date(prev);
      if (viewRange === 'monthly') {
        next.setMonth(next.getMonth() - 1);
      } else {
        next.setFullYear(next.getFullYear() - 1);
      }
      return next;
    });
  };

  const handleNext = () => {
    setNavDate((prev) => {
      const next = new Date(prev);
      if (viewRange === 'monthly') {
        next.setMonth(next.getMonth() + 1);
      } else {
        next.setFullYear(next.getFullYear() + 1);
      }
      return next;
    });
  };

  const handleResetToCurrent = () => {
    const d = new Date();
    d.setDate(1);
    d.setHours(0, 0, 0, 0);
    setNavDate(d);
  };

  // 1. MONTHLY VIEW: Full calendar matrix for the selected month
  const monthlyDays = useMemo<HeatmapDay[]>(() => {
    if (viewRange !== 'monthly') return [];

    const year = navDate.getFullYear();
    const month = navDate.getMonth();

    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const totalDaysInMonth = lastDayOfMonth.getDate();

    // Monday as start of week (0: Sen, 6: Min)
    let startDayOfWeek = firstDayOfMonth.getDay(); // 0 is Sunday
    const mondayShift = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1;

    const days: HeatmapDay[] = [];

    // Preceding padding days from previous month
    for (let i = mondayShift - 1; i >= 0; i--) {
      const padDate = new Date(year, month, -i);
      const dateStr = formatDateStr(padDate);
      days.push({
        dateStr,
        dateObj: padDate,
        dayOfWeek: padDate.getDay(),
        isCurrentMonth: false,
        scheduled: 0,
        completed: 0,
        rate: 0,
        isToday: dateStr === todayStr,
        isFuture: padDate.getTime() > today.getTime(),
      });
    }

    // Days in current month
    for (let dayNum = 1; dayNum <= totalDaysInMonth; dayNum++) {
      const curDate = new Date(year, month, dayNum);
      const dateStr = formatDateStr(curDate);
      const isFuture = curDate.getTime() > today.getTime();

      let scheduled = 0;
      let completed = 0;

      activeHabits.forEach((h) => {
        if (isHabitScheduledForDate(dateStr, h.frequency)) {
          scheduled++;
          if (h.completedDates.includes(dateStr)) {
            completed++;
          }
        }
      });

      const rate = scheduled > 0 ? completed / scheduled : 0;

      days.push({
        dateStr,
        dateObj: curDate,
        dayOfWeek: curDate.getDay(),
        isCurrentMonth: true,
        scheduled,
        completed,
        rate,
        isToday: dateStr === todayStr,
        isFuture,
      });
    }

    // Trailing padding days to fill 35 or 42 grid slots
    const totalCells = Math.ceil(days.length / 7) * 7;
    const trailingCount = totalCells - days.length;
    for (let i = 1; i <= trailingCount; i++) {
      const padDate = new Date(year, month + 1, i);
      const dateStr = formatDateStr(padDate);
      days.push({
        dateStr,
        dateObj: padDate,
        dayOfWeek: padDate.getDay(),
        isCurrentMonth: false,
        scheduled: 0,
        completed: 0,
        rate: 0,
        isToday: dateStr === todayStr,
        isFuture: padDate.getTime() > today.getTime(),
      });
    }

    return days;
  }, [navDate, viewRange, activeHabits, todayStr, today]);

  // 2. YEARLY VIEW: GitHub-Style 52-53 weeks contribution grid (columns = weeks, rows = Mon..Sun)
  const yearlyWeeks = useMemo<HeatmapDay[][]>(() => {
    if (viewRange !== 'yearly') return [];

    const targetYear = navDate.getFullYear();
    const startDate = new Date(targetYear, 0, 1);
    const endDate = new Date(targetYear, 11, 31);

    // Adjust start date to previous Monday to align rows
    const dayOfWeek = startDate.getDay(); // 0 is Sunday
    const startShift = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const cursor = new Date(startDate);
    cursor.setDate(startDate.getDate() + startShift);

    const weeks: HeatmapDay[][] = [];
    let currentWeek: HeatmapDay[] = [];

    while (cursor <= endDate || currentWeek.length > 0) {
      const dateStr = formatDateStr(cursor);
      const isFuture = cursor.getTime() > today.getTime();
      const inTargetYear = cursor.getFullYear() === targetYear;

      let scheduled = 0;
      let completed = 0;

      if (inTargetYear) {
        activeHabits.forEach((h) => {
          if (isHabitScheduledForDate(dateStr, h.frequency)) {
            scheduled++;
            if (h.completedDates.includes(dateStr)) {
              completed++;
            }
          }
        });
      }

      const rate = scheduled > 0 ? completed / scheduled : 0;

      currentWeek.push({
        dateStr,
        dateObj: new Date(cursor),
        dayOfWeek: cursor.getDay(),
        isCurrentMonth: inTargetYear,
        scheduled,
        completed,
        rate,
        isToday: dateStr === todayStr,
        isFuture,
      });

      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
        // If we crossed past end of year and finished a week, break
        if (cursor > endDate) break;
      }

      cursor.setDate(cursor.getDate() + 1);
    }

    return weeks;
  }, [navDate, viewRange, activeHabits, todayStr, today]);

  // Summary calculation for the active view
  const viewSummary = useMemo(() => {
    let totalScheduled = 0;
    let totalCompleted = 0;
    let daysRecorded = 0;

    const daysToCheck =
      viewRange === 'monthly'
        ? monthlyDays.filter((d) => d.isCurrentMonth && !d.isFuture)
        : yearlyWeeks.flat().filter((d) => d.isCurrentMonth && !d.isFuture);

    daysToCheck.forEach((d) => {
      if (d.scheduled > 0) {
        totalScheduled += d.scheduled;
        totalCompleted += d.completed;
        daysRecorded++;
      }
    });

    const completionRate = totalScheduled > 0 ? Math.round((totalCompleted / totalScheduled) * 100) : 0;
    return { totalScheduled, totalCompleted, completionRate, daysRecorded };
  }, [viewRange, monthlyDays, yearlyWeeks]);

  // Dynamic color levels for contribution heatmap
  const getCellColor = (day: HeatmapDay) => {
    if (!day.isCurrentMonth) {
      return 'bg-stone-50/50 dark:bg-[#1f1f1d]/40 text-stone-300 dark:text-stone-700 opacity-40';
    }
    if (day.isFuture) {
      return 'bg-stone-50 dark:bg-[#232320] text-stone-300 dark:text-stone-600 opacity-60';
    }
    if (day.scheduled === 0) {
      return 'bg-stone-100 dark:bg-[#252522] text-stone-400 dark:text-stone-500';
    }
    if (day.completed === 0) {
      return 'bg-stone-100 dark:bg-[#252522] text-stone-500 dark:text-stone-400 hover:ring-1 hover:ring-stone-300';
    }

    // If specific habit has custom color
    const customAccent = selectedHabitObject?.color;

    // Rate-based coloring
    if (day.rate === 1) {
      // 100% completed
      return customAccent
        ? 'text-white'
        : 'bg-emerald-600 dark:bg-emerald-500 text-white shadow-2xs';
    }
    if (day.rate >= 0.66) {
      return 'bg-emerald-500 dark:bg-emerald-600 text-white';
    }
    if (day.rate >= 0.33) {
      return 'bg-emerald-300 dark:bg-emerald-800 text-emerald-950 dark:text-emerald-100';
    }
    return 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-900 dark:text-emerald-200';
  };

  const getCustomStyle = (day: HeatmapDay) => {
    if (!selectedHabitObject || !day.isCurrentMonth || day.isFuture || day.completed === 0) {
      return undefined;
    }
    const color = selectedHabitObject.color;
    if (day.rate === 1) {
      return { backgroundColor: color, color: '#ffffff' };
    }
    if (day.rate >= 0.5) {
      return { backgroundColor: `${color}cc`, color: '#ffffff' };
    }
    return { backgroundColor: `${color}40` };
  };

  // Month labels for yearly horizontal scroll header
  const monthLabels = useMemo(() => {
    if (viewRange !== 'yearly') return [];
    return INDONESIAN_MONTHS.map((m, idx) => ({
      name: m.slice(0, 3),
      index: idx,
    }));
  }, [viewRange]);

  return (
    <div className="bg-white dark:bg-[#1c1c1a] p-4 rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.03)] dark:shadow-none dark:border dark:border-[#282825] transition-colors space-y-3.5">
      {/* Header & Controls */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 flex items-center justify-center">
              <CalendarDays className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-stone-900 dark:text-[#f4f4f1] flex items-center gap-1.5">
                Kalender Heatmap Kontribusi
                <span className="text-[10px] font-normal text-stone-400 dark:text-stone-500">
                  (GitHub Grid)
                </span>
              </h3>
              <p className="text-[11px] text-stone-500 dark:text-stone-400">
                Pantau konsistensi dan kepatuhan rutinitas sepanjang waktu
              </p>
            </div>
          </div>

          {/* Mode Switcher: Bulanan vs Tahunan */}
          <div className="flex items-center bg-stone-100 dark:bg-[#252522] p-0.5 rounded-xl text-[11px] font-medium">
            <button
              onClick={() => setViewRange('monthly')}
              className={`px-2.5 py-1 rounded-lg transition ${
                viewRange === 'monthly'
                  ? 'bg-white dark:bg-[#1c1c1a] text-stone-900 dark:text-[#f4f4f1] shadow-2xs font-semibold'
                  : 'text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200'
              }`}
            >
              Bulanan
            </button>
            <button
              onClick={() => setViewRange('yearly')}
              className={`px-2.5 py-1 rounded-lg transition ${
                viewRange === 'yearly'
                  ? 'bg-white dark:bg-[#1c1c1a] text-stone-900 dark:text-[#f4f4f1] shadow-2xs font-semibold'
                  : 'text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200'
              }`}
            >
              Tahunan
            </button>
          </div>
        </div>

        {/* Navigation & Filter Row */}
        <div className="flex items-center justify-between gap-2 pt-1 border-t border-stone-100 dark:border-[#282825]">
          {/* Month / Year navigator */}
          <div className="flex items-center gap-1">
            <button
              onClick={handlePrev}
              className="p-1 rounded-lg text-stone-500 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-[#272724] transition"
              aria-label="Periode sebelumnya"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="text-xs font-bold text-stone-800 dark:text-stone-200 min-w-[110px] text-center">
              {viewRange === 'monthly'
                ? `${INDONESIAN_MONTHS[navDate.getMonth()]} ${navDate.getFullYear()}`
                : `Tahun ${navDate.getFullYear()}`}
            </span>

            <button
              onClick={handleNext}
              className="p-1 rounded-lg text-stone-500 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-[#272724] transition"
              aria-label="Periode berikutnya"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            <button
              onClick={handleResetToCurrent}
              className="text-[10px] text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 ml-1 px-1.5 py-0.5 rounded bg-stone-50 dark:bg-[#242421]"
            >
              Hari Ini
            </button>
          </div>

          {/* Habit selector dropdown */}
          <div className="flex items-center gap-1 text-[11px]">
            <Filter className="w-3 h-3 text-stone-400" />
            <select
              value={selectedHabitId}
              onChange={(e) => setSelectedHabitId(e.target.value)}
              className="bg-stone-50 dark:bg-[#252522] border border-stone-200/60 dark:border-[#33332f] text-stone-700 dark:text-stone-300 rounded-lg px-2 py-1 text-[11px] font-medium outline-none cursor-pointer max-w-[140px] truncate"
            >
              <option value="all">Semua Kebiasaan</option>
              {habits.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.title}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Stats Mini Bar for the current view */}
      <div className="grid grid-cols-3 gap-2 py-2 px-3 bg-stone-50 dark:bg-[#242421] rounded-xl text-center">
        <div>
          <span className="text-[10px] text-stone-400 dark:text-stone-500 block">Kepatuhan</span>
          <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
            {viewSummary.completionRate}%
          </span>
        </div>
        <div>
          <span className="text-[10px] text-stone-400 dark:text-stone-500 block">Total Selesai</span>
          <span className="text-xs font-bold text-stone-800 dark:text-stone-200">
            {viewSummary.totalCompleted}
          </span>
        </div>
        <div>
          <span className="text-[10px] text-stone-400 dark:text-stone-500 block">Hari Tercatat</span>
          <span className="text-xs font-bold text-stone-800 dark:text-stone-200">
            {viewSummary.daysRecorded} Hari
          </span>
        </div>
      </div>

      {/* 1. MONTHLY VIEW CALENDAR */}
      {viewRange === 'monthly' && (
        <div className="space-y-1.5">
          {/* Weekday headers: Sen, Sel, Rab, Kam, Jum, Sab, Min */}
          <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-semibold text-stone-400 dark:text-stone-500 mb-1">
            {['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'].map((day) => (
              <span key={day}>{day}</span>
            ))}
          </div>

          {/* Grid Cells */}
          <div className="grid grid-cols-7 gap-1.5">
            {monthlyDays.map((day) => {
              const isSelected = activeHoverDay?.dateStr === day.dateStr;
              return (
                <button
                  key={day.dateStr}
                  onClick={() => {
                    setActiveHoverDay(day);
                    if (onSelectDate) onSelectDate(day.dateStr);
                  }}
                  onMouseEnter={() => setActiveHoverDay(day)}
                  style={getCustomStyle(day)}
                  className={`aspect-square rounded-lg flex flex-col items-center justify-center p-0.5 relative transition-all duration-150 ${getCellColor(
                    day
                  )} ${
                    day.isToday
                      ? 'ring-2 ring-stone-900 dark:ring-stone-100 font-bold'
                      : ''
                  } ${isSelected ? 'scale-105 shadow-md z-10' : ''}`}
                >
                  <span className="text-[10px]">{day.dateObj.getDate()}</span>
                  {day.scheduled > 0 && day.isCurrentMonth && !day.isFuture && (
                    <span className="text-[7px] leading-none opacity-85 font-mono">
                      {day.completed}/{day.scheduled}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. YEARLY VIEW (GitHub-Style Contribution Matrix) */}
      {viewRange === 'yearly' && (
        <div className="space-y-2">
          <div className="overflow-x-auto pb-2 -mx-1 px-1 scrollbar-thin">
            <div className="inline-block min-w-full">
              {/* GitHub Matrix Grid: 7 rows (Mon..Sun) by 53 columns (weeks) */}
              <div className="flex gap-1">
                {/* Row labels */}
                <div className="flex flex-col justify-between text-[8px] font-medium text-stone-400 dark:text-stone-500 pr-1 select-none">
                  <span>Sen</span>
                  <span>Rab</span>
                  <span>Jum</span>
                  <span>Min</span>
                </div>

                {/* Week Columns */}
                <div className="flex gap-[3px]">
                  {yearlyWeeks.map((week, wIdx) => (
                    <div key={wIdx} className="flex flex-col gap-[3px]">
                      {week.map((day) => {
                        const isSelected = activeHoverDay?.dateStr === day.dateStr;
                        return (
                          <button
                            key={day.dateStr}
                            onClick={() => {
                              setActiveHoverDay(day);
                              if (onSelectDate) onSelectDate(day.dateStr);
                            }}
                            onMouseEnter={() => setActiveHoverDay(day)}
                            style={getCustomStyle(day)}
                            className={`w-3 h-3 rounded-[2.5px] transition-transform ${getCellColor(
                              day
                            )} ${
                              day.isToday ? 'ring-1.5 ring-stone-900 dark:ring-stone-100' : ''
                            } ${isSelected ? 'scale-125 z-10' : ''}`}
                            title={`${formatIndonesianDate(day.dateStr)}: ${day.completed}/${
                              day.scheduled
                            } (${Math.round(day.rate * 100)}%)`}
                          />
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <p className="text-[10px] text-stone-400 dark:text-stone-500 text-right">
            Geser horizontal untuk melihat 52 minggu penuh
          </p>
        </div>
      )}

      {/* Active Day Detail Banner */}
      {activeHoverDay && (
        <div className="p-2.5 bg-stone-50 dark:bg-[#252522] rounded-xl flex items-center justify-between text-xs border border-stone-200/50 dark:border-transparent transition-all">
          <div>
            <div className="font-semibold text-stone-900 dark:text-[#f4f4f1]">
              {formatIndonesianDate(activeHoverDay.dateStr)}
            </div>
            <div className="text-[11px] text-stone-500 dark:text-stone-400">
              {activeHoverDay.isFuture ? (
                'Tanggal di masa depan'
              ) : activeHoverDay.scheduled > 0 ? (
                `${activeHoverDay.completed} dari ${activeHoverDay.scheduled} kebiasaan tuntas (${Math.round(
                  activeHoverDay.rate * 100
                )}%)`
              ) : (
                'Tidak ada jadwal kebiasaan pada tanggal ini'
              )}
            </div>
          </div>

          <div className="text-right">
            {activeHoverDay.rate === 1 && !activeHoverDay.isFuture && activeHoverDay.scheduled > 0 && (
              <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                Sempurna
              </span>
            )}
          </div>
        </div>
      )}

      {/* Color Scale Legend */}
      <HeatmapLegend />
    </div>
  );
};
