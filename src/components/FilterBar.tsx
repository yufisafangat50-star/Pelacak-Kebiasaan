import React from 'react';
import { Search, Filter, X } from 'lucide-react';
import { Category, TimeOfDay } from '../types';
import { CATEGORY_DETAILS, TIME_OF_DAY_LABELS } from '../data/defaultHabits';

interface FilterBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: Category | 'all';
  setSelectedCategory: (cat: Category | 'all') => void;
  selectedTimeOfDay: TimeOfDay | 'all';
  setSelectedTimeOfDay: (time: TimeOfDay | 'all') => void;
  completionFilter: 'all' | 'pending' | 'completed';
  setCompletionFilter: (status: 'all' | 'pending' | 'completed') => void;
  totalHabitsCount: number;
  filteredCount: number;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  selectedTimeOfDay,
  setSelectedTimeOfDay,
  completionFilter,
  setCompletionFilter,
  totalHabitsCount,
  filteredCount,
}) => {
  const categories = Object.keys(CATEGORY_DETAILS) as Category[];
  const times: (TimeOfDay | 'all')[] = ['all', 'pagi', 'siang', 'sore', 'malam', 'anytime'];

  const hasActiveFilters =
    searchQuery.trim() !== '' ||
    selectedCategory !== 'all' ||
    selectedTimeOfDay !== 'all' ||
    completionFilter !== 'all';

  const clearAllFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedTimeOfDay('all');
    setCompletionFilter('all');
  };

  return (
    <div className="space-y-3 bg-white dark:bg-[#1c1c1a] p-4 rounded-2xl border border-stone-200/80 dark:border-[#282825] shadow-xs transition-colors">
      {/* Search & Status Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search Field */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-stone-400 dark:text-stone-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari nama kebiasaan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-8 py-2 bg-stone-50 dark:bg-[#252522] border border-stone-200 dark:border-[#2e2e2a] rounded-xl text-xs sm:text-sm text-stone-900 dark:text-[#f4f4f1] placeholder:text-stone-400 dark:placeholder:text-stone-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 dark:text-stone-500 hover:text-stone-600 dark:hover:text-stone-300 p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-1.5 p-1 bg-stone-100 dark:bg-[#252522] rounded-xl border border-stone-200/70 dark:border-[#2e2e2a] text-xs self-start sm:self-auto">
          <button
            onClick={() => setCompletionFilter('all')}
            className={`px-2.5 py-1 rounded-lg transition ${
              completionFilter === 'all'
                ? 'bg-white dark:bg-[#33332f] text-stone-900 dark:text-[#f4f4f1] font-semibold shadow-xs'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
            }`}
          >
            Semua ({totalHabitsCount})
          </button>
          <button
            onClick={() => setCompletionFilter('pending')}
            className={`px-2.5 py-1 rounded-lg transition ${
              completionFilter === 'pending'
                ? 'bg-white dark:bg-[#33332f] text-amber-800 dark:text-amber-400 font-semibold shadow-xs'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
            }`}
          >
            Belum
          </button>
          <button
            onClick={() => setCompletionFilter('completed')}
            className={`px-2.5 py-1 rounded-lg transition ${
              completionFilter === 'completed'
                ? 'bg-white dark:bg-[#33332f] text-emerald-800 dark:text-emerald-400 font-semibold shadow-xs'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
            }`}
          >
            Selesai
          </button>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs scrollbar-thin">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-3 py-1.5 rounded-xl whitespace-nowrap font-medium transition ${
            selectedCategory === 'all'
              ? 'bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 shadow-xs'
              : 'bg-stone-100 dark:bg-[#252522] text-stone-600 dark:text-stone-300 hover:bg-stone-200/80 dark:hover:bg-[#2e2e2a]'
          }`}
        >
          Semua Kategori
        </button>

        {categories.map((cat) => {
          const catInfo = CATEGORY_DETAILS[cat];
          const isSelected = selectedCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(isSelected ? 'all' : cat)}
              className={`px-3 py-1.5 rounded-xl whitespace-nowrap font-medium transition border ${
                isSelected
                  ? 'bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 border-stone-900 dark:border-stone-100 shadow-xs'
                  : 'bg-stone-50 dark:bg-[#252522] text-stone-700 dark:text-stone-300 border-stone-200 dark:border-[#2e2e2a] hover:bg-stone-100 dark:hover:bg-[#2e2e2a]'
              }`}
            >
              {catInfo.label}
            </button>
          );
        })}
      </div>

      {/* Active Filter Clear Helper */}
      {hasActiveFilters && (
        <div className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-400 pt-1 border-t border-stone-100 dark:border-[#282825]">
          <span>
            Menampilkan <strong className="text-stone-800 dark:text-stone-200">{filteredCount}</strong> dari {totalHabitsCount} kebiasaan
          </span>
          <button
            onClick={clearAllFilters}
            className="text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 font-medium flex items-center gap-1"
          >
            <X className="w-3 h-3" />
            <span>Reset Filter</span>
          </button>
        </div>
      )}
    </div>
  );
};
