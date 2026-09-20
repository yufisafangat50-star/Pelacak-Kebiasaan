import React from 'react';
import { Link as LinkIcon } from 'lucide-react';
import { Category, Frequency, TimeOfDay, Habit } from '../../types';
import { CATEGORY_DETAILS, FREQUENCY_LABELS, TIME_OF_DAY_LABELS } from '../../data/defaultHabits';

interface HabitFormScheduleProps {
  category: Category;
  setCategory: (cat: Category) => void;
  frequency: Frequency;
  setFrequency: (freq: Frequency) => void;
  timeOfDay: TimeOfDay;
  setTimeOfDay: (time: TimeOfDay) => void;
  isStackingOpen: boolean;
  setIsStackingOpen: (open: boolean) => void;
  stackParentHabitId: string;
  setStackParentHabitId: (id: string) => void;
  triggerCue: string;
  setTriggerCue: (cue: string) => void;
  availableParentHabits: Habit[];
  title: string;
}

export const HabitFormSchedule: React.FC<HabitFormScheduleProps> = ({
  category,
  setCategory,
  frequency,
  setFrequency,
  timeOfDay,
  setTimeOfDay,
  isStackingOpen,
  setIsStackingOpen,
  stackParentHabitId,
  setStackParentHabitId,
  triggerCue,
  setTriggerCue,
  availableParentHabits,
  title,
}) => {
  return (
    <>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
            Kategori
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as Category)}
            className="w-full px-3 py-2 bg-stone-100/70 dark:bg-[#252522] border border-transparent dark:border-[#2e2e2a] rounded-xl text-stone-900 dark:text-[#f4f4f1] focus:outline-none focus:bg-white dark:focus:bg-[#1e1e1b] focus:ring-1 focus:ring-stone-300 dark:focus:ring-stone-600 transition"
          >
            {Object.entries(CATEGORY_DETAILS).map(([key, info]) => (
              <option key={key} value={key} className="bg-white dark:bg-[#1c1c1a] text-stone-900 dark:text-[#f4f4f1]">
                {info.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
            Frekuensi
          </label>
          <select
            value={frequency}
            onChange={(e) => setFrequency(e.target.value as Frequency)}
            className="w-full px-3 py-2 bg-stone-100/70 dark:bg-[#252522] border border-transparent dark:border-[#2e2e2a] rounded-xl text-stone-900 dark:text-[#f4f4f1] focus:outline-none focus:bg-white dark:focus:bg-[#1e1e1b] focus:ring-1 focus:ring-stone-300 dark:focus:ring-stone-600 transition"
          >
            {Object.entries(FREQUENCY_LABELS).map(([key, label]) => (
              <option key={key} value={key} className="bg-white dark:bg-[#1c1c1a] text-stone-900 dark:text-[#f4f4f1]">
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
          Waktu Pelaksanaan
        </label>
        <div className="grid grid-cols-5 gap-1.5">
          {(Object.keys(TIME_OF_DAY_LABELS) as TimeOfDay[]).map((timeKey) => {
            const isSelected = timeOfDay === timeKey;
            return (
              <button
                key={timeKey}
                type="button"
                onClick={() => setTimeOfDay(timeKey)}
                className={`py-1.5 px-1 rounded-lg text-center font-medium transition ${
                  isSelected
                    ? 'bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900'
                    : 'bg-stone-100 dark:bg-[#252522] text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-[#2e2e2a]'
                }`}
              >
                {TIME_OF_DAY_LABELS[timeKey].label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="p-3.5 bg-stone-50 dark:bg-[#252522] border border-stone-200/70 dark:border-[#2e2e2a] rounded-2xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <LinkIcon className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <div>
              <div className="text-xs font-bold text-stone-900 dark:text-[#f4f4f1] flex items-center gap-1.5">
                <span>Habit Stacking (Alur Kebiasaan)</span>
                <span className="text-[9px] px-1 py-0.2 rounded bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 font-mono">
                  Atomic Habits
                </span>
              </div>
              <p className="text-[11px] text-stone-500 dark:text-stone-400">
                Tautkan kebiasaan ini setelah kebiasaan rutin lain
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsStackingOpen(!isStackingOpen)}
            className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 hover:underline"
          >
            {isStackingOpen ? 'Sembunyikan' : 'Aktifkan'}
          </button>
        </div>

        {isStackingOpen && (
          <div className="space-y-3 pt-1 border-t border-stone-200/50 dark:border-[#33332f]">
            <div>
              <label className="block font-medium text-stone-700 dark:text-stone-300 mb-1 text-[11px]">
                Dikerjakan Setelah Kebiasaan:
              </label>
              <select
                value={stackParentHabitId}
                onChange={(e) => {
                  const selectedId = e.target.value;
                  setStackParentHabitId(selectedId);
                  const parent = availableParentHabits.find((h) => h.id === selectedId);
                  if (parent && !triggerCue) {
                    setTriggerCue(`Setelah selesai ${parent.title}`);
                  }
                }}
                className="w-full px-3 py-2 bg-white dark:bg-[#1c1c1a] border border-stone-200/80 dark:border-[#33332f] rounded-xl text-stone-900 dark:text-[#f4f4f1] text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                <option value="">-- Mandiri (Bukan bagian alur) --</option>
                {availableParentHabits.map((parent) => (
                  <option key={parent.id} value={parent.id}>
                    {parent.title} ({TIME_OF_DAY_LABELS[parent.timeOfDay]?.label || parent.timeOfDay})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-medium text-stone-700 dark:text-stone-300 mb-1 text-[11px]">
                Pemicu / Kalimat Alur:
              </label>
              <input
                type="text"
                placeholder="Contoh: Setelah selesai olahraga pagi / Setelah minum kopi"
                value={triggerCue}
                onChange={(e) => setTriggerCue(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-[#1c1c1a] border border-stone-200/80 dark:border-[#33332f] rounded-xl text-stone-900 dark:text-[#f4f4f1] text-xs placeholder:text-stone-400 dark:placeholder:text-stone-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
              <span className="text-[10px] text-stone-500 dark:text-stone-400 mt-1 block">
                Formula: &ldquo;Setelah [Pemicu], saya akan [{title || 'melakukan kebiasaan ini'}]&rdquo;
              </span>
            </div>
          </div>
        )}
      </div>
    </>
  );
};
