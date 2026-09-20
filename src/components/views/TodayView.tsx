import React, { useState, useMemo } from 'react';
import { Search, X, Workflow, LayoutList, AlertCircle } from 'lucide-react';
import { Habit, Category, MoodMap } from '../../types';
import { isHabitScheduledForDate, getRecentDays } from '../../utils/dateUtils';
import { CATEGORY_DETAILS } from '../../data/defaultHabits';
import { HabitCard } from '../HabitCard';
import { HabitStackTimelineView } from '../HabitStackTimelineView';
import { MotivationalQuote } from '../MotivationalQuote';
import { MoodTracker } from '../MoodTracker';
import { TrackerEmptyState } from './TrackerEmptyState';

interface TodayViewProps {
  habits: Habit[];
  selectedDateStr: string;
  moodMap: MoodMap;
  setMoodMap: React.Dispatch<React.SetStateAction<MoodMap>>;
  onToggleDate: (id: string, date: string) => void;
  onUpdateCounter: (id: string, date: string, count: number) => void;
  onSaveNote: (id: string, date: string, note: string) => void;
  onEditHabit: (h: Habit | null) => void;
  onDeleteHabit: (id: string) => void;
  onToggleRestDay: (id: string, date: string) => void;
  onShareHabit: (h: Habit | null) => void;
  onOpenPackModal: () => void;
  onAddManual: (parentHabit?: Habit) => void;
  onStartTimer: (h: Habit | null) => void;
  showToast: (msg: string) => void;
}

export const TodayView: React.FC<TodayViewProps> = ({
  habits,
  selectedDateStr,
  moodMap,
  setMoodMap,
  onToggleDate,
  onUpdateCounter,
  onSaveNote,
  onEditHabit,
  onDeleteHabit,
  onToggleRestDay,
  onShareHabit,
  onOpenPackModal,
  onAddManual,
  onStartTimer,
  showToast,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | 'all'>('all');
  const [completionFilter, setCompletionFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [trackerLayoutMode, setTrackerLayoutMode] = useState<'list' | 'stack'>('stack');

  const displayedHabits = useMemo(() => {
    return habits.filter((h) => {
      // Must be scheduled for selectedDateStr
      if (!isHabitScheduledForDate(selectedDateStr, h.frequency)) {
        return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = h.title.toLowerCase().includes(q);
        const matchDesc = h.description?.toLowerCase().includes(q);
        if (!matchTitle && !matchDesc) return false;
      }

      if (selectedCategory !== 'all' && h.category !== selectedCategory) {
        return false;
      }

      if (completionFilter !== 'all') {
        const isDone = h.completedDates.includes(selectedDateStr);
        if (completionFilter === 'completed' && !isDone) return false;
        if (completionFilter === 'pending' && isDone) return false;
      }

      return true;
    });
  }, [habits, selectedDateStr, searchQuery, selectedCategory, completionFilter]);

  const categories = Object.keys(CATEGORY_DETAILS) as Category[];

  return (
    <>
      {/* Clean Filter Controls */}
      <div className="space-y-2.5">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-stone-400 dark:text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari kebiasaan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-7 py-2 bg-white dark:bg-[#1c1c1a] border border-stone-100/80 dark:border-[#282825] rounded-xl text-xs text-stone-900 dark:text-[#f4f4f1] placeholder:text-stone-400 dark:placeholder:text-stone-500 focus:outline-none focus:ring-1 focus:ring-stone-300 dark:focus:ring-stone-600 shadow-[0_1px_2px_rgba(0,0,0,0.03)] dark:shadow-none transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 dark:text-stone-500 hover:text-stone-700 dark:hover:text-stone-300 p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          <div className="flex items-center bg-stone-200/60 dark:bg-[#252522] p-1 rounded-xl text-[11px] transition-colors">
            <button
              onClick={() => setCompletionFilter('all')}
              className={`px-2.5 py-1 rounded-lg font-medium transition ${
                completionFilter === 'all'
                  ? 'bg-white dark:bg-[#33332f] text-stone-900 dark:text-[#f4f4f1] shadow-2xs font-semibold'
                  : 'text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200'
              }`}
            >
              Semua
            </button>
            <button
              onClick={() => setCompletionFilter('pending')}
              className={`px-2.5 py-1 rounded-lg font-medium transition ${
                completionFilter === 'pending'
                  ? 'bg-white dark:bg-[#33332f] text-stone-900 dark:text-[#f4f4f1] shadow-2xs font-semibold'
                  : 'text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200'
              }`}
            >
              Belum
            </button>
            <button
              onClick={() => setCompletionFilter('completed')}
              className={`px-2.5 py-1 rounded-lg font-medium transition ${
                completionFilter === 'completed'
                  ? 'bg-white dark:bg-[#33332f] text-stone-900 dark:text-[#f4f4f1] shadow-2xs font-semibold'
                  : 'text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200'
              }`}
            >
              Selesai
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 text-xs scrollbar-none flex-1">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1.5 rounded-xl whitespace-nowrap text-[11px] font-medium transition ${
                selectedCategory === 'all'
                  ? 'bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 shadow-xs'
                  : 'bg-white dark:bg-[#1c1c1a] border border-stone-100/80 dark:border-[#282825] text-stone-600 dark:text-stone-300 hover:bg-stone-100/70 dark:hover:bg-[#252522] shadow-[0_1px_2px_rgba(0,0,0,0.02)] dark:shadow-none'
              }`}
            >
              Semua
            </button>
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat;
              const catInfo = CATEGORY_DETAILS[cat];
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(isSelected ? 'all' : cat)}
                  className={`px-3 py-1.5 rounded-xl whitespace-nowrap text-[11px] font-medium transition ${
                    isSelected
                      ? 'bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 shadow-xs'
                      : 'bg-white dark:bg-[#1c1c1a] border border-stone-100/80 dark:border-[#282825] text-stone-600 dark:text-stone-300 hover:bg-stone-100/70 dark:hover:bg-[#252522] shadow-[0_1px_2px_rgba(0,0,0,0.02)] dark:shadow-none'
                  }`}
                >
                  {catInfo.label}
                </button>
              );
            })}
          </div>

          <div className="flex items-center bg-stone-200/60 dark:bg-[#252522] p-0.5 rounded-xl text-[11px] shrink-0">
            <button
              type="button"
              onClick={() => setTrackerLayoutMode('stack')}
              className={`p-1.5 rounded-lg transition flex items-center gap-1 ${
                trackerLayoutMode === 'stack'
                  ? 'bg-white dark:bg-[#33332f] text-emerald-700 dark:text-emerald-400 shadow-2xs font-semibold'
                  : 'text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200'
              }`}
              title="Tampilan Alur Waktu & Habit Stacking"
            >
              <Workflow className="w-3.5 h-3.5" />
              <span className="hidden xs:inline text-[10px]">Alur</span>
            </button>
            <button
              type="button"
              onClick={() => setTrackerLayoutMode('list')}
              className={`p-1.5 rounded-lg transition flex items-center gap-1 ${
                trackerLayoutMode === 'list'
                  ? 'bg-white dark:bg-[#33332f] text-stone-900 dark:text-[#f4f4f1] shadow-2xs font-semibold'
                  : 'text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200'
              }`}
              title="Tampilan Daftar Ringkas"
            >
              <LayoutList className="w-3.5 h-3.5" />
              <span className="hidden xs:inline text-[10px]">Daftar</span>
            </button>
          </div>
        </div>
      </div>

      {displayedHabits.length === 0 ? (
        <TrackerEmptyState
          onOpenPackModal={onOpenPackModal}
          onAddManual={() => onAddManual()}
        />
      ) : trackerLayoutMode === 'stack' ? (
        <HabitStackTimelineView
          habits={displayedHabits}
          activeDateStr={selectedDateStr}
          onToggleDate={onToggleDate}
          onUpdateCounter={onUpdateCounter}
          onSaveNote={onSaveNote}
          onEdit={onEditHabit}
          onDelete={onDeleteHabit}
          onToggleRestDay={onToggleRestDay}
          onShare={onShareHabit}
          onCreateStackedHabit={(parent) => onAddManual(parent)}
        />
      ) : (
        <div className="space-y-3">
          {displayedHabits.map((habit) => {
            const parent = habit.stackParentHabitId
              ? habits.find((h) => h.id === habit.stackParentHabitId)
              : undefined;
            return (
              <HabitCard
                key={habit.id}
                habit={habit}
                activeDateStr={selectedDateStr}
                onToggleDate={onToggleDate}
                onUpdateCounter={onUpdateCounter}
                onSaveNote={onSaveNote}
                onEdit={onEditHabit}
                onDelete={onDeleteHabit}
                onToggleRestDay={onToggleRestDay}
                onShare={onShareHabit}
                parentHabitTitle={parent?.title}
                onCreateStackedHabit={(parent) => onAddManual(parent)}
                onStartTimer={onStartTimer}
              />
            );
          })}
        </div>
      )}

      <div className="mt-8 mb-2">
        <MotivationalQuote
          habits={habits}
          yesterdayMood={moodMap[getRecentDays(2)[1]?.dateStr] || 'neutral'}
        />
      </div>

      <div className="mt-2">
        <MoodTracker
          currentMood={moodMap[selectedDateStr]}
          onSelectMood={(val) => {
            setMoodMap((prev) => ({ ...prev, [selectedDateStr]: val }));
            showToast('Suasana hati dicatat!');
          }}
        />
      </div>
    </>
  );
};
