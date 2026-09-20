import React from 'react';
import { Flame, CheckCircle, Target, Sparkles, TrendingUp } from 'lucide-react';

interface DailyProgressBarProps {
  completedCount: number;
  totalToday: number;
  percentage: number;
  bestStreakAllHabits: number;
  activeStreakAllHabits: number;
}

export const DailyProgressBar: React.FC<DailyProgressBarProps> = ({
  completedCount,
  totalToday,
  percentage,
  bestStreakAllHabits,
  activeStreakAllHabits,
}) => {
  // Motivational messages based on percentage
  const getMotivationMessage = () => {
    if (totalToday === 0) return 'Belum ada kebiasaan yang dijadwalkan hari ini.';
    if (percentage === 100) return 'Sempurna! Semua kebiasaan hari ini berhasil dituntaskan 🎉';
    if (percentage >= 75) return 'Hampir selesai! Tinggal sedikit lagi untuk mencapai 100% hari ini.';
    if (percentage >= 50) return 'Bagus sekali! Lebih dari setengah kebiasaan telah selesai.';
    if (percentage > 0) return 'Langkah awal yang solid! Pertahankan momentum positif ini.';
    return 'Awali harimu dengan menyelesaikan satu kebiasaan kecil sekarang.';
  };

  return (
    <div className="bg-white dark:bg-[#1c1c1a] rounded-2xl border border-stone-200/90 dark:border-[#282825] p-5 sm:p-6 shadow-xs transition-colors">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-0.5 rounded-md border border-emerald-200/60 dark:border-emerald-900/40">
              Progres Hari Ini
            </span>
            <span className="text-xs text-stone-500 dark:text-stone-400 font-medium">
              {completedCount} dari {totalToday} selesai
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-stone-900 dark:text-[#f4f4f1] tracking-tight">
            {percentage}% Target Tercapai
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 mt-1 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
            <span>{getMotivationMessage()}</span>
          </p>
        </div>

        {/* Highlight Stats Badges */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3 shrink-0">
          <div className="bg-stone-50 dark:bg-[#252522] rounded-xl p-2.5 sm:p-3 border border-stone-200/70 dark:border-[#2e2e2a] text-center min-w-[84px]">
            <div className="flex items-center justify-center gap-1 text-emerald-600 dark:text-emerald-400 mb-0.5">
              <CheckCircle className="w-3.5 h-3.5" />
              <span className="text-sm sm:text-base font-bold text-stone-900 dark:text-[#f4f4f1] leading-none">
                {completedCount}
              </span>
            </div>
            <span className="text-[11px] font-medium text-stone-500 dark:text-stone-400 block">Selesai</span>
          </div>

          <div className="bg-stone-50 dark:bg-[#252522] rounded-xl p-2.5 sm:p-3 border border-stone-200/70 dark:border-[#2e2e2a] text-center min-w-[84px]">
            <div className="flex items-center justify-center gap-1 text-amber-600 dark:text-amber-400 mb-0.5">
              <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-600 dark:text-amber-400" />
              <span className="text-sm sm:text-base font-bold text-stone-900 dark:text-[#f4f4f1] leading-none">
                {activeStreakAllHabits}
              </span>
            </div>
            <span className="text-[11px] font-medium text-stone-500 dark:text-stone-400 block">Streak Aktif</span>
          </div>

          <div className="bg-stone-50 dark:bg-[#252522] rounded-xl p-2.5 sm:p-3 border border-stone-200/70 dark:border-[#2e2e2a] text-center min-w-[84px]">
            <div className="flex items-center justify-center gap-1 text-indigo-600 dark:text-indigo-400 mb-0.5">
              <TrendingUp className="w-3.5 h-3.5" />
              <span className="text-sm sm:text-base font-bold text-stone-900 dark:text-[#f4f4f1] leading-none">
                {bestStreakAllHabits}
              </span>
            </div>
            <span className="text-[11px] font-medium text-stone-500 dark:text-stone-400 block">Rekor Hari</span>
          </div>
        </div>
      </div>

      {/* Visual Progress Bar */}
      <div className="relative w-full h-3 bg-stone-100 dark:bg-[#282825] rounded-full overflow-hidden">
        <div
          className="h-full bg-emerald-500 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};
