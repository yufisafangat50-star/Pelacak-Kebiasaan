import React from 'react';
import { MoreHorizontal, Link as LinkIcon, Edit3, Trash2, Snowflake, Share2 } from 'lucide-react';
import { Habit } from '../../types';

interface HabitCardMenuProps {
  showMenu: boolean;
  setShowMenu: (show: boolean) => void;
  habit: Habit;
  activeDateStr: string;
  isRestDay: boolean;
  onEdit: (habit: Habit) => void;
  onDelete: (id: string) => void;
  onToggleRestDay?: (id: string, date: string) => void;
  onShare?: (habit: Habit) => void;
  onCreateStackedHabit?: (habit: Habit) => void;
}

export const HabitCardMenu: React.FC<HabitCardMenuProps> = ({
  showMenu,
  setShowMenu,
  habit,
  activeDateStr,
  isRestDay,
  onEdit,
  onDelete,
  onToggleRestDay,
  onShare,
  onCreateStackedHabit,
}) => {
  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="w-7 h-7 rounded-lg text-stone-400 dark:text-stone-500 hover:text-stone-700 dark:hover:text-stone-300 hover:bg-stone-100/70 dark:hover:bg-[#272724] flex items-center justify-center transition"
        aria-label="Pilihan kebiasaan"
      >
        <MoreHorizontal className="w-4 h-4" />
      </button>

      {showMenu && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(false);
            }}
          />
          <div className="absolute right-0 top-8 w-36 bg-white dark:bg-[#242421] rounded-xl shadow-lg border border-stone-100 dark:border-[#33332f] py-1 z-20 text-xs">
            {onCreateStackedHabit && (
              <button
                onClick={() => {
                  setShowMenu(false);
                  onCreateStackedHabit(habit);
                }}
                className="w-full text-left px-3 py-1.5 hover:bg-stone-50 dark:hover:bg-[#2d2d29] flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-medium"
              >
                <LinkIcon className="w-3.5 h-3.5" />
                <span>Tautkan Alur</span>
              </button>
            )}
            <button
              onClick={() => {
                setShowMenu(false);
                onEdit(habit);
              }}
              className="w-full text-left px-3 py-1.5 hover:bg-stone-50 dark:hover:bg-[#2d2d29] flex items-center gap-2 text-stone-700 dark:text-stone-300"
            >
              <Edit3 className="w-3.5 h-3.5 text-stone-400" />
              <span>Ubah</span>
            </button>
            <button
              onClick={() => {
                setShowMenu(false);
                onDelete(habit.id);
              }}
              className="w-full text-left px-3 py-1.5 hover:bg-rose-50 dark:hover:bg-rose-950/30 flex items-center gap-2 text-rose-600 dark:text-rose-400"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-500" />
              <span>Hapus</span>
            </button>
            {onToggleRestDay && (
              <button
                onClick={() => {
                  setShowMenu(false);
                  onToggleRestDay(habit.id, activeDateStr);
                }}
                className="w-full text-left px-3 py-1.5 hover:bg-blue-50 dark:hover:bg-blue-950/30 flex items-center gap-2 text-blue-600 dark:text-blue-400 border-t border-stone-100 dark:border-[#33332f]"
              >
                <Snowflake className="w-3.5 h-3.5 text-blue-500" />
                <span>{isRestDay ? 'Batal Istirahat' : 'Tandai Istirahat'}</span>
              </button>
            )}
            {onShare && (
              <button
                onClick={() => {
                  setShowMenu(false);
                  onShare(habit);
                }}
                className="w-full text-left px-3 py-1.5 hover:bg-stone-50 dark:hover:bg-[#2d2d29] flex items-center gap-2 text-purple-600 dark:text-purple-400 border-t border-stone-100 dark:border-[#33332f]"
              >
                <Share2 className="w-3.5 h-3.5 text-purple-500" />
                <span>Bagikan</span>
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
};
