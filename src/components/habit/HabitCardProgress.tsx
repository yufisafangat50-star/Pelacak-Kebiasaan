import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus, Check, Play } from 'lucide-react';
import { Habit } from '../../types';
import { MicroSparkleBurst } from '../MicroSparkleBurst';
import { formatNumber } from '../../utils/formatters';

interface HabitCardProgressProps {
  habit: Habit;
  activeDateStr: string;
  isCompleted: boolean;
  isRestDay: boolean;
  currentCount: number;
  targetCount: number;
  step: number;
  showBurst: boolean;
  onUpdateCounter: (id: string, date: string, count: number) => void;
  onToggleDate: (id: string, date: string) => void;
  onStartTimer?: (habit: Habit) => void;
  triggerHaptic: (type: 'success' | 'light' | 'medium') => void;
  fireCelebration: (e?: React.MouseEvent) => void;
}

export const HabitCardProgress: React.FC<HabitCardProgressProps> = ({
  habit,
  activeDateStr,
  isCompleted,
  isRestDay,
  currentCount,
  targetCount,
  step,
  showBurst,
  onUpdateCounter,
  onToggleDate,
  onStartTimer,
  triggerHaptic,
  fireCelebration,
}) => {
  const [isEditingCount, setIsEditingCount] = useState(false);
  const [countInput, setCountInput] = useState(String(currentCount));

  const handleToggle = (e: React.MouseEvent) => {
    if (!isCompleted) {
      triggerHaptic('success');
      fireCelebration(e);
    } else {
      triggerHaptic('light');
    }
    onToggleDate(habit.id, activeDateStr);
  };

  const handleDecrement = () => {
    if (currentCount <= 0) return;
    const nextVal = Math.max(0, Math.round((currentCount - step) * 100) / 100);
    onUpdateCounter(habit.id, activeDateStr, nextVal);
  };

  const handleIncrement = (e: React.MouseEvent) => {
    const nextVal = Math.min(targetCount, Math.round((currentCount + step) * 100) / 100);
    if (nextVal >= targetCount && currentCount < targetCount) {
      triggerHaptic('success');
      fireCelebration(e);
    } else {
      triggerHaptic('light');
    }
    onUpdateCounter(habit.id, activeDateStr, nextVal);
  };

  const startEditingCount = () => {
    setCountInput(String(Math.min(targetCount, currentCount)));
    setIsEditingCount(true);
  };

  const saveEditingCount = () => {
    const parsed = Math.min(targetCount, Math.max(0, parseFloat(countInput) || 0));
    const nextVal = Math.round(parsed * 100) / 100;
    if (nextVal >= targetCount && currentCount < targetCount) {
      fireCelebration();
    }
    onUpdateCounter(habit.id, activeDateStr, nextVal);
    setIsEditingCount(false);
  };

  if (habit.habitType === 'counter') {
    return (
      <div className="shrink-0 pt-0.5">
        <div className="flex items-center gap-1 bg-stone-100/70 dark:bg-[#262623] rounded-xl p-1 transition-colors duration-300">
          <button
            onClick={handleDecrement}
            disabled={currentCount <= 0}
            className="w-7 h-7 rounded-lg bg-white dark:bg-[#33332f] text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:white disabled:opacity-30 disabled:hover:text-stone-600 flex items-center justify-center transition shadow-2xs active:scale-95"
            aria-label="Kurang"
            title={`Kurang (${step})`}
          >
            <Minus className="w-3 h-3" />
          </button>

          {isEditingCount ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                saveEditingCount();
              }}
              className="px-1 min-w-[52px]"
            >
              <input
                type="number"
                step="any"
                min="0"
                autoFocus
                value={countInput}
                onChange={(e) => setCountInput(e.target.value)}
                onBlur={saveEditingCount}
                className="w-14 text-center text-xs font-bold bg-white dark:bg-[#33332f] rounded px-1 py-0.5 text-stone-900 dark:text-white border border-stone-300 dark:border-stone-600 focus:outline-none"
              />
            </form>
          ) : (
            <button
              type="button"
              onClick={startEditingCount}
              className="px-1.5 text-center min-w-[50px] hover:bg-white/60 dark:hover:bg-white/5 rounded-md transition py-0.5"
              title="Klik untuk ubah angka langsung"
            >
              <span
                className={`text-xs font-bold transition-colors duration-300 ${
                  isCompleted ? '' : 'text-stone-800 dark:text-[#eaeaea]'
                }`}
                style={{
                  color: isCompleted ? habit.color : undefined,
                }}
              >
                {formatNumber(Math.min(currentCount, targetCount))}/{formatNumber(targetCount)}
              </span>
              {habit.unit && (
                <span className="block text-[9px] text-stone-400 dark:text-stone-500 leading-none truncate max-w-[56px] mx-auto">
                  {habit.unit}
                </span>
              )}
            </button>
          )}

          <div className="relative overflow-visible">
            <MicroSparkleBurst active={showBurst} color={habit.color} />
            <motion.button
              whileTap={!(isCompleted || currentCount >= targetCount) ? { scale: 0.88 } : undefined}
              onClick={handleIncrement}
              disabled={isCompleted || currentCount >= targetCount}
              className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-300 shadow-2xs ${
                isCompleted || currentCount >= targetCount
                  ? 'text-white cursor-default opacity-95'
                  : 'bg-white dark:bg-[#33332f] text-stone-800 dark:text-stone-200 hover:bg-stone-200/50 dark:hover:bg-[#3d3d38]'
              }`}
              style={
                isCompleted || currentCount >= targetCount
                  ? {
                      backgroundColor: habit.color,
                      boxShadow: `0 2px 8px ${habit.color}40`,
                    }
                  : undefined
              }
              aria-label={isCompleted || currentCount >= targetCount ? 'Target tercapai' : 'Tambah'}
              title={
                isCompleted || currentCount >= targetCount
                  ? 'Target hari ini sudah tercapai'
                  : `Tambah (${step})`
              }
            >
              <AnimatePresence mode="wait" initial={false}>
                {isCompleted || currentCount >= targetCount ? (
                  <motion.div
                    key="counter-done"
                    initial={{ scale: 0.3, rotate: -25, opacity: 0 }}
                    animate={{ scale: 1, rotate: 0, opacity: 1 }}
                    exit={{ scale: 0.3, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                  >
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="counter-plus"
                    initial={{ scale: 0.8, opacity: 0.5 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.5, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    <Plus className="w-3 h-3" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </div>
      </div>
    );
  }

  if (habit.habitType === 'timer') {
    return (
      <div className="shrink-0 pt-0.5">
        <div className="relative overflow-visible">
          <MicroSparkleBurst active={showBurst} color={habit.color} />
          <motion.button
            whileTap={!isCompleted ? { scale: 0.86 } : undefined}
            whileHover={!isCompleted ? { scale: 1.04 } : undefined}
            onClick={() => {
              if (isCompleted) {
                onToggleDate(habit.id, activeDateStr); // untoggle if already completed
              } else if (onStartTimer) {
                onStartTimer(habit);
              }
            }}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 relative overflow-hidden ${
              isCompleted
                ? 'text-white shadow-xs'
                : isRestDay
                ? 'bg-blue-100/50 dark:bg-blue-900/30 text-blue-500 dark:text-blue-400'
                : 'bg-stone-100/80 dark:bg-[#262623] text-stone-400 dark:text-stone-500 hover:bg-stone-200/60 dark:hover:bg-[#2e2e2a]'
            }`}
            style={
              isCompleted
                ? {
                    backgroundColor: habit.color,
                    boxShadow: `0 2px 10px ${habit.color}40`,
                  }
                : undefined
            }
            aria-label={isCompleted ? `Batalkan ${habit.title}` : `Mulai timer ${habit.title}`}
          >
            <AnimatePresence mode="wait" initial={false}>
              {isCompleted ? (
                <motion.div
                  key="timer-done"
                  initial={{ scale: 0.3, rotate: -25, opacity: 0 }}
                  animate={{ scale: 1, rotate: 0, opacity: 1 }}
                  exit={{ scale: 0.3, rotate: 20, opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                </motion.div>
              ) : (
                <motion.div
                  key="timer-play"
                  initial={{ scale: 0.8, opacity: 0.3 }}
                  animate={{ scale: 1, opacity: 0.6 }}
                  exit={{ scale: 0.6, opacity: 0 }}
                >
                  <Play className="w-4 h-4 fill-current ml-0.5" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
      </div>
    );
  }

  // Boolean type
  return (
    <div className="shrink-0 pt-0.5">
      <div className="relative overflow-visible">
        <MicroSparkleBurst active={showBurst} color={habit.color} />
        <motion.button
          whileTap={{ scale: 0.86 }}
          whileHover={{ scale: 1.04 }}
          onClick={handleToggle}
          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 relative overflow-hidden ${
            isCompleted
              ? 'text-white shadow-xs'
              : isRestDay
              ? 'bg-blue-100/50 dark:bg-blue-900/30 text-blue-500 dark:text-blue-400'
              : 'bg-stone-100/80 dark:bg-[#262623] text-stone-400 dark:text-stone-500 hover:bg-stone-200/60 dark:hover:bg-[#2e2e2a]'
          }`}
          style={
            isCompleted
              ? {
                  backgroundColor: habit.color,
                  boxShadow: `0 2px 10px ${habit.color}40`,
                }
              : undefined
          }
          aria-label={`Tandai ${habit.title}`}
        >
          <AnimatePresence mode="wait" initial={false}>
            {isCompleted ? (
              <motion.div
                key="check-done"
                initial={{ scale: 0.3, rotate: -25, opacity: 0 }}
                animate={{ scale: 1, rotate: 0, opacity: 1 }}
                exit={{ scale: 0.3, rotate: 20, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 500, damping: 25 }}
              >
                <Check className="w-4 h-4 stroke-[3]" />
              </motion.div>
            ) : (
              <motion.div
                key="check-empty"
                initial={{ scale: 0.8, opacity: 0.3 }}
                animate={{ scale: 1, opacity: 0.6 }}
                exit={{ scale: 0.6, opacity: 0 }}
              >
                <div
                  className="w-4 h-4 rounded-md border-2"
                  style={{
                    borderColor: isRestDay ? 'currentColor' : `${habit.color}80`,
                  }}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
      </div>
    </div>
  );
};
