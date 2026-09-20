import React, { useMemo } from 'react';
import { Sparkles, Sun, Moon, Coffee } from 'lucide-react';
import { Habit, MoodValue } from '../types';

interface Props {
  habits: Habit[];
  yesterdayMood?: MoodValue;
}

export const MotivationalQuote: React.FC<Props> = ({ habits, yesterdayMood }) => {
  const quoteData = useMemo(() => {
    const hour = new Date().getHours();
    let timeIcon = <Sun className="w-4 h-4 text-amber-500" />;
    let greeting = 'Selamat Pagi';
    
    if (hour >= 12 && hour < 15) {
      greeting = 'Selamat Siang';
    } else if (hour >= 15 && hour < 18) {
      greeting = 'Selamat Sore';
      timeIcon = <Coffee className="w-4 h-4 text-orange-500" />;
    } else if (hour >= 18 || hour < 4) {
      greeting = 'Selamat Malam';
      timeIcon = <Moon className="w-4 h-4 text-blue-400" />;
    }

    let message = 'Hari yang luar biasa untuk tetap konsisten!';
    
    const activeHabits = habits.filter(h => !h.archived);

    if (activeHabits.length === 0) {
      // Pengguna baru (belum ada kebiasaan)
      message = 'Hari yang luar biasa untuk memulai kebiasaan pertamamu!';
    } else if (yesterdayMood === 1 || yesterdayMood === 2) {
      message = 'Kemarin mungkin berat, tapi mari mulai dengan satu langkah kecil hari ini.';
    } else if (yesterdayMood === 3) {
      message = 'Jaga ritmenya! Konsistensi adalah kunci dari perubahan besar.';
    } else if (yesterdayMood === 4) {
      message = 'Perasaan yang bagus! Mari buat hari ini lebih produktif.';
    } else if (yesterdayMood === 5) {
      message = 'Pertahankan semangat hebatmu dari kemarin!';
    } else {
      // Jika pengguna lama (sudah punya kebiasaan) TIDAK MENGISI mood kemarin
      message = 'Fokus pada satu kebiasaan pada satu waktu.';
    }

    return { greeting, timeIcon, message };
  }, [habits, yesterdayMood]);

  return (
    <div className="px-5 mb-4">
      <div className="flex items-center gap-1.5 mb-1">
        {quoteData.timeIcon}
        <h2 className="text-sm font-bold text-stone-800 dark:text-stone-200">{quoteData.greeting}!</h2>
      </div>
      <p className="text-xs text-stone-500 dark:text-stone-400 flex items-center gap-1">
        <Sparkles className="w-3 h-3" />
        {quoteData.message}
      </p>
    </div>
  );
};
