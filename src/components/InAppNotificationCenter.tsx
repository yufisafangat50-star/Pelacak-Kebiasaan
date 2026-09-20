import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import {
  Bell,
  X,
  Check,
  Clock,
  Send,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { Habit } from '../types';
import { HabitIcon } from './HabitIcon';
import { CATEGORY_DETAILS, TIME_OF_DAY_LABELS } from '../data/defaultHabits';
import { getTodayStr } from '../utils/dateUtils';
import { getCurrentTimeSlot } from '../utils/notificationService';
import { triggerHabitCompletionCelebration } from '../utils/celebration';

interface InAppNotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
  pendingHabits: Habit[];
  allHabitsCount: number;
  onToggleHabit: (habitId: string) => void;
  onTriggerSystemTest: () => void;
  systemNotificationGranted: boolean;
  onRequestSystemPermission: () => void;
}

export const InAppNotificationCenter: React.FC<InAppNotificationCenterProps> = ({
  isOpen,
  onClose,
  pendingHabits,
  allHabitsCount,
  onToggleHabit,
  onTriggerSystemTest,
  systemNotificationGranted,
  onRequestSystemPermission,
}) => {
  if (!isOpen) return null;

  const currentSlot = getCurrentTimeSlot();
  const currentSlotLabel = TIME_OF_DAY_LABELS[currentSlot]?.label || 'Sekarang';
  const completedTodayCount = allHabitsCount - pendingHabits.length;
  const percentDone = allHabitsCount > 0 ? Math.round((completedTodayCount / allHabitsCount) * 100) : 100;

  const sortedPendingHabits = useMemo(() => {
    return [...pendingHabits].sort((a, b) => {
      const getPriority = (h: Habit) => {
        if (h.timeOfDay === currentSlot) return 2;
        if (h.timeOfDay === 'anytime') return 1;
        return 0;
      };
      return getPriority(b) - getPriority(a);
    });
  }, [pendingHabits, currentSlot]);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-xs p-0 sm:p-4">
      <div className="fixed inset-0" onClick={onClose} />

      <div className="relative bg-white dark:bg-[#1c1c1a] border border-transparent dark:border-[#282825] w-full max-w-md rounded-t-3xl sm:rounded-2xl shadow-2xl max-h-[85vh] flex flex-col z-10 overflow-hidden transition-colors">
        {/* Mobile handle */}
        <div className="pt-3 pb-1 flex justify-center sm:hidden">
          <div className="w-10 h-1.5 bg-stone-300 dark:bg-[#33332f] rounded-full" />
        </div>

        {/* Header */}
        <div className="px-5 py-3 border-b border-stone-100 dark:border-[#282825] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-stone-900 dark:text-[#f4f4f1]">
                Pusat Pengingat Aktivitas
              </h3>
              <p className="text-[10px] text-stone-500 dark:text-stone-400">
                Waktu sekarang: <strong className="text-stone-700 dark:text-stone-200">{currentSlotLabel}</strong>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full text-stone-400 dark:text-stone-500 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-[#282825] flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 space-y-4 overflow-y-auto flex-1 text-xs">
          {/* Daily Progress Status */}
          <div className="bg-stone-50 dark:bg-[#252522] border border-stone-100/80 dark:border-[#2e2e2a] rounded-xl p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-stone-700 dark:text-stone-300">Progres Rutinitas Hari Ini</span>
              <span className="font-bold text-emerald-700 dark:text-emerald-400">
                {completedTodayCount} / {allHabitsCount} ({percentDone}%)
              </span>
            </div>
            <div className="w-full h-2 bg-stone-200 dark:bg-[#33332f] rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-600 rounded-full transition-all duration-300"
                style={{ width: `${percentDone}%` }}
              />
            </div>
          </div>

          {/* Pending Habits List */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-stone-900 dark:text-[#f4f4f1] flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Aktivitas Belum Selesai ({pendingHabits.length})</span>
              </span>
              <span className="text-[10px] text-stone-400 dark:text-stone-500">
                Ketuk centang untuk tuntaskan
              </span>
            </div>

            {pendingHabits.length === 0 ? (
              <div className="text-center py-6 bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-100/60 dark:border-emerald-900/40 rounded-xl text-emerald-800 dark:text-emerald-300 space-y-1">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 dark:text-emerald-400 mx-auto" />
                <p className="font-bold text-sm">Luar Biasa!</p>
                <p className="text-xs text-emerald-700 dark:text-emerald-300">
                  Semua kebiasaan terjadwal hari ini telah terselesaikan dengan baik.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {sortedPendingHabits.map((habit) => {
                  const catInfo = CATEGORY_DETAILS[habit.category] || CATEGORY_DETAILS.kesehatan;
                  const timeLabel = TIME_OF_DAY_LABELS[habit.timeOfDay]?.label || 'Kapan Saja';
                  const isCurrentTimeSlot = habit.timeOfDay === currentSlot;

                  return (
                    <div
                      key={habit.id}
                      className={`flex items-center justify-between p-2.5 rounded-xl border transition-all ${
                        isCurrentTimeSlot
                          ? 'bg-amber-50/70 dark:bg-amber-950/30 border-amber-200/70 dark:border-amber-900/50 shadow-2xs'
                          : 'bg-stone-50 dark:bg-[#252522] border-stone-100/80 dark:border-[#2e2e2a] hover:bg-stone-100/80 dark:hover:bg-[#2b2b27]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0 flex-1 pr-2">
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                          style={{
                            backgroundColor: `${habit.color}18`,
                            color: habit.color,
                          }}
                        >
                          <HabitIcon name={habit.icon} className="w-4 h-4" />
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="font-semibold text-stone-900 dark:text-[#f4f4f1] truncate">
                              {habit.title}
                            </span>
                            {isCurrentTimeSlot && (
                              <span className="text-[9px] px-1.5 py-0.2 bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-200 rounded font-semibold shrink-0">
                                Waktunya!
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-[10px] text-stone-500 dark:text-stone-400 mt-0.5">
                            <span className="text-stone-600 dark:text-stone-400">{catInfo.label}</span>
                            <span>•</span>
                            <span className="flex items-center gap-0.5">
                              <Clock className="w-2.5 h-2.5" />
                              {timeLabel}
                            </span>
                            {habit.habitType === 'counter' && habit.targetCount && (
                              <>
                                <span>•</span>
                                <span className="font-semibold text-stone-700 dark:text-stone-300">
                                  {habit.progressMap?.[getTodayStr()] || 0}/{habit.targetCount} {habit.unit || ''}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <motion.button
                        whileTap={{ scale: 0.85 }}
                        whileHover={{ scale: 1.05 }}
                        onClick={(e) => {
                          const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                          triggerHabitCompletionCelebration(
                            {
                              x: (rect.left + rect.width / 2) / window.innerWidth,
                              y: (rect.top + rect.height / 2) / window.innerHeight,
                            },
                            habit.color
                          );
                          onToggleHabit(habit.id);
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = habit.color;
                          e.currentTarget.style.color = '#ffffff';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = '';
                          e.currentTarget.style.color = '';
                        }}
                        className="w-8 h-8 rounded-xl bg-stone-100 dark:bg-[#1e1e1b] text-stone-400 dark:text-stone-400 flex items-center justify-center transition-colors duration-200 shadow-2xs shrink-0"
                        title="Tandai Selesai"
                        aria-label={`Selesaikan ${habit.title}`}
                      >
                        <Check className="w-4 h-4" />
                      </motion.button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* External / Outside-App Notifications Card */}
          <div className="bg-stone-50 dark:bg-[#252522] border border-stone-100/80 dark:border-[#2e2e2a] rounded-xl p-3 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-stone-900 dark:text-[#f4f4f1] flex items-center gap-1.5">
                <Send className="w-3.5 h-3.5 text-stone-700 dark:text-stone-300" />
                <span>Pengingat di Luar Aplikasi (Layar HP)</span>
              </span>
              <span
                className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                  systemNotificationGranted
                    ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                    : 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300'
                }`}
              >
                {systemNotificationGranted ? 'Izin Aktif' : 'Perlu Izin'}
              </span>
            </div>

            <p className="text-[11px] text-stone-500 dark:text-stone-400 leading-relaxed">
              Menerima pop-up notifikasi sistem di ponsel saat ada aktivitas yang belum dijalankan agar rutinitas tetap terjaga.
            </p>

            <div className="flex items-center gap-2 pt-1">
              {!systemNotificationGranted ? (
                <button
                  onClick={onRequestSystemPermission}
                  className="flex-1 py-1.5 bg-stone-900 dark:bg-stone-100 hover:bg-stone-800 dark:hover:bg-white text-white dark:text-stone-900 font-medium rounded-lg text-center transition"
                >
                  Izinkan Notifikasi HP
                </button>
              ) : (
                <button
                  onClick={onTriggerSystemTest}
                  className="flex-1 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-medium rounded-lg text-center transition shadow-2xs"
                >
                  Kirim Notifikasi Tes Sekarang
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-stone-100 dark:border-[#282825] bg-stone-50/50 dark:bg-[#1c1c1a] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-stone-900 dark:bg-stone-100 hover:bg-stone-800 dark:hover:bg-white text-white dark:text-stone-900 font-semibold rounded-xl text-xs transition"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
