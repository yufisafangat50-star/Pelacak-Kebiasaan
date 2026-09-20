import React, { useState, useEffect } from 'react';
import { X, Check, Link as LinkIcon, Sparkles } from 'lucide-react';
import { Habit, Category, TimeOfDay, Frequency, HabitType } from '../types';
import { CATEGORY_DETAILS, TIME_OF_DAY_LABELS, FREQUENCY_LABELS } from '../data/defaultHabits';
import { HabitIcon, AVAILABLE_ICONS } from './HabitIcon';
import { HabitFormTypeSelector } from './habit/HabitFormTypeSelector';
import { HabitFormSchedule } from './habit/HabitFormSchedule';

interface HabitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (habitData: Omit<Habit, 'id' | 'createdAt' | 'completedDates'> & { id?: string }) => void;
  editingHabit?: Habit | null;
  existingHabits?: Habit[];
  preselectedParentHabitId?: string;
}

const PRESET_COLORS = [
  '#059669', // Emerald
  '#0284c7', // Sky
  '#4f46e5', // Indigo
  '#d97706', // Amber
  '#0891b2', // Cyan
  '#e11d48', // Rose
  '#0d9488', // Teal
  '#52525b', // Zinc
];

export const HabitModal: React.FC<HabitModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingHabit,
  existingHabits = [],
  preselectedParentHabitId,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<Category>('kesehatan');
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>('anytime');
  const [frequency, setFrequency] = useState<Frequency>('daily');
  const [habitType, setHabitType] = useState<HabitType>('boolean');
  const [targetCount, setTargetCount] = useState<string>('8');
  const [durationMinutes, setDurationMinutes] = useState<number>(10);
  const [unit, setUnit] = useState('Gelas');
  const [color, setColor] = useState(PRESET_COLORS[0]);
  const [icon, setIcon] = useState(AVAILABLE_ICONS[0]);
  const [stackParentHabitId, setStackParentHabitId] = useState<string>('');
  const [triggerCue, setTriggerCue] = useState<string>('');
  const [isStackingOpen, setIsStackingOpen] = useState(false);
  const [error, setError] = useState('');

  // Candidates for parent habit (exclude current habit being edited)
  const availableParentHabits = existingHabits.filter(
    (h) => !editingHabit || h.id !== editingHabit.id
  );

  useEffect(() => {
    if (editingHabit) {
      setTitle(editingHabit.title);
      setDescription(editingHabit.description || '');
      setCategory(editingHabit.category);
      setTimeOfDay(editingHabit.timeOfDay);
      setFrequency(editingHabit.frequency);
      setHabitType(editingHabit.habitType || 'boolean');
      setTargetCount(editingHabit.targetCount ? String(editingHabit.targetCount) : '8');
      setDurationMinutes(editingHabit.durationMinutes || 10);
      setUnit(editingHabit.unit || 'Gelas');
      setColor(editingHabit.color || PRESET_COLORS[0]);
      setIcon(editingHabit.icon || AVAILABLE_ICONS[0]);
      setStackParentHabitId(editingHabit.stackParentHabitId || '');
      setTriggerCue(editingHabit.triggerCue || '');
      setIsStackingOpen(!!(editingHabit.stackParentHabitId || editingHabit.triggerCue));
    } else {
      setTitle('');
      setDescription('');
      setCategory('kesehatan');
      setTimeOfDay('anytime');
      setFrequency('daily');
      setHabitType('boolean');
      setTargetCount('8');
      setDurationMinutes(10);
      setUnit('Gelas');
      setColor(PRESET_COLORS[0]);
      setIcon(AVAILABLE_ICONS[0]);
      setStackParentHabitId(preselectedParentHabitId || '');
      setTriggerCue('');
      setIsStackingOpen(!!preselectedParentHabitId);
    }
    setError('');
  }, [editingHabit, isOpen, preselectedParentHabitId]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Nama kebiasaan wajib diisi.');
      return;
    }

    let parsedCount = 1;
    if (habitType === 'counter') {
      parsedCount = parseFloat(targetCount);
      if (isNaN(parsedCount) || parsedCount <= 0) {
        setError('Target angka harian harus berupa angka lebih besar dari 0.');
        return;
      }
    }

    onSave({
      id: editingHabit ? editingHabit.id : undefined,
      title: title.trim(),
      description: description.trim() || undefined,
      category,
      timeOfDay,
      frequency,
      color,
      icon,
      habitType,
      targetCount: habitType === 'counter' ? parsedCount : undefined,
      durationMinutes: habitType === 'timer' ? Math.max(1, durationMinutes) : undefined,
      unit: habitType === 'counter' ? (unit.trim() || 'Kali') : undefined,
      stackParentHabitId: stackParentHabitId || undefined,
      triggerCue: triggerCue.trim() ? triggerCue.trim() : undefined,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-xs p-0 sm:p-4">
      {/* Click outside backdrop */}
      <div className="fixed inset-0" onClick={onClose} />

      {/* Bottom Sheet Container */}
      <div className="relative bg-white dark:bg-[#1c1c1a] border border-transparent dark:border-[#282825] w-full max-w-md rounded-t-3xl sm:rounded-2xl shadow-2xl max-h-[90vh] flex flex-col z-10 overflow-hidden transition-colors">
        {/* Grab Handle for mobile */}
        <div className="pt-3 pb-1 flex justify-center sm:hidden">
          <div className="w-10 h-1.5 bg-stone-200 dark:bg-[#33332f] rounded-full" />
        </div>

        {/* Header */}
        <div className="px-5 py-3 border-b border-stone-100 dark:border-[#282825] flex items-center justify-between">
          <h3 className="text-base font-bold text-stone-900 dark:text-[#f4f4f1]">
            {editingHabit ? 'Ubah Kebiasaan' : 'Kebiasaan Baru'}
          </h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full text-stone-400 dark:text-stone-500 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-[#282825] flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto flex-1 text-xs">
          {error && (
            <div className="p-2.5 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 rounded-xl font-medium border border-rose-100 dark:border-rose-900/40">
              {error}
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
              Nama Kebiasaan <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: Minum Air Putih, Olahraga..."
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (error) setError('');
              }}
              className="w-full px-3.5 py-2.5 bg-stone-100/70 dark:bg-[#252522] border border-transparent dark:border-[#2e2e2a] rounded-xl text-stone-900 dark:text-[#f4f4f1] text-sm placeholder:text-stone-400 dark:placeholder:text-stone-500 focus:outline-none focus:bg-white dark:focus:bg-[#1e1e1b] focus:ring-1 focus:ring-stone-300 dark:focus:ring-stone-600 transition"
              autoFocus
            />
          </div>

          {/* Description */}
          <div>
            <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
              Deskripsi Singkat (Opsional)
            </label>
            <input
              type="text"
              placeholder="Contoh: 8 gelas sehari untuk hidrasi tubuh"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2 bg-stone-100/70 dark:bg-[#252522] border border-transparent dark:border-[#2e2e2a] rounded-xl text-stone-900 dark:text-[#f4f4f1] placeholder:text-stone-400 dark:placeholder:text-stone-500 focus:outline-none focus:bg-white dark:focus:bg-[#1e1e1b] focus:ring-1 focus:ring-stone-300 dark:focus:ring-stone-600 transition"
            />
          </div>

          <HabitFormTypeSelector
            habitType={habitType}
            setHabitType={setHabitType}
            durationMinutes={durationMinutes}
            setDurationMinutes={setDurationMinutes}
            targetCount={targetCount}
            setTargetCount={setTargetCount}
            unit={unit}
            setUnit={setUnit}
            title={title}
            setTitle={setTitle}
            setCategory={setCategory}
            setIcon={setIcon}
            setColor={setColor}
          />

          <HabitFormSchedule
            category={category}
            setCategory={setCategory}
            frequency={frequency}
            setFrequency={setFrequency}
            timeOfDay={timeOfDay}
            setTimeOfDay={setTimeOfDay}
            isStackingOpen={isStackingOpen}
            setIsStackingOpen={setIsStackingOpen}
            stackParentHabitId={stackParentHabitId}
            setStackParentHabitId={setStackParentHabitId}
            triggerCue={triggerCue}
            setTriggerCue={setTriggerCue}
            availableParentHabits={availableParentHabits}
            title={title}
          />

          {/* Icon & Color Selection */}
          <div>
            <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
              Ikon
            </label>
            <div className="grid grid-cols-6 gap-2">
              {AVAILABLE_ICONS.map((iconName) => {
                const isSelected = icon === iconName;
                return (
                  <button
                    key={iconName}
                    type="button"
                    onClick={() => setIcon(iconName)}
                    className={`h-9 rounded-xl flex items-center justify-center transition ${
                      isSelected
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-stone-100 dark:bg-[#252522] text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-[#2e2e2a]'
                    }`}
                  >
                    <HabitIcon name={iconName} className="w-4 h-4" />
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
              Warna Aksen
            </label>
            <div className="flex items-center gap-2 flex-wrap">
              {PRESET_COLORS.map((c) => {
                const isSelected = color === c;
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className="w-7 h-7 rounded-full flex items-center justify-center transition ring-1 ring-black/5 dark:ring-white/10"
                    style={{ backgroundColor: c }}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5 text-white stroke-[3]" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Submit Action */}
          <div className="pt-3 border-t border-stone-100 dark:border-[#282825] flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200 font-medium rounded-xl"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold rounded-xl shadow-xs transition active:scale-95"
            >
              {editingHabit ? 'Simpan Perubahan' : 'Buat Kebiasaan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
