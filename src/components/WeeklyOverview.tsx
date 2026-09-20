import React from 'react';
import { Check, Calendar } from 'lucide-react';
import { Habit, DayStatus } from '../types';
import { HabitIcon } from './HabitIcon';
import { formatIndonesianDate, isHabitScheduledForDate } from '../utils/dateUtils';

interface WeeklyOverviewProps {
  habits: Habit[];
  weekDays: (DayStatus & { isFuture: boolean })[];
  onToggleDate: (habitId: string, dateStr: string) => void;
}

export const WeeklyOverview: React.FC<WeeklyOverviewProps> = ({
  habits,
  weekDays,
  onToggleDate,
}) => {
  if (habits.length === 0) {
    return null;
  }

  // Calculate day completion percentage
  const dayStats = weekDays.map((day) => {
    let scheduled = 0;
    let completed = 0;

    habits.forEach((h) => {
      if (isHabitScheduledForDate(day.dateStr, h.frequency)) {
        scheduled++;
        if (h.completedDates.includes(day.dateStr)) {
          completed++;
        }
      }
    });

    const percent = scheduled > 0 ? Math.round((completed / scheduled) * 100) : 0;
    return { ...day, scheduled, completed, percent };
  });

  return (
    <div className="bg-white dark:bg-[#1c1c1a] rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.03)] dark:shadow-none dark:border dark:border-[#282825] overflow-hidden transition-colors">
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <div>
            <h2 className="text-sm font-bold text-stone-900 dark:text-[#f4f4f1]">
              Matriks Mingguan (7 Hari Terakhir)
            </h2>
            <p className="text-[11px] text-stone-400 dark:text-stone-500">
              Urutan dari hari ini (terbaru) ke hari sebelumnya
            </p>
          </div>
        </div>
        <span className="text-[11px] text-stone-500 dark:text-stone-400 hidden sm:inline">
          Ketuk tanggal untuk ubah status
        </span>
      </div>

      <div className="w-full">
        <table className="w-full text-left border-collapse table-fixed">
          <thead>
            <tr className="bg-stone-50/70 dark:bg-[#252522] text-xs text-stone-600 dark:text-stone-400">
              <th className="py-2.5 px-3 font-semibold w-[36%] sm:w-[32%]">Kebiasaan</th>
              {dayStats.map((d) => (
                <th
                  key={d.dateStr}
                  className={`py-2 px-0.5 text-center font-medium ${
                    d.isToday ? 'bg-emerald-50/90 dark:bg-emerald-950/50 text-emerald-900 dark:text-emerald-300 font-bold' : ''
                  }`}
                >
                  <div className="text-[10px] uppercase text-stone-500 dark:text-stone-400">
                    {d.isToday ? 'Hari Ini' : d.dayName}
                  </div>
                  <div className="text-xs">{d.dayNumber}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100 dark:divide-[#282825] text-xs">
            {habits.map((habit) => {
              return (
                <tr key={habit.id} className="hover:bg-stone-50/50 dark:hover:bg-[#252522]/50 transition-colors">
                  <td className="py-2.5 px-3 truncate">
                    <div className="flex items-center gap-2 min-w-0">
                      <div
                        className="w-6 h-6 rounded-md flex items-center justify-center shrink-0"
                        style={{ backgroundColor: `${habit.color}15`, color: habit.color }}
                      >
                        <HabitIcon name={habit.icon} className="w-3.5 h-3.5" />
                      </div>
                      <span className="font-medium text-stone-900 dark:text-[#f4f4f1] truncate text-[11px] sm:text-xs">
                        {habit.title}
                      </span>
                    </div>
                  </td>

                  {weekDays.map((day) => {
                    const isDone = habit.completedDates.includes(day.dateStr);
                    const isScheduled = isHabitScheduledForDate(day.dateStr, habit.frequency);

                    return (
                      <td
                        key={day.dateStr}
                        className={`py-2 px-0.5 text-center ${
                          day.isToday ? 'bg-emerald-50/30 dark:bg-emerald-950/20' : ''
                        }`}
                      >
                        <button
                          onClick={() => onToggleDate(habit.id, day.dateStr)}
                          className={`w-6 h-6 mx-auto rounded-md flex items-center justify-center transition-all ${
                            isDone
                              ? 'text-white shadow-2xs'
                              : isScheduled
                              ? 'bg-stone-100 dark:bg-[#282825] text-stone-300 dark:text-stone-600 hover:bg-stone-200 dark:hover:bg-[#33332f]'
                              : 'bg-stone-50 dark:bg-[#1f1f1d] text-stone-200 dark:text-stone-700'
                          }`}
                          style={{
                            backgroundColor: isDone ? habit.color : undefined,
                          }}
                          title={`${habit.title} - ${formatIndonesianDate(day.dateStr)}`}
                          aria-label={`Status ${habit.title}`}
                        >
                          {isDone && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
