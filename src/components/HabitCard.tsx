import React, { useState } from 'react';
import { motion, AnimatePresence, useMotionValue, useAnimation, PanInfo } from 'framer-motion';
import { Check, Flame, Clock, MoreHorizontal, FileText, X, MessageSquare, Link as LinkIcon } from 'lucide-react';
import { Habit } from '../types';
import { HabitIcon } from './HabitIcon';
import { CATEGORY_DETAILS, TIME_OF_DAY_LABELS } from '../data/defaultHabits';
import { calculateHabitStreaks } from '../utils/dateUtils';
import { triggerHabitCompletionCelebration } from '../utils/celebration';
import { triggerHaptic } from '../utils/haptics';
import { formatNumber } from '../utils/formatters';
import { HabitCardMenu } from './habit/HabitCardMenu';
import { HabitCardProgress } from './habit/HabitCardProgress';


interface HabitCardProps {
  habit: Habit;
  activeDateStr: string;
  onToggleDate: (habitId: string, dateStr: string) => void;
  onUpdateCounter: (habitId: string, dateStr: string, newCount: number) => void;
  onSaveNote: (habitId: string, dateStr: string, note: string) => void;
  onEdit: (habit: Habit) => void;
  onDelete: (habitId: string) => void;
  parentHabitTitle?: string;
  onCreateStackedHabit?: (parentHabit: Habit) => void;
  onToggleRestDay?: (habitId: string, dateStr: string) => void;
  onShare?: (habit: Habit) => void;
  onStartTimer?: (habit: Habit) => void;
}

export const HabitCard: React.FC<HabitCardProps> = ({
  habit,
  activeDateStr,
  onToggleDate,
  onUpdateCounter,
  onSaveNote,
  onEdit,
  onDelete,
  parentHabitTitle,
  onCreateStackedHabit,
  onToggleRestDay,
  onShare,
  onStartTimer,
}) => {
  const isCompleted = habit.completedDates.includes(activeDateStr);
  const isRestDay = habit.restDays?.includes(activeDateStr) || false;
  const currentCount = habit.progressMap?.[activeDateStr] || 0;
  const targetCount = habit.targetCount || 1;
  const progressPercent = Math.min(100, Math.round((currentCount / targetCount) * 100));
  const streak = calculateHabitStreaks(habit.completedDates, habit.frequency);
  const categoryInfo = CATEGORY_DETAILS[habit.category] || CATEGORY_DETAILS.kesehatan;
  const timeInfo = TIME_OF_DAY_LABELS[habit.timeOfDay] || TIME_OF_DAY_LABELS.anytime;

  const [showMenu, setShowMenu] = useState(false);
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [noteText, setNoteText] = useState(habit.notesMap?.[activeDateStr] || '');
  const [showBurst, setShowBurst] = useState(false);

  const fireCelebration = (e?: React.MouseEvent) => {
    setShowBurst(true);
    setTimeout(() => setShowBurst(false), 700);

    let origin: { x: number; y: number } | undefined;
    if (e && e.clientX && e.clientY) {
      origin = {
        x: e.clientX / window.innerWidth,
        y: e.clientY / window.innerHeight,
      };
    }
    triggerHabitCompletionCelebration(origin, habit.color);
  };

  const getStepSize = () => {
    if (targetCount <= 3 && (habit.unit?.toLowerCase().includes('liter') || habit.unit?.toLowerCase().includes('l'))) {
      return 0.25;
    }
    if (targetCount <= 5 && (habit.unit?.toLowerCase().includes('liter') || habit.unit?.toLowerCase().includes('km'))) {
      return 0.5;
    }
    return 1;
  };

  const handleToggle = (e?: React.MouseEvent) => {
    if (!isCompleted) {
      triggerHaptic('success');
      fireCelebration(e);
    } else {
      triggerHaptic('light');
    }
    onToggleDate(habit.id, activeDateStr);
  };

  const handleNoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveNote(habit.id, activeDateStr, noteText.trim());
    setShowNoteInput(false);
  };

  const existingNote = habit.notesMap?.[activeDateStr];

  // Swipe Logic
  const dragX = useMotionValue(0);
  const controls = useAnimation();
  const SWIPE_THRESHOLD = 80;

  const handleDragEnd = (e: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (info.offset.x > SWIPE_THRESHOLD) {
      triggerHaptic('medium');
      handleToggle(e as any);
    } else if (info.offset.x < -SWIPE_THRESHOLD) {
      triggerHaptic('medium');
      setShowMenu(true);
    }
    controls.start({ x: 0, transition: { type: 'spring', stiffness: 400, damping: 25 } });
  };

  return (
    <div className={`relative w-full rounded-2xl group bg-stone-100 dark:bg-[#252522] ${showMenu ? 'z-50' : 'z-0'}`}>
      {/* Background for Swipe Actions */}
      <div className="absolute inset-0 flex justify-between items-center px-6 rounded-2xl overflow-hidden">
        <div className="w-1/2 flex items-center justify-start h-full text-emerald-600 dark:text-emerald-400 font-bold gap-2 opacity-80">
          <Check className="w-6 h-6" />
        </div>
        <div className="w-1/2 flex items-center justify-end h-full text-stone-500 font-bold gap-2 opacity-80">
          <MoreHorizontal className="w-6 h-6" />
        </div>
      </div>
      <motion.div
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.2}
        onDragEnd={handleDragEnd}
        animate={controls}
        layout="position"
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className={`rounded-2xl transition-all duration-300 ease-out border relative ${
          isCompleted
            ? 'bg-white dark:bg-[#1c1c1a] shadow-xs'
            : isRestDay
            ? 'bg-blue-50/50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-900/30 shadow-none'
            : 'bg-white dark:bg-[#1c1c1a] border-stone-100/90 dark:border-[#282825] shadow-[0_1px_3px_rgba(0,0,0,0.03)] dark:shadow-none hover:shadow-[0_3px_10px_rgba(0,0,0,0.05)] dark:hover:border-[#33332f]'
        }`}
        style={{
          x: dragX,
          borderColor: isCompleted ? `${habit.color}40` : undefined,
        }}
      >
      {/* Subtle completed background tint matching cluster/habit color */}
      {isCompleted && (
        <div
          className="absolute inset-0 pointer-events-none transition-opacity duration-300 rounded-2xl"
          style={{
            backgroundColor: habit.color,
            opacity: 0.05,
          }}
        />
      )}
      <div className="p-4 relative z-10">
        {/* Top Header inside card: Category & Menu */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span
              className={`text-[11px] font-semibold px-2 py-0.5 rounded-lg ${categoryInfo.bgSoft} ${categoryInfo.textClass}`}
            >
              {categoryInfo.label}
            </span>

            {habit.timeOfDay !== 'anytime' && (
              <span className="text-[11px] font-medium text-stone-500 dark:text-stone-400 flex items-center gap-1">
                <Clock className="w-3 h-3 text-stone-400 dark:text-stone-500" />
                <span>{timeInfo.label}</span>
              </span>
            )}

            {(habit.stackParentHabitId || habit.triggerCue) && (
              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                <LinkIcon className="w-2.5 h-2.5" />
                <span>Stack</span>
              </span>
            )}
          </div>

          <HabitCardMenu
            showMenu={showMenu}
            setShowMenu={setShowMenu}
            habit={habit}
            activeDateStr={activeDateStr}
            isRestDay={isRestDay}
            onEdit={onEdit}
            onDelete={onDelete}
            onToggleRestDay={onToggleRestDay}
            onShare={onShare}
            onCreateStackedHabit={onCreateStackedHabit}
          />
        </div>

        {/* Main Content Row: Icon with rounded-square progress border + Title + Action Controls */}
        <div className="flex items-center gap-3">
          {/* Habit Icon Container with matching rounded-xl shape and subtle bounce on completion */}
          <motion.div
            animate={
              isCompleted
                ? { scale: [1, 1.12, 1], transition: { duration: 0.35, ease: 'easeOut' } }
                : { scale: 1 }
            }
            className="relative w-10 h-10 shrink-0 flex items-center justify-center"
            title={
              habit.habitType === 'counter'
                ? `Progres: ${progressPercent}% (${formatNumber(currentCount)}/${formatNumber(targetCount)} ${habit.unit || ''})`
                : undefined
            }
          >
            {habit.habitType === 'counter' ? (
              <>
                {/* Rounded-Square Progress Border starting from Top-Center */}
                <svg
                  className="absolute inset-0 w-10 h-10 pointer-events-none overflow-visible"
                  viewBox="0 0 40 40"
                  aria-hidden="true"
                >
                  {/* Soft Background Track */}
                  <path
                    d="M 20 1.5 H 28.5 A 10 10 0 0 1 38.5 11.5 V 28.5 A 10 10 0 0 1 28.5 38.5 H 11.5 A 10 10 0 0 1 1.5 28.5 V 11.5 A 10 10 0 0 1 11.5 1.5 Z"
                    fill="none"
                    stroke={`${habit.color}25`}
                    strokeWidth="2.25"
                  />
                  {/* Active Progress Border starting at Top-Center (M 20 1.5) and wrapping clockwise */}
                  <path
                    d="M 20 1.5 H 28.5 A 10 10 0 0 1 38.5 11.5 V 28.5 A 10 10 0 0 1 28.5 38.5 H 11.5 A 10 10 0 0 1 1.5 28.5 V 11.5 A 10 10 0 0 1 11.5 1.5 Z"
                    fill="none"
                    pathLength="100"
                    stroke={habit.color}
                    strokeWidth="2.25"
                    strokeLinecap="round"
                    strokeDasharray="100"
                    strokeDashoffset={
                      100 * (1 - Math.min(100, Math.max(0, progressPercent)) / 100)
                    }
                    className="transition-all duration-500 ease-out"
                  />
                </svg>

                {/* Inner Icon Container with identical rounded-xl shape and soft background */}
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center transition-colors duration-300"
                  style={{
                    backgroundColor: `${habit.color}18`,
                    color: habit.color,
                  }}
                >
                  <HabitIcon name={habit.icon} className="w-5 h-5 transition-transform duration-300" />
                </div>
              </>
            ) : (
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300"
                style={{
                  backgroundColor: `${habit.color}18`,
                  color: habit.color,
                  boxShadow: isCompleted ? `0 0 0 2px ${habit.color}50` : undefined,
                }}
              >
                <HabitIcon name={habit.icon} className="w-5 h-5 transition-transform duration-300" />
              </div>
            )}
          </motion.div>

          {/* Title and Description */}
          <div className="flex-1 min-w-0">
            <h3
              className={`text-sm sm:text-base font-bold tracking-tight truncate transition-colors duration-300 ${
                isCompleted ? 'text-stone-700 dark:text-stone-300' : 'text-stone-900 dark:text-[#f4f4f1]'
              }`}
            >
              {habit.title}
            </h3>
            {habit.triggerCue ? (
              <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium truncate mt-0.5 flex items-center gap-1">
                <LinkIcon className="w-2.5 h-2.5 shrink-0" />
                <span className="truncate">{habit.triggerCue}</span>
              </p>
            ) : parentHabitTitle ? (
              <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium truncate mt-0.5 flex items-center gap-1">
                <LinkIcon className="w-2.5 h-2.5 shrink-0" />
                <span className="truncate">Setelah &ldquo;{parentHabitTitle}&rdquo;</span>
              </p>
            ) : null}
            {habit.description && (
              <p className="text-xs text-stone-500 dark:text-stone-400 truncate mt-0.5">
                {habit.description}
              </p>
            )}
          </div>

          <HabitCardProgress
            habit={habit}
            activeDateStr={activeDateStr}
            isCompleted={isCompleted}
            isRestDay={isRestDay}
            currentCount={currentCount}
            targetCount={targetCount}
            step={getStepSize()}
            showBurst={showBurst}
            onUpdateCounter={onUpdateCounter}
            onToggleDate={onToggleDate}
            onStartTimer={onStartTimer}
            triggerHaptic={triggerHaptic}
            fireCelebration={fireCelebration}
          />
        </div>

        {/* Footer info: Streak on bottom-left, Note Button on bottom-right (Border-free, no rekor text) */}
        <div className="flex items-center justify-between mt-2.5 pt-1 text-xs">
          {streak.currentStreak > 0 ? (
            <div
              className="flex items-center gap-1.5 text-[11px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-500/10 dark:bg-amber-500/15 px-2 py-0.5 rounded-lg"
              title={`Streak: ${streak.currentStreak} hari`}
            >
              <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
              <span>{streak.currentStreak} Hari</span>
            </div>
          ) : (
            <div />
          )}

          <button
            onClick={() => {
              setNoteText(habit.notesMap?.[activeDateStr] || '');
              setShowNoteInput(!showNoteInput);
            }}
            className={`text-[11px] font-medium flex items-center gap-1 px-2 py-0.5 rounded-lg transition ${
              existingNote
                ? 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40'
                : 'text-stone-400 dark:text-stone-500 hover:text-stone-600 dark:hover:text-stone-300'
            }`}
          >
            <MessageSquare className="w-3 h-3" />
            <span>{existingNote ? 'Ada catatan' : 'Catatan'}</span>
          </button>
        </div>

        {/* Existing Note display or note input box */}
        {existingNote && !showNoteInput && (
          <div className="mt-2 text-xs text-stone-600 dark:text-stone-300 bg-stone-50/80 dark:bg-[#242421] rounded-xl p-2.5 flex items-start justify-between gap-2 border border-stone-100 dark:border-[#2f2f2b]">
            <p className="italic">{existingNote}</p>
            <button
              onClick={() => setShowNoteInput(true)}
              className="text-[10px] text-stone-400 dark:text-stone-500 hover:text-stone-700 dark:hover:text-stone-300 shrink-0 font-medium"
            >
              Ubah
            </button>
          </div>
        )}

        {showNoteInput && (
          <form onSubmit={handleNoteSubmit} className="mt-2.5 space-y-2">
            <input
              type="text"
              placeholder="Tulis catatan singkat hari ini..."
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              className="w-full px-3 py-2 bg-stone-100/70 dark:bg-[#242421] rounded-xl text-xs text-stone-900 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-500 focus:outline-none focus:bg-white dark:focus:bg-[#2c2c28] focus:ring-1 focus:ring-stone-300 dark:focus:ring-stone-600 transition"
              autoFocus
            />
            <div className="flex items-center justify-end gap-1.5">
              <button
                type="button"
                onClick={() => setShowNoteInput(false)}
                className="px-2.5 py-1 text-[11px] text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-300 rounded-lg"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-3 py-1 text-[11px] font-medium text-white dark:text-stone-900 bg-stone-900 dark:bg-stone-100 hover:bg-stone-800 dark:hover:bg-white rounded-lg transition"
              >
                Simpan
              </button>
            </div>
          </form>
        )}
      </div>
      </motion.div>
    </div>
  );
};
