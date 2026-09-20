import React, { useMemo } from 'react';
import { Flame, Award, CheckCircle2, TrendingUp, Calendar, Zap, PieChart, Smile } from 'lucide-react';
import { Habit, MoodMap } from '../types';
import { CATEGORY_DETAILS } from '../data/defaultHabits';
import { calculateHabitStreaks, formatIndonesianDate, formatDateStr, isHabitScheduledForDate } from '../utils/dateUtils';
import { HabitIcon } from './HabitIcon';
import { WeeklyTrendChart } from './WeeklyTrendChart';
import { HabitContributionHeatmap } from './HabitContributionHeatmap';

interface StatsViewProps {
  habits: Habit[];
  onSelectDate?: (dateStr: string) => void;
  moodMap?: MoodMap;
}

export const StatsView: React.FC<StatsViewProps> = ({ habits, onSelectDate, moodMap = {} }) => {
  // Past 28 days for consistency map
  const past28Days = useMemo(() => {
    const days = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 27; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateStr = formatDateStr(d);

      let scheduled = 0;
      let completed = 0;

      habits.forEach((h) => {
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
        dateObj: d,
        scheduled,
        completed,
        rate,
      });
    }
    return days;
  }, [habits]);

  // Calculate Mood Correlation
  const moodCorrelations = useMemo(() => {
    if (Object.keys(moodMap).length === 0) return [];
    
    return habits.map(h => {
      let totalMood = 0;
      let count = 0;
      h.completedDates.forEach(date => {
        if (moodMap[date]) {
          totalMood += moodMap[date];
          count++;
        }
      });
      return {
        habit: h,
        avgMood: count > 0 ? totalMood / count : 0,
        count
      };
    }).filter(c => c.count > 0).sort((a, b) => b.avgMood - a.avgMood).slice(0, 3);
  }, [habits, moodMap]);

  const totalAllTimeCompletions = habits.reduce(
    (acc, h) => acc + h.completedDates.length,
    0
  );

  const bestStreakOverall = habits.reduce((max, h) => {
    const { bestStreak } = calculateHabitStreaks(h.completedDates, h.frequency);
    return Math.max(max, bestStreak);
  }, 0);

  const activeStreaksCount = habits.filter((h) => {
    const { currentStreak } = calculateHabitStreaks(h.completedDates, h.frequency);
    return currentStreak > 0;
  }).length;

  const averageConsistency =
    past28Days.length > 0
      ? Math.round(
          (past28Days.reduce((sum, d) => sum + d.rate, 0) / past28Days.length) *
            100
        )
      : 0;

  // Category consistency stats
  const categoryStats = useMemo(() => {
    const stats: Record<string, { totalScheduled: number; totalDone: number }> = {};

    past28Days.forEach((day) => {
      habits.forEach((h) => {
        if (!stats[h.category]) {
          stats[h.category] = { totalScheduled: 0, totalDone: 0 };
        }
        if (isHabitScheduledForDate(day.dateStr, h.frequency)) {
          stats[h.category].totalScheduled++;
          if (h.completedDates.includes(day.dateStr)) {
            stats[h.category].totalDone++;
          }
        }
      });
    });

    return Object.entries(stats)
      .map(([catKey, data]) => {
        const rate =
          data.totalScheduled > 0
            ? Math.round((data.totalDone / data.totalScheduled) * 100)
            : 0;
        return {
          category: catKey,
          label: CATEGORY_DETAILS[catKey]?.label || catKey,
          color: CATEGORY_DETAILS[catKey]?.color || '#0ea5e9',
          rate,
          totalDone: data.totalDone,
          totalScheduled: data.totalScheduled,
        };
      })
      .sort((a, b) => b.rate - a.rate);
  }, [habits, past28Days]);

  // Habit leaderboard
  const habitLeaderboard = useMemo(() => {
    return [...habits]
      .map((h) => {
        const streakInfo = calculateHabitStreaks(h.completedDates, h.frequency);
        return {
          ...h,
          currentStreak: streakInfo.currentStreak,
          bestStreak: streakInfo.bestStreak,
        };
      })
      .sort((a, b) => b.currentStreak - a.currentStreak);
  }, [habits]);

  const getHeatmapClass = (rate: number, scheduled: number) => {
    if (scheduled === 0) return 'bg-stone-100 dark:bg-[#282825] text-stone-300 dark:text-stone-600';
    if (rate === 0) return 'bg-stone-100 dark:bg-[#282825] text-stone-400 dark:text-stone-500';
    if (rate < 0.35) return 'bg-emerald-200 dark:bg-emerald-900/60 text-emerald-900 dark:text-emerald-200';
    if (rate < 0.7) return 'bg-emerald-400 dark:bg-emerald-600 text-white';
    return 'bg-emerald-600 dark:bg-emerald-500 text-white';
  };

  return (
    <div className="space-y-4">
      {/* 2x2 Metric Grid */}
      <div className="grid grid-cols-2 gap-2.5">
        <div className="bg-white dark:bg-[#1c1c1a] p-4 rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.03)] dark:shadow-none dark:border dark:border-[#282825] transition-colors">
          <div className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-400 mb-1">
            <span>Total Tuntas</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="text-xl font-bold text-stone-900 dark:text-[#f4f4f1]">
            {totalAllTimeCompletions}
          </div>
          <span className="text-[10px] text-stone-400 dark:text-stone-500">Sepanjang masa</span>
        </div>

        <div className="bg-white dark:bg-[#1c1c1a] p-4 rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.03)] dark:shadow-none dark:border dark:border-[#282825] transition-colors">
          <div className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-400 mb-1">
            <span>Rekor Streak</span>
            <Flame className="w-4 h-4 fill-amber-500 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="text-xl font-bold text-stone-900 dark:text-[#f4f4f1]">
            {bestStreakOverall} Hari
          </div>
          <span className="text-[10px] text-stone-400 dark:text-stone-500">Terpanjang</span>
        </div>

        <div className="bg-white dark:bg-[#1c1c1a] p-4 rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.03)] dark:shadow-none dark:border dark:border-[#282825] transition-colors">
          <div className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-400 mb-1">
            <span>Streak Aktif</span>
            <Zap className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div className="text-xl font-bold text-stone-900 dark:text-[#f4f4f1]">
            {activeStreaksCount} / {habits.length}
          </div>
          <span className="text-[10px] text-stone-400 dark:text-stone-500">Kebiasaan berjalan</span>
        </div>

        <div className="bg-white dark:bg-[#1c1c1a] p-4 rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.03)] dark:shadow-none dark:border dark:border-[#282825] transition-colors">
          <div className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-400 mb-1">
            <span>Konsistensi 28H</span>
            <TrendingUp className="w-4 h-4 text-teal-600 dark:text-teal-400" />
          </div>
          <div className="text-xl font-bold text-stone-900 dark:text-[#f4f4f1]">
            {averageConsistency}%
          </div>
          <span className="text-[10px] text-stone-400 dark:text-stone-500">Rata-rata kepatuhan</span>
        </div>
      </div>

      {/* Weekly Completion Trend Chart (Bar & Line modes) */}
      <WeeklyTrendChart habits={habits} />

      {/* GitHub-Style Contribution Heatmap (Monthly & Yearly Grid) */}
      <HabitContributionHeatmap habits={habits} onSelectDate={onSelectDate} />

      {/* Mood Correlation Section */}
      {moodCorrelations.length > 0 && (
        <div className="bg-white dark:bg-[#1c1c1a] rounded-2xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.03)] dark:shadow-none dark:border dark:border-[#282825] transition-colors">
          <div className="flex items-center gap-2 mb-4">
            <Smile className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <h3 className="text-sm font-bold text-stone-900 dark:text-[#f4f4f1]">Peningkat Suasana Hati</h3>
          </div>
          <p className="text-xs text-stone-500 dark:text-stone-400 mb-4">
            Secara rata-rata, suasana hati Anda paling positif di hari Anda menyelesaikan kebiasaan ini:
          </p>
          <div className="space-y-3">
            {moodCorrelations.map(c => (
              <div key={c.habit.id} className="flex items-center justify-between p-3 bg-stone-50 dark:bg-[#252522] rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: `${c.habit.color}15`, color: c.habit.color }}>
                    <HabitIcon name={c.habit.icon} className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-semibold text-stone-900 dark:text-[#f4f4f1] truncate max-w-[150px] sm:max-w-xs">{c.habit.title}</span>
                </div>
                <div className="flex flex-col items-end shrink-0">
                  <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{c.avgMood.toFixed(1)} / 5</span>
                  <span className="text-[10px] text-stone-400">({c.count} hari)</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Category Performance */}
      <div className="bg-white dark:bg-[#1c1c1a] p-4 rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.03)] dark:shadow-none dark:border dark:border-[#282825] transition-colors">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5">
            <PieChart className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <h3 className="text-xs font-bold text-stone-900 dark:text-[#f4f4f1]">
              Performa per Kategori
            </h3>
          </div>
        </div>

        <div className="space-y-3">
          {categoryStats.map((item) => (
            <div key={item.category} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-stone-800 dark:text-stone-200">{item.label}</span>
                <span className="text-stone-500 dark:text-stone-400 font-semibold">{item.rate}%</span>
              </div>
              <div className="w-full h-1.5 bg-stone-100 dark:bg-[#282825] rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${item.rate}%`,
                    backgroundColor: item.color,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Habit Streak Rankings */}
      <div className="bg-white dark:bg-[#1c1c1a] p-4 rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.03)] dark:shadow-none dark:border dark:border-[#282825] transition-colors">
        <div className="flex items-center gap-1.5 mb-3">
          <Award className="w-4 h-4 text-amber-500" />
          <h3 className="text-xs font-bold text-stone-900 dark:text-[#f4f4f1]">
            Peringkat Streak Rutinitas
          </h3>
        </div>

        <div className="space-y-2">
          {habitLeaderboard.map((habit, index) => (
            <div
              key={habit.id}
              className="flex items-center justify-between py-1.5 text-xs border-b border-stone-50 dark:border-[#282825] last:border-0"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="w-4 font-bold text-stone-400 dark:text-stone-500 text-center">
                  {index + 1}
                </span>
                <div
                  className="w-6 h-6 rounded-md flex items-center justify-center shrink-0"
                  style={{ backgroundColor: `${habit.color}15`, color: habit.color }}
                >
                  <HabitIcon name={habit.icon} className="w-3.5 h-3.5" />
                </div>
                <span className="font-medium text-stone-900 dark:text-[#f4f4f1] truncate">
                  {habit.title}
                </span>
              </div>

              <div className="flex items-center gap-1 font-semibold text-stone-700 dark:text-stone-300 shrink-0">
                <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-600 dark:text-amber-400" />
                <span>{habit.currentStreak} Hari</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
