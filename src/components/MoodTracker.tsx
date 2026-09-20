import React from 'react';
import { Frown, Angry, Meh, Smile, Laugh } from 'lucide-react';
import { MoodValue } from '../types';

interface Props {
  currentMood?: MoodValue;
  onSelectMood: (val: MoodValue) => void;
}

export const MoodTracker: React.FC<Props> = ({ currentMood, onSelectMood }) => {
  const moods: { val: MoodValue; icon: any; label: string; color: string }[] = [
    { val: 1, icon: Angry, label: 'Buruk', color: 'text-rose-500 bg-rose-100 dark:bg-rose-500/20 ring-rose-500' },
    { val: 2, icon: Frown, label: 'Sedih', color: 'text-orange-500 bg-orange-100 dark:bg-orange-500/20 ring-orange-500' },
    { val: 3, icon: Meh, label: 'Biasa', color: 'text-stone-600 dark:text-stone-300 bg-stone-200 dark:bg-stone-700/50 ring-stone-400' },
    { val: 4, icon: Smile, label: 'Senang', color: 'text-emerald-500 bg-emerald-100 dark:bg-emerald-500/20 ring-emerald-500' },
    { val: 5, icon: Laugh, label: 'Luar Biasa', color: 'text-amber-500 bg-amber-100 dark:bg-amber-500/20 ring-amber-500' },
  ];

  return (
    <div className="bg-white dark:bg-[#1c1c1a] rounded-2xl p-4 shadow-[0_1px_3px_rgba(0,0,0,0.03)] dark:shadow-none dark:border dark:border-[#282825] mt-6 transition-colors">
      <h3 className="text-sm font-bold text-stone-900 dark:text-[#f4f4f1] mb-1 text-center">
        Bagaimana perasaanmu hari ini?
      </h3>
      <p className="text-[11px] text-stone-500 dark:text-stone-400 text-center mb-4">
        Lacak suasana hatimu untuk melihat korelasi dengan kebiasaan.
      </p>

      <div className="flex items-center justify-between gap-1 sm:gap-2">
        {moods.map((m) => {
          const isSelected = currentMood === m.val;
          const Icon = m.icon;
          return (
            <button
              key={m.val}
              onClick={() => onSelectMood(m.val)}
              className={`flex-1 flex flex-col items-center justify-center p-2 rounded-xl transition-all ${
                isSelected 
                  ? m.color + ' ring-2 ring-offset-2 ring-offset-white dark:ring-offset-[#1c1c1a] scale-105' 
                  : 'hover:bg-stone-50 dark:hover:bg-[#252522] grayscale hover:grayscale-0 opacity-60 hover:opacity-100'
              }`}
            >
              <Icon className={`w-7 h-7 sm:w-8 sm:h-8 mb-1 ${isSelected ? '' : 'text-stone-400 dark:text-stone-500'}`} />
              <span className={`text-[9px] sm:text-[10px] font-semibold ${isSelected ? '' : 'text-stone-400 dark:text-stone-500'}`}>
                {m.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
