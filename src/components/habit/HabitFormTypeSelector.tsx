import React from 'react';
import { Category, HabitType } from '../../types';

interface HabitFormTypeSelectorProps {
  habitType: HabitType;
  setHabitType: (type: HabitType) => void;
  durationMinutes: number;
  setDurationMinutes: (minutes: number) => void;
  targetCount: string;
  setTargetCount: (target: string) => void;
  unit: string;
  setUnit: (unit: string) => void;
  title: string;
  setTitle: (title: string) => void;
  setCategory: (cat: Category) => void;
  setIcon: (icon: string) => void;
  setColor: (color: string) => void;
}

const TARGET_PRESETS = [
  { label: 'Minum 2 Liter Air', target: '2', unit: 'Liter', cat: 'kesehatan' as Category, icon: 'Droplets', color: '#0284c7' },
  { label: 'Minum 8 Gelas Air', target: '8', unit: 'Gelas', cat: 'kesehatan' as Category, icon: 'Droplets', color: '#0284c7' },
  { label: 'Baca 20 Menit', target: '20', unit: 'Menit', cat: 'belajar' as Category, icon: 'BookOpen', color: '#4f46e5' },
  { label: '10.000 Langkah', target: '10000', unit: 'Langkah', cat: 'olahraga' as Category, icon: 'Activity', color: '#059669' },
  { label: 'Lari 3 Km', target: '3', unit: 'Km', cat: 'olahraga' as Category, icon: 'Flame', color: '#ea580c' },
];

const SUGGESTED_UNITS = ['Liter', 'Gelas', 'Menit', 'Langkah', 'Halaman', 'Km', 'Kali'];

export const HabitFormTypeSelector: React.FC<HabitFormTypeSelectorProps> = ({
  habitType,
  setHabitType,
  durationMinutes,
  setDurationMinutes,
  targetCount,
  setTargetCount,
  unit,
  setUnit,
  title,
  setTitle,
  setCategory,
  setIcon,
  setColor,
}) => {
  return (
    <>
      <div>
        <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
          Tipe Pelacakan
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => setHabitType('boolean')}
            className={`py-2 px-3 rounded-xl font-medium text-center transition ${
              habitType === 'boolean'
                ? 'bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 shadow-xs'
                : 'bg-stone-100 dark:bg-[#252522] text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-[#2e2e2a]'
            }`}
          >
            Centang (Ya/Tidak)
          </button>
          <button
            type="button"
            onClick={() => setHabitType('counter')}
            className={`py-2 px-3 rounded-xl font-medium text-center transition ${
              habitType === 'counter'
                ? 'bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 shadow-xs'
                : 'bg-stone-100 dark:bg-[#252522] text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-[#2e2e2a]'
            }`}
          >
            Progres / Target
          </button>
          <button
            type="button"
            onClick={() => setHabitType('timer')}
            className={`py-2 px-3 rounded-xl font-medium text-center transition ${
              habitType === 'timer'
                ? 'bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 shadow-xs'
                : 'bg-stone-100 dark:bg-[#252522] text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-[#2e2e2a]'
            }`}
          >
            Durasi Waktu
          </button>
        </div>
      </div>

      {habitType === 'timer' && (
        <div className="p-3.5 bg-stone-50 dark:bg-[#252522] border border-stone-100/80 dark:border-[#2e2e2a] rounded-2xl space-y-3">
          <div>
            <label className="block font-medium text-stone-700 dark:text-stone-300 mb-1 text-[11px]">
              Target Waktu (Menit)
            </label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min="1"
                placeholder="Misal: 10 atau 30"
                value={durationMinutes || ''}
                onChange={(e) => setDurationMinutes(parseInt(e.target.value) || 0)}
                className="flex-1 px-3 py-2 bg-white dark:bg-[#1c1c1a] border border-stone-200/80 dark:border-[#33332f] rounded-xl text-stone-900 dark:text-[#f4f4f1] focus:outline-none focus:ring-1 focus:ring-stone-300 dark:focus:ring-stone-600 text-sm font-semibold"
              />
              <div className="flex gap-1.5 shrink-0">
                {[10, 20, 30].map(m => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setDurationMinutes(m)}
                    className={`px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                      durationMinutes === m 
                        ? 'bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900' 
                        : 'bg-stone-200 dark:bg-[#33332f] text-stone-700 dark:text-stone-300'
                    }`}
                  >
                    {m}m
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {habitType === 'counter' && (
        <div className="p-3.5 bg-stone-50 dark:bg-[#252522] border border-stone-100/80 dark:border-[#2e2e2a] rounded-2xl space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-stone-700 dark:text-stone-300 mb-1 text-[11px]">
                Target Angka Harian
              </label>
              <input
                type="number"
                min="0.1"
                step="any"
                placeholder="Misal: 2 atau 8"
                value={targetCount}
                onChange={(e) => setTargetCount(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-[#1c1c1a] border border-stone-200/80 dark:border-[#33332f] rounded-xl text-stone-900 dark:text-[#f4f4f1] focus:outline-none focus:ring-1 focus:ring-stone-300 dark:focus:ring-stone-600 text-sm font-semibold"
              />
              <span className="text-[10px] text-stone-400 dark:text-stone-500 mt-1 block">
                Mendukung angka & desimal (misal: 2 liter)
              </span>
            </div>
            <div>
              <label className="block font-medium text-stone-700 dark:text-stone-300 mb-1 text-[11px]">
                Satuan Target
              </label>
              <input
                type="text"
                placeholder="Liter, Gelas, Menit, dll."
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-[#1c1c1a] border border-stone-200/80 dark:border-[#33332f] rounded-xl text-stone-900 dark:text-[#f4f4f1] focus:outline-none focus:ring-1 focus:ring-stone-300 dark:focus:ring-stone-600 text-sm"
              />
              <span className="text-[10px] text-stone-400 dark:text-stone-500 mt-1 block">
                Nama satuan hitungan
              </span>
            </div>
          </div>

          <div>
            <div className="text-[10px] font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider mb-1.5">
              Pilihan Satuan Cepat
            </div>
            <div className="flex flex-wrap gap-1.5">
              {SUGGESTED_UNITS.map((u) => (
                <button
                  key={u}
                  type="button"
                  onClick={() => setUnit(u)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] transition ${
                    unit.toLowerCase() === u.toLowerCase()
                      ? 'bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 font-semibold'
                      : 'bg-white dark:bg-[#1c1c1a] border border-stone-200/60 dark:border-[#33332f] text-stone-600 dark:text-stone-300 hover:bg-stone-200/80 dark:hover:bg-[#2e2e2a]'
                  }`}
                >
                  {u}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="text-[10px] font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider mb-1.5">
              Contoh Rekomendasi Target
            </div>
            <div className="flex flex-wrap gap-1.5">
              {TARGET_PRESETS.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => {
                    if (!title || title === 'Minum Air Putih' || title === 'Membaca Buku') {
                      setTitle(preset.label);
                    }
                    setTargetCount(preset.target);
                    setUnit(preset.unit);
                    setCategory(preset.cat);
                    setIcon(preset.icon);
                    setColor(preset.color);
                  }}
                  className="px-2.5 py-1 bg-white dark:bg-[#1c1c1a] border border-stone-200/60 dark:border-[#33332f] hover:bg-emerald-50 dark:hover:bg-emerald-950/40 hover:text-emerald-800 dark:hover:text-emerald-300 rounded-lg text-[11px] text-stone-700 dark:text-stone-300 transition"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
