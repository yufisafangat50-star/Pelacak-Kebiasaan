import React from 'react';
import {
  Clock,
  Sunrise,
  Sun,
  Sunset,
  Moon,
  Link as LinkIcon,
} from 'lucide-react';
import { Habit, TimeOfDay } from '../types';
import { HabitCard } from './HabitCard';

interface HabitStackTimelineViewProps {
  habits: Habit[];
  activeDateStr: string;
  onToggleDate: (habitId: string, dateStr: string) => void;
  onUpdateCounter: (habitId: string, dateStr: string, newCount: number) => void;
  onSaveNote: (habitId: string, dateStr: string, note: string) => void;
  onEdit: (habit: Habit) => void;
  onDelete: (habitId: string) => void;
  onCreateStackedHabit?: (parentHabit: Habit) => void;
  onToggleRestDay?: (habitId: string, dateStr: string) => void;
  onShare?: (habit: Habit) => void;
}

interface TimeSlotGroup {
  timeKey: TimeOfDay;
  title: string;
  timeRange: string;
  icon: React.ComponentType<{ className?: string }>;
  accentColor: string;
  bgSoft: string;
}

const TIME_SLOT_GROUPS: TimeSlotGroup[] = [
  {
    timeKey: 'pagi',
    title: 'Rutinitas Pagi',
    timeRange: '05:00 - 11:00',
    icon: Sunrise,
    accentColor: '#059669', // emerald
    bgSoft: 'bg-emerald-50/70 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400',
  },
  {
    timeKey: 'siang',
    title: 'Rutinitas Siang',
    timeRange: '11:00 - 15:00',
    icon: Sun,
    accentColor: '#d97706', // amber
    bgSoft: 'bg-amber-50/70 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400',
  },
  {
    timeKey: 'sore',
    title: 'Rutinitas Sore',
    timeRange: '15:00 - 18:30',
    icon: Sunset,
    accentColor: '#ea580c', // orange
    bgSoft: 'bg-orange-50/70 dark:bg-orange-950/30 text-orange-700 dark:text-orange-400',
  },
  {
    timeKey: 'malam',
    title: 'Rutinitas Malam',
    timeRange: '18:30 - 23:00',
    icon: Moon,
    accentColor: '#4f46e5', // indigo
    bgSoft: 'bg-indigo-50/70 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-400',
  },
  {
    timeKey: 'anytime',
    title: 'Fleksibel / Kapan Saja',
    timeRange: 'Sepanjang Hari',
    icon: Clock,
    accentColor: '#0891b2', // cyan
    bgSoft: 'bg-cyan-50/70 dark:bg-cyan-950/30 text-cyan-700 dark:text-cyan-400',
  },
];

export const HabitStackTimelineView: React.FC<HabitStackTimelineViewProps> = ({
  habits,
  activeDateStr,
  onToggleDate,
  onUpdateCounter,
  onSaveNote,
  onEdit,
  onDelete,
  onCreateStackedHabit,
  onToggleRestDay,
  onShare,
}) => {
  // Build parent lookup map for fast cue resolution
  const habitMap = React.useMemo(() => {
    const map = new Map<string, Habit>();
    habits.forEach((h) => map.set(h.id, h));
    return map;
  }, [habits]);

  // Group habits by timeOfDay and organize into stacks (anchors -> children)
  const groupedSlots = React.useMemo(() => {
    return TIME_SLOT_GROUPS.map((slot) => {
      const slotHabits = habits.filter((h) => h.timeOfDay === slot.timeKey);
      
      // Separate root/anchor habits and chained stacked habits
      const anchors = slotHabits.filter((h) => !h.stackParentHabitId);
      const chained = slotHabits.filter((h) => !!h.stackParentHabitId);

      // Sort anchors by completed status (pending first, completed last) or creation
      anchors.sort((a, b) => {
        const aDone = a.completedDates.includes(activeDateStr) ? 1 : 0;
        const bDone = b.completedDates.includes(activeDateStr) ? 1 : 0;
        return aDone - bDone;
      });

      // Assemble ordered stack chains
      const orderedList: { habit: Habit; isStackedChild: boolean; parentTitle?: string }[] = [];

      anchors.forEach((anchor) => {
        orderedList.push({ habit: anchor, isStackedChild: false });

        // Find direct stacked children of this anchor
        const children = chained.filter((c) => c.stackParentHabitId === anchor.id);
        children.forEach((child) => {
          orderedList.push({
            habit: child,
            isStackedChild: true,
            parentTitle: anchor.title,
          });
        });
      });

      // Any orphaned chained habits whose parent is in another time slot or deleted
      const listedIds = new Set(orderedList.map((item) => item.habit.id));
      const remainingChained = slotHabits.filter((h) => !listedIds.has(h.id));
      remainingChained.forEach((rem) => {
        const parent = rem.stackParentHabitId ? habitMap.get(rem.stackParentHabitId) : undefined;
        orderedList.push({
          habit: rem,
          isStackedChild: !!rem.stackParentHabitId,
          parentTitle: parent?.title,
        });
      });

      const completedCount = slotHabits.filter((h) =>
        h.completedDates.includes(activeDateStr)
      ).length;

      return {
        ...slot,
        habitsCount: slotHabits.length,
        completedCount,
        progressPercent:
          slotHabits.length > 0
            ? Math.round((completedCount / slotHabits.length) * 100)
            : 0,
        items: orderedList,
      };
    }).filter((slot) => slot.habitsCount > 0);
  }, [habits, activeDateStr, habitMap]);

  return (
    <div className="space-y-6">
      {/* Timeline Sequence by Time Slot */}
      {groupedSlots.map((slot) => {
        const Icon = slot.icon;
        const isAllDone = slot.completedCount === slot.habitsCount && slot.habitsCount > 0;

        return (
          <div key={slot.timeKey} className="space-y-3 relative">
            {/* Slot Header Banner */}
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <div className={`w-7 h-7 rounded-xl flex items-center justify-center ${slot.bgSoft}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-stone-900 dark:text-[#f4f4f1] flex items-center gap-1.5">
                    {slot.title}
                    <span className="text-[10px] font-medium text-stone-400 dark:text-stone-500">
                      • {slot.timeRange}
                    </span>
                  </h3>
                </div>
              </div>

              {/* Progress pill */}
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-semibold text-stone-600 dark:text-stone-300 font-mono">
                  {slot.completedCount}/{slot.habitsCount}
                </span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                    isAllDone
                      ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                      : 'bg-stone-100 dark:bg-[#252522] text-stone-600 dark:text-stone-400'
                  }`}
                >
                  {slot.progressPercent}%
                </span>
              </div>
            </div>

            {/* Stacked Chain Items */}
            <div className="space-y-2.5 relative">
              {slot.items.map((item, idx) => {
                const habit = item.habit;
                const parentHabit = habit.stackParentHabitId ? habitMap.get(habit.stackParentHabitId) : undefined;
                const parentIsCompleted = parentHabit ? parentHabit.completedDates.includes(activeDateStr) : false;

                return (
                  <div key={habit.id} className="relative">
                    {/* Visual Connector Line if this is a stacked child */}
                    {item.isStackedChild && (
                      <div className="flex items-start pl-3 pb-2 -mt-1 group relative z-0">
                        {/* Clean minimal line */}
                        <div className="w-4 h-6 border-l-[1.5px] border-b-[1.5px] border-stone-300 dark:border-stone-700 rounded-bl-lg shrink-0 translate-x-3 -translate-y-2" />
                        
                        {/* Subtle Trigger Text */}
                        <div className="ml-5 mt-1 flex items-center gap-2">
                          <LinkIcon className={`w-3.5 h-3.5 shrink-0 ${parentIsCompleted ? 'text-emerald-500' : 'text-stone-400'}`} />
                          <span className="text-[11px] text-stone-500 dark:text-stone-400 truncate max-w-[200px] sm:max-w-xs">
                            {habit.triggerCue ? (
                              <span>Sesudah: <span className="font-medium text-stone-700 dark:text-stone-300">{habit.triggerCue}</span></span>
                            ) : (
                              <span>Sesudah: <span className="font-medium text-stone-700 dark:text-stone-300">{item.parentTitle || 'Rutinitas sebelumnya'}</span></span>
                            )}
                          </span>
                          
                          {parentIsCompleted && (
                            <div className="flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full text-[10px] font-medium">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                              Siap
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* The Habit Card */}
                    <div className={item.isStackedChild ? 'pl-4 sm:pl-5' : ''}>
                      <HabitCard
                        habit={habit}
                        activeDateStr={activeDateStr}
                        onToggleDate={onToggleDate}
                        onUpdateCounter={onUpdateCounter}
                        onSaveNote={onSaveNote}
                        onEdit={onEdit}
                        onDelete={onDelete}
                        onToggleRestDay={onToggleRestDay}
                        onShare={onShare}
                        parentHabitTitle={item.parentTitle}
                        onCreateStackedHabit={onCreateStackedHabit}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};
