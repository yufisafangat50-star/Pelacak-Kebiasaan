import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Check, CopyPlus, Sparkles } from 'lucide-react';
import { HabitPack, HABIT_PACKS, HabitTemplate } from '../data/habitPacks';
import { HabitIcon } from './HabitIcon';

interface HabitPackModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportHabits: (habits: HabitTemplate[]) => void;
}

export const HabitPackModal: React.FC<HabitPackModalProps> = ({ isOpen, onClose, onImportHabits }) => {
  const [selectedPackId, setSelectedPackId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleImport = (pack: HabitPack) => {
    onImportHabits(pack.habits);
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm"
        />

        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-md bg-white dark:bg-[#1c1c1a] rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-stone-100 dark:border-[#282825]">
            <h2 className="text-lg font-bold text-stone-900 dark:text-[#f4f4f1] flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              Template Kebiasaan
            </h2>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-stone-100 dark:bg-[#282825] text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-[#f4f4f1] transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <p className="text-sm text-stone-500 dark:text-stone-400 px-2">
              Pilih paket kebiasaan yang telah disusun untuk membantu Anda mencapai tujuan tertentu dengan lebih cepat.
            </p>

            <div className="space-y-3">
              {HABIT_PACKS.map((pack) => {
                const isSelected = selectedPackId === pack.id;

                return (
                  <div
                    key={pack.id}
                    className={`rounded-2xl border transition-all duration-300 overflow-hidden ${
                      isSelected
                        ? 'border-emerald-500/50 dark:border-emerald-500/40 bg-emerald-50/30 dark:bg-emerald-950/10 shadow-sm'
                        : 'border-stone-100 dark:border-[#282825] bg-white dark:bg-[#1c1c1a] hover:border-stone-300 dark:hover:border-stone-700 cursor-pointer'
                    }`}
                    onClick={() => setSelectedPackId(isSelected ? null : pack.id)}
                  >
                    <div className="p-4 flex gap-4">
                      <div 
                        className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-inner"
                        style={{ backgroundColor: `${pack.color}15`, color: pack.color }}
                      >
                        <HabitIcon name={pack.icon} className="w-6 h-6" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-bold text-stone-900 dark:text-[#f4f4f1] truncate">{pack.name}</h3>
                        <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5 line-clamp-2">{pack.description}</p>
                        <p className="text-[10px] font-medium text-stone-400 dark:text-stone-500 mt-2">
                          {pack.habits.length} Kebiasaan di paket ini
                        </p>
                      </div>
                    </div>

                    {/* Expanded details */}
                    <AnimatePresence>
                      {isSelected && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="px-4 pb-4 overflow-hidden border-t border-emerald-100 dark:border-emerald-900/30 pt-3"
                        >
                          <ul className="space-y-2 mb-4">
                            {pack.habits.map((h, i) => (
                              <li key={i} className="flex items-center gap-3 text-xs bg-white/50 dark:bg-black/20 p-2 rounded-lg border border-white/50 dark:border-white/5">
                                <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ backgroundColor: `${h.color}15`, color: h.color }}>
                                  <HabitIcon name={h.icon} className="w-3.5 h-3.5" />
                                </div>
                                <div>
                                  <span className="font-semibold text-stone-700 dark:text-stone-300 block">{h.title}</span>
                                  {h.description && <span className="text-[10px] text-stone-500 block truncate max-w-[200px]">{h.description}</span>}
                                </div>
                              </li>
                            ))}
                          </ul>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleImport(pack);
                            }}
                            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl py-2.5 font-bold text-sm flex items-center justify-center gap-2 transition"
                          >
                            <CopyPlus className="w-4 h-4" />
                            Gunakan Paket Ini
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
