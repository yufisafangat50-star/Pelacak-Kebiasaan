import React from 'react';
import { AlertCircle } from 'lucide-react';

interface TrackerEmptyStateProps {
  onOpenPackModal: () => void;
  onAddManual: () => void;
}

export const TrackerEmptyState: React.FC<TrackerEmptyStateProps> = ({
  onOpenPackModal,
  onAddManual,
}) => {
  return (
    <div className="bg-white dark:bg-[#1c1c1a] dark:border dark:border-[#282825] rounded-2xl p-8 text-center mt-2 shadow-[0_1px_3px_rgba(0,0,0,0.03)] dark:shadow-none transition-colors">
      <div className="w-10 h-10 rounded-full bg-stone-100 dark:bg-[#282825] text-stone-400 dark:text-stone-500 mx-auto flex items-center justify-center mb-2.5">
        <AlertCircle className="w-5 h-5" />
      </div>
      <h3 className="text-sm font-bold text-stone-900 dark:text-[#f4f4f1] mb-1">
        Tidak Ada Kebiasaan
      </h3>
      <p className="text-xs text-stone-500 dark:text-stone-400 mb-4">
        Tidak ada rutinitas yang dijadwalkan pada filter atau tanggal ini.
      </p>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        <button
          onClick={onOpenPackModal}
          className="px-4 py-2 bg-stone-800 hover:bg-stone-700 dark:bg-stone-100 dark:hover:bg-white text-white dark:text-stone-900 text-xs font-semibold rounded-xl shadow-xs transition"
        >
          Pilih dari Template
        </button>
        <button
          onClick={onAddManual}
          className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-xl shadow-xs transition"
        >
          Tambah Manual
        </button>
      </div>
    </div>
  );
};
