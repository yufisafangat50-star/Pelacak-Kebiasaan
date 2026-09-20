import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Habit } from '../types';
import { HabitIcon } from './HabitIcon';
import { Download, X, Share2, Loader2 } from 'lucide-react';
import { AppLogo } from './AppLogo';
import { calculateHabitStreaks } from '../utils/dateUtils';
import * as htmlToImage from 'html-to-image';
import { CATEGORY_DETAILS } from '../data/defaultHabits';

interface ShareAchievementModalProps {
  habit: Habit | null;
  onClose: () => void;
}

export const ShareAchievementModal: React.FC<ShareAchievementModalProps> = ({ habit, onClose }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);

  if (!habit) return null;

  const streak = calculateHabitStreaks(habit.completedDates, habit.frequency, habit.restDays);
  const categoryInfo = CATEGORY_DETAILS[habit.category] || CATEGORY_DETAILS.kesehatan;

  const handleExport = async (action: 'download' | 'share') => {
    if (!cardRef.current) return;
    setIsExporting(true);

    try {
      const dataUrl = await htmlToImage.toPng(cardRef.current, {
        quality: 1,
        pixelRatio: 2,
        cacheBust: true,
      });

      if (action === 'download') {
        const link = document.createElement('a');
        link.download = `pencapaian-${habit.title.replace(/\s+/g, '-').toLowerCase()}.png`;
        link.href = dataUrl;
        link.click();
      } else if (action === 'share') {
        const blob = await (await fetch(dataUrl)).blob();
        const file = new File([blob], 'pencapaian.png', { type: 'image/png' });
        
        if (navigator.share && navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: 'Pencapaian Kebiasaan',
            text: `Saya berhasil mempertahankan streak ${streak.currentStreak} hari untuk kebiasaan "${habit.title}"!`,
            files: [file]
          });
        } else {
          // Fallback to download if web share is not supported
          alert('Berbagi tidak didukung di peramban ini. Gambar akan diunduh.');
          handleExport('download');
        }
      }
    } catch (err) {
      console.error('Gagal mengekspor gambar', err);
      alert('Gagal membuat gambar.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <AnimatePresence>
      {habit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-sm flex flex-col gap-4"
          >
            {/* Close Button */}
            <div className="flex justify-end">
              <button
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-stone-800 text-white/70 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Shareable Card Area (Will be captured) */}
            <div
              ref={cardRef}
              className="relative overflow-hidden rounded-3xl p-8 text-white shadow-2xl"
              style={{
                background: `linear-gradient(135deg, ${habit.color} 0%, ${categoryInfo.bgSoft.includes('emerald') ? '#059669' : '#1f2937'} 100%)`,
              }}
            >
              {/* Decorative elements */}
              <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                <HabitIcon name={habit.icon} className="w-48 h-48 -mr-16 -mt-16 rotate-12" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />

              <div className="relative z-10 flex flex-col items-center text-center pt-4">
                <div 
                  className="w-20 h-20 rounded-2xl bg-white/20 flex items-center justify-center mb-6 shadow-lg backdrop-blur-md border border-white/20"
                >
                  <HabitIcon name={habit.icon} className="w-10 h-10 text-white" />
                </div>
                
                <h3 className="text-2xl font-bold mb-1 tracking-tight leading-tight">
                  {habit.title}
                </h3>
                <p className="text-white/70 font-medium text-sm mb-8">
                  {categoryInfo.label}
                </p>

                <div className="bg-black/20 backdrop-blur-md rounded-2xl p-4 w-full border border-white/10 shadow-inner">
                  <div className="flex items-center justify-center gap-3">
                    <Flame className="w-8 h-8 text-amber-400" />
                    <div className="text-left">
                      <p className="text-4xl font-black text-amber-400 tracking-tight leading-none">
                        {streak.currentStreak}
                      </p>
                      <p className="text-xs text-amber-200/70 font-bold uppercase tracking-wider mt-1">
                        Hari Beruntun
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-8 flex items-center gap-2 text-white/50 text-[10px] uppercase font-bold tracking-widest">
                  <AppLogo size={14} />
                  <span>Rima Karsa</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => handleExport('share')}
                disabled={isExporting}
                className="flex-1 bg-stone-800 hover:bg-stone-700 text-white rounded-xl py-3.5 font-bold text-sm flex items-center justify-center gap-2 transition disabled:opacity-50 cursor-pointer"
              >
                {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Share2 className="w-4 h-4" />}
                Bagikan
              </button>
              <button
                onClick={() => handleExport('download')}
                disabled={isExporting}
                className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl py-3.5 font-bold text-sm flex items-center justify-center gap-2 transition disabled:opacity-50 cursor-pointer"
              >
                {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                Simpan
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
