import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Flame, X } from 'lucide-react';
import { Habit } from '../types';

interface Props {
  habits: Habit[];
  onClose: () => void;
  isOpen: boolean;
}

export const AtRiskOverlay: React.FC<Props> = ({ habits, onClose, isOpen }) => {
  if (!isOpen || habits.length === 0) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="bg-white dark:bg-[#1c1c1a] rounded-3xl p-6 sm:p-8 shadow-2xl relative z-10 w-full max-w-md border border-stone-200/50 dark:border-[#282825] overflow-hidden"
        >
          {/* Decorative Background */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-stone-100 dark:bg-[#252522] text-stone-500 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-[#2e2e2a] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex flex-col items-center text-center mt-2 relative z-10">
            <div className="w-16 h-16 bg-orange-100 dark:bg-orange-500/20 rounded-full flex items-center justify-center mb-5 shadow-inner">
              <Flame className="w-8 h-8 text-orange-500 dark:text-orange-400" />
            </div>
            
            <h2 className="text-xl sm:text-2xl font-bold text-stone-900 dark:text-[#f4f4f1] mb-2">
              Hai, Jangan Menyerah Sekarang!
            </h2>
            <p className="text-sm text-stone-600 dark:text-stone-400 mb-6 max-w-[280px]">
              Anda punya rutinitas dengan *streak* tinggi yang belum diselesaikan hari ini. Jangan sampai kerja keras Anda hangus!
            </p>

            <div className="w-full space-y-2 mb-6">
              {habits.slice(0, 3).map(habit => (
                <div key={habit.id} className="bg-orange-50/50 dark:bg-orange-950/20 border border-orange-100 dark:border-orange-900/30 rounded-xl p-3 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-orange-100 dark:bg-orange-900/50">
                    <Flame className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div className="text-left flex-1 min-w-0">
                    <div className="font-bold text-stone-900 dark:text-[#f4f4f1] truncate text-sm">{habit.title}</div>
                    <div className="text-xs text-orange-600 dark:text-orange-400 font-semibold mt-0.5">
                      🔥 Streak harus dijaga!
                    </div>
                  </div>
                </div>
              ))}
              {habits.length > 3 && (
                <div className="text-xs text-stone-500 dark:text-stone-400 mt-2 font-medium">
                  + {habits.length - 3} rutinitas lainnya
                </div>
              )}
            </div>

            <button
              onClick={onClose}
              className="w-full py-3.5 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl shadow-[0_4px_12px_rgba(249,115,22,0.25)] transition-all active:scale-95"
            >
              Selamatkan Streak Saya
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
