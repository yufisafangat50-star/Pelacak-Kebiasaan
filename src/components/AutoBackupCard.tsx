import React, { useState } from 'react';
import {
  ShieldCheck,
  Save,
  RotateCcw,
  Trash2,
  ChevronDown,
  ChevronUp,
  Clock,
  CheckCircle2,
  HardDrive,
  AlertCircle,
} from 'lucide-react';
import { DailyBackup } from '../types';
import { formatIndonesianDate, formatShortDate, getTodayStr } from '../utils/dateUtils';

interface AutoBackupCardProps {
  dailyBackups: DailyBackup[];
  onCreateManualBackup: () => void;
  onRestoreDailyBackup: (backup: DailyBackup) => void;
  onDeleteDailyBackup: (backupId: string) => void;
}

export const AutoBackupCard: React.FC<AutoBackupCardProps> = ({
  dailyBackups,
  onCreateManualBackup,
  onRestoreDailyBackup,
  onDeleteDailyBackup,
}) => {
  const [isHistoryExpanded, setIsHistoryExpanded] = useState(false);
  const todayStr = getTodayStr();
  const latestBackup = dailyBackups.length > 0 ? dailyBackups[0] : null;

  const handleRestore = (backup: DailyBackup) => {
    const isToday = backup.dateStr === todayStr;
    const dateLabel = isToday ? 'Hari Ini' : formatIndonesianDate(backup.dateStr, true);
    const confirmMessage = `Pulihkan data dari cadangan "${dateLabel} (${backup.timeStr})"?\n\nData kebiasaan saat ini akan digantikan dengan ${backup.habitsCount} kebiasaan dari cadangan tersebut.`;

    if (window.confirm(confirmMessage)) {
      onRestoreDailyBackup(backup);
    }
  };

  const handleDelete = (backup: DailyBackup, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(`Hapus cadangan tanggal ${formatShortDate(backup.dateStr)} (${backup.timeStr})?`)) {
      onDeleteDailyBackup(backup.id);
    }
  };

  return (
    <div className="bg-white dark:bg-[#1c1c1a] border border-transparent dark:border-[#282825] rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.03)] dark:shadow-none p-4 space-y-3.5 transition-colors">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-stone-900 dark:text-[#f4f4f1] text-sm">
                Cadangan Harian Otomatis
              </h3>
            </div>
            <p className="text-[11px] text-stone-500 dark:text-stone-400">
              Disimpan otomatis ke browser setiap hari agar progres aman
            </p>
          </div>
        </div>

        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-full shrink-0">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Aktif
        </span>
      </div>

      {/* Latest Backup Status Box */}
      <div className="p-3 bg-stone-50/90 dark:bg-[#252522] rounded-xl border border-stone-100 dark:border-[#2f2f2a] flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="text-[10px] uppercase tracking-wider font-semibold text-stone-400 dark:text-stone-500 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>Status Cadangan Terakhir</span>
          </div>
          {latestBackup ? (
            <div className="mt-0.5">
              <span className="text-xs font-bold text-stone-900 dark:text-[#f4f4f1]">
                {latestBackup.dateStr === todayStr ? 'Hari ini' : formatShortDate(latestBackup.dateStr)}
                {', pukul '}
                {latestBackup.timeStr}
              </span>
              <span className="block text-[11px] text-stone-500 dark:text-stone-400">
                {latestBackup.habitsCount} kebiasaan • {latestBackup.totalCompletions} kali diselesaikan
              </span>
            </div>
          ) : (
            <div className="text-xs text-stone-600 dark:text-stone-300 mt-0.5">
              Belum ada rekaman cadangan hari ini.
            </div>
          )}
        </div>

        {/* Manual Instant Backup Action */}
        <button
          onClick={onCreateManualBackup}
          className="px-3 py-1.5 bg-white dark:bg-[#33332f] hover:bg-stone-100 dark:hover:bg-[#3d3d38] border border-stone-200/80 dark:border-[#40403a] text-stone-800 dark:text-stone-200 active:scale-95 text-xs font-semibold rounded-lg shadow-2xs flex items-center gap-1.5 shrink-0 transition"
          title="Simpan titik pemulihan cadangan saat ini sekarang"
        >
          <Save className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>Cadangkan Sekarang</span>
        </button>
      </div>

      {/* Collapsible History Section */}
      <div className="pt-1 border-t border-stone-100 dark:border-[#282825]">
        <button
          type="button"
          onClick={() => setIsHistoryExpanded(!isHistoryExpanded)}
          className="w-full flex items-center justify-between py-1 text-xs text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white transition"
        >
          <span className="font-semibold flex items-center gap-1.5">
            <HardDrive className="w-3.5 h-3.5 text-stone-400" />
            Riwayat Titik Pemulihan ({dailyBackups.length})
          </span>
          <div className="flex items-center gap-1 text-[11px] text-stone-400">
            <span>{isHistoryExpanded ? 'Tutup' : 'Lihat'}</span>
            {isHistoryExpanded ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
          </div>
        </button>

        {isHistoryExpanded && (
          <div className="mt-2 space-y-1.5 max-h-56 overflow-y-auto pr-0.5">
            {dailyBackups.length === 0 ? (
              <div className="p-3 text-center text-xs text-stone-400 dark:text-stone-500 bg-stone-50 dark:bg-[#22221f] rounded-xl">
                Belum ada arsip cadangan tersimpan.
              </div>
            ) : (
              dailyBackups.map((b) => {
                const isToday = b.dateStr === todayStr;
                return (
                  <div
                    key={b.id}
                    className="p-2.5 bg-stone-50 dark:bg-[#22221f] hover:bg-stone-100/80 dark:hover:bg-[#282825] border border-stone-100 dark:border-[#282825] rounded-xl flex items-center justify-between gap-2 transition"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-stone-900 dark:text-[#f4f4f1] text-xs">
                          {isToday ? 'Hari Ini' : formatShortDate(b.dateStr)}
                        </span>
                        <span className="text-[10px] text-stone-400 font-mono">
                          {b.timeStr}
                        </span>
                        <span
                          className={`text-[9px] font-semibold px-1.5 py-0.2 rounded-md ${
                            b.isAuto
                              ? 'bg-stone-200/70 dark:bg-[#33332f] text-stone-600 dark:text-stone-300'
                              : 'bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300'
                          }`}
                        >
                          {b.isAuto ? 'Otomatis' : 'Manual'}
                        </span>
                      </div>
                      <span className="text-[10px] text-stone-400 dark:text-stone-500 block truncate">
                        {b.habitsCount} kebiasaan • {b.totalCompletions} kali selesai
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => handleRestore(b)}
                        className="px-2 py-1 rounded-lg bg-white dark:bg-[#2f2f2b] hover:bg-emerald-50 dark:hover:bg-emerald-950/40 border border-stone-200 dark:border-[#383834] text-stone-700 dark:text-stone-200 hover:text-emerald-700 dark:hover:text-emerald-300 text-[10px] font-semibold flex items-center gap-1 transition"
                        title="Pulihkan data dari cadangan ini"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Pulihkan</span>
                      </button>

                      <button
                        onClick={(e) => handleDelete(b, e)}
                        className="p-1 rounded-lg text-stone-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                        title="Hapus rekaman cadangan ini"
                        aria-label="Hapus cadangan"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* Retention info */}
      <div className="flex items-center gap-1.5 text-[10px] text-stone-400 dark:text-stone-500 pt-0.5">
        <AlertCircle className="w-3.5 h-3.5 shrink-0 text-stone-400" />
        <span>
          Menyimpan hingga 14 hari riwayat cadangan harian di penyimpanan browser Anda.
        </span>
      </div>
    </div>
  );
};
