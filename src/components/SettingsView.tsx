import React from 'react';
import {
  Download,
  Upload,
  RotateCcw,
  Volume2,
  VolumeX,
  Shield,
  Bell,
  Smartphone,
  CheckCircle2,
  Send,
  Clock,
  AlertTriangle,
  Moon,
  Sun,
  Laptop,
} from 'lucide-react';
import { ReminderSettings, ThemeMode, DailyBackup } from '../types';
import { PWAInstallBanner } from './PWAInstallBanner';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { AutoBackupCard } from './AutoBackupCard';

interface SettingsViewProps {
  soundEnabled: boolean;
  setSoundEnabled: (val: boolean) => void;
  reminderSettings: ReminderSettings;
  onUpdateReminderSettings: (settings: ReminderSettings) => void;
  notificationPermission: NotificationPermission | 'unsupported';
  onRequestSystemPermission: () => void;
  onTriggerSystemTest: () => void;
  onExport: () => void;
  onImport: () => void;
  onReset: () => void;
  habitsCount: number;
  themeMode?: ThemeMode;
  setThemeMode?: (mode: ThemeMode) => void;
  dailyBackups?: DailyBackup[];
  onCreateManualBackup?: () => void;
  onRestoreDailyBackup?: (backup: DailyBackup) => void;
  onDeleteDailyBackup?: (backupId: string) => void;
  isDynamicThemeEnabled?: boolean;
  setIsDynamicThemeEnabled?: (val: boolean) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  soundEnabled,
  setSoundEnabled,
  reminderSettings,
  onUpdateReminderSettings,
  notificationPermission,
  onRequestSystemPermission,
  onTriggerSystemTest,
  onExport,
  onImport,
  onReset,
  habitsCount,
  themeMode = 'system',
  setThemeMode,
  dailyBackups = [],
  onCreateManualBackup,
  onRestoreDailyBackup,
  onDeleteDailyBackup,
  isDynamicThemeEnabled = true,
  setIsDynamicThemeEnabled,
}) => {
  const { isInstalled } = usePWAInstall();

  const handleToggleSlot = (slot: keyof ReminderSettings['reminderSlots']) => {
    onUpdateReminderSettings({
      ...reminderSettings,
      reminderSlots: {
        ...reminderSettings.reminderSlots,
        [slot]: !reminderSettings.reminderSlots[slot],
      },
    });
  };

  const handleToggleSystemNotification = async () => {
    if (!reminderSettings.systemNotificationsEnabled) {
      if (notificationPermission !== 'granted') {
        onRequestSystemPermission();
      }
      onUpdateReminderSettings({
        ...reminderSettings,
        systemNotificationsEnabled: true,
      });
    } else {
      onUpdateReminderSettings({
        ...reminderSettings,
        systemNotificationsEnabled: false,
      });
    }
  };

  const handleToggleInAppAlerts = () => {
    onUpdateReminderSettings({
      ...reminderSettings,
      inAppAlertsEnabled: !reminderSettings.inAppAlertsEnabled,
    });
  };

  return (
    <div className="space-y-4 text-xs">
      {/* Theme Appearance Section (Stone & Charcoal Dark Mode) */}
      <div className="bg-white dark:bg-[#1c1c1a] border border-transparent dark:border-[#282825] rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.03)] dark:shadow-none p-4 space-y-3 transition-colors">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-stone-100 dark:bg-[#282825] text-stone-700 dark:text-stone-300 flex items-center justify-center">
            <Moon className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-stone-900 dark:text-[#f4f4f1] text-sm">Tema Tampilan</h3>
            <p className="text-[11px] text-stone-500 dark:text-stone-400">
              Stone gelap & charcoal yang nyaman di mata malam hari
            </p>
          </div>
        </div>

        {setThemeMode && (
          <div className="grid grid-cols-3 gap-2 pt-1">
            <button
              type="button"
              onClick={() => setThemeMode('light')}
              className={`py-2 px-3 rounded-xl font-medium flex flex-col items-center gap-1.5 transition ${
                themeMode === 'light'
                  ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 shadow-xs'
                  : 'bg-stone-50 dark:bg-[#252522] text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-[#2e2e2a]'
              }`}
            >
              <Sun className="w-4 h-4" />
              <span className="text-[11px]">Terang</span>
            </button>

            <button
              type="button"
              onClick={() => setThemeMode('dark')}
              className={`py-2 px-3 rounded-xl font-medium flex flex-col items-center gap-1.5 transition ${
                themeMode === 'dark'
                  ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 shadow-xs'
                  : 'bg-stone-50 dark:bg-[#252522] text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-[#2e2e2a]'
              }`}
            >
              <Moon className="w-4 h-4 text-amber-400" />
              <span className="text-[11px]">Gelap</span>
            </button>

            <button
              type="button"
              onClick={() => setThemeMode('system')}
              className={`py-2 px-3 rounded-xl font-medium flex flex-col items-center gap-1.5 transition ${
                themeMode === 'system'
                  ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 shadow-xs'
                  : 'bg-stone-50 dark:bg-[#252522] text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-[#2e2e2a]'
              }`}
            >
              <Laptop className="w-4 h-4" />
              <span className="text-[11px]">Otomatis</span>
            </button>
          </div>
        )}

        {/* Dynamic Theme Toggle */}
        {setIsDynamicThemeEnabled && (
          <div className="pt-2 border-t border-stone-100 dark:border-[#282825] mt-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold text-stone-900 dark:text-[#f4f4f1]">Penyaring Cahaya Biru</div>
                <div className="text-[11px] text-stone-500 dark:text-stone-400">
                  Layar meredup dengan warna hangat otomatis di malam hari
                </div>
              </div>

              <button
                onClick={() => setIsDynamicThemeEnabled(!isDynamicThemeEnabled)}
                className={`w-11 h-6 rounded-full transition-colors relative p-0.5 shrink-0 ${
                  isDynamicThemeEnabled ? 'bg-amber-500' : 'bg-stone-200 dark:bg-[#33332f]'
                }`}
                aria-label="Toggle Penyaring Cahaya Biru"
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    isDynamicThemeEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* PWA Phone Installation Section */}
      <div className="bg-white dark:bg-[#1c1c1a] border border-transparent dark:border-[#282825] rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.03)] dark:shadow-none p-4 space-y-3 transition-colors">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 flex items-center justify-center">
              <Smartphone className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-stone-900 dark:text-[#f4f4f1] text-sm">Aplikasi Ponsel (PWA)</h3>
              <p className="text-[11px] text-stone-500 dark:text-stone-400">
                {isInstalled
                  ? 'Berjalan dalam mode aplikasi layar utama'
                  : 'Pasang ke layar beranda handphone'}
              </p>
            </div>
          </div>

          <div>
            {isInstalled ? (
              <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-1 rounded-lg">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Terpasang</span>
              </span>
            ) : (
              <PWAInstallBanner compact={true} />
            )}
          </div>
        </div>
      </div>

      {/* Notifications Management Section */}
      <div className="bg-white dark:bg-[#1c1c1a] border border-transparent dark:border-[#282825] rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.03)] dark:shadow-none p-4 space-y-3 transition-colors">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-stone-100 dark:bg-[#282825] text-stone-700 dark:text-stone-300 flex items-center justify-center">
            <Bell className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-stone-900 dark:text-[#f4f4f1] text-sm">Pengingat Aktivitas</h3>
            <p className="text-[11px] text-stone-500 dark:text-stone-400">
              Notifikasi in-app dan sistem di luar aplikasi
            </p>
          </div>
        </div>

        {/* 1. Outside App / System Push Notifications */}
        <div className="pt-2 border-t border-stone-100 dark:border-[#282825] space-y-2.5">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-semibold text-stone-900 dark:text-[#f4f4f1] flex items-center gap-1.5">
                <span>Notifikasi Luar Aplikasi</span>
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-800/40">
                  Web Notification API / SW
                </span>
              </div>
              <div className="text-[11px] text-stone-500 dark:text-stone-400">
                Pemberitahuan push via Service Worker ke bilah notifikasi ponsel / desktop saat rutinitas belum selesai
              </div>
            </div>

            <button
              onClick={handleToggleSystemNotification}
              className={`w-11 h-6 rounded-full transition-colors relative p-0.5 shrink-0 ${
                reminderSettings.systemNotificationsEnabled ? 'bg-emerald-600' : 'bg-stone-200 dark:bg-[#33332f]'
              }`}
              aria-label="Toggle notifikasi luar aplikasi"
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  reminderSettings.systemNotificationsEnabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Browser Permission Status info */}
          <div className="flex items-center justify-between p-2.5 bg-stone-50 dark:bg-[#252522] rounded-xl border border-transparent dark:border-[#2e2e2a]">
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-stone-600 dark:text-stone-300 font-medium">Status Izin Perangkat:</span>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                  notificationPermission === 'granted'
                    ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                    : notificationPermission === 'denied'
                    ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300'
                    : 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300'
                }`}
              >
                {notificationPermission === 'granted'
                  ? 'Diizinkan'
                  : notificationPermission === 'denied'
                  ? 'Diblokir'
                  : 'Belum Dikonfirmasi'}
              </span>
            </div>

            {notificationPermission !== 'granted' && notificationPermission !== 'unsupported' && (
              <button
                onClick={onRequestSystemPermission}
                className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300"
              >
                Minta Izin
              </button>
            )}
          </div>

          {/* Reminder Time Slots */}
          {reminderSettings.systemNotificationsEnabled && (
            <div className="space-y-2 pt-1">
              <span className="font-semibold text-stone-700 dark:text-stone-300 block text-[11px]">
                Jadwal Pengingat Berkala:
              </span>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { key: 'pagi' as const, label: 'Pagi (08:00)' },
                  { key: 'siang' as const, label: 'Siang (12:00)' },
                  { key: 'sore' as const, label: 'Sore (17:00)' },
                  { key: 'malam' as const, label: 'Malam (20:00)' },
                ].map(({ key, label }) => {
                  const isChecked = reminderSettings.reminderSlots[key];
                  return (
                    <button
                      key={key}
                      onClick={() => handleToggleSlot(key)}
                      className={`flex items-center justify-between p-2.5 rounded-xl transition text-left ${
                        isChecked
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-950 dark:text-emerald-200 font-semibold border border-emerald-100 dark:border-emerald-900/40'
                          : 'bg-stone-50 dark:bg-[#252522] text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-[#2e2e2a]'
                      }`}
                    >
                      <span className="text-[11px]">{label}</span>
                      <div
                        className={`w-4 h-4 rounded-md flex items-center justify-center text-[10px] ${
                          isChecked ? 'bg-emerald-600 text-white' : 'bg-stone-200 dark:bg-[#33332f]'
                        }`}
                      >
                        {isChecked && '✓'}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Test Notification Button */}
              <button
                onClick={onTriggerSystemTest}
                className="w-full mt-2 py-2 px-3 bg-stone-900 dark:bg-stone-100 hover:bg-stone-800 dark:hover:bg-white active:scale-98 text-white dark:text-stone-900 rounded-xl font-semibold flex items-center justify-center gap-2 transition"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Kirim Tes Notifikasi ke Layar HP Sekarang</span>
              </button>
            </div>
          )}

          {/* 2. In-App Reminder Alerts */}
          <div className="flex items-center justify-between pt-2 border-t border-stone-100 dark:border-[#282825]">
            <div>
              <div className="font-semibold text-stone-900 dark:text-[#f4f4f1]">Banner Pengingat In-App</div>
              <div className="text-[11px] text-stone-500 dark:text-stone-400">
                Tampilkan kartu peringatan otomatis di halaman utama
              </div>
            </div>

            <button
              onClick={handleToggleInAppAlerts}
              className={`w-11 h-6 rounded-full transition-colors relative p-0.5 shrink-0 ${
                reminderSettings.inAppAlertsEnabled ? 'bg-emerald-600' : 'bg-stone-200 dark:bg-[#33332f]'
              }`}
              aria-label="Toggle banner pengingat in-app"
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  reminderSettings.inAppAlertsEnabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Preferences Section */}
      <div className="bg-white dark:bg-[#1c1c1a] border border-transparent dark:border-[#282825] rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.03)] dark:shadow-none p-4 space-y-3 transition-colors">
        <h3 className="font-bold text-stone-900 dark:text-[#f4f4f1] text-sm">Preferensi Suara</h3>

        <div className="flex items-center justify-between py-1">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-stone-100 dark:bg-[#282825] flex items-center justify-center text-stone-600 dark:text-stone-300">
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </div>
            <div>
              <div className="font-semibold text-stone-900 dark:text-[#f4f4f1]">Umpan Balik Suara</div>
              <div className="text-[11px] text-stone-500 dark:text-stone-400">
                Bunyi lonceng halus saat kebiasaan diselesaikan
              </div>
            </div>
          </div>

          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`w-11 h-6 rounded-full transition-colors relative p-0.5 shrink-0 ${
              soundEnabled ? 'bg-emerald-600' : 'bg-stone-200 dark:bg-[#33332f]'
            }`}
            aria-label="Toggle suara lonceng"
          >
            <div
              className={`w-5 h-5 rounded-full bg-white transition-transform ${
                soundEnabled ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Automatic Daily Browser Backup Card */}
      {onCreateManualBackup && onRestoreDailyBackup && onDeleteDailyBackup && (
        <AutoBackupCard
          dailyBackups={dailyBackups}
          onCreateManualBackup={onCreateManualBackup}
          onRestoreDailyBackup={onRestoreDailyBackup}
          onDeleteDailyBackup={onDeleteDailyBackup}
        />
      )}

      {/* Data Management Section (Manual JSON Export / Import) */}
      <div className="bg-white dark:bg-[#1c1c1a] border border-transparent dark:border-[#282825] rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.03)] dark:shadow-none p-4 space-y-3 transition-colors">
        <h3 className="font-bold text-stone-900 dark:text-[#f4f4f1] text-sm">Cadangan & Data</h3>

        <div className="space-y-2">
          <button
            onClick={onExport}
            className="w-full flex items-center justify-between p-3 rounded-xl bg-stone-50 dark:bg-[#252522] hover:bg-stone-100 dark:hover:bg-[#2e2e2a] transition text-left"
          >
            <div className="flex items-center gap-2.5">
              <Download className="w-4 h-4 text-stone-600 dark:text-stone-400" />
              <div>
                <div className="font-semibold text-stone-900 dark:text-[#f4f4f1]">Ekspor Cadangan</div>
                <div className="text-[11px] text-stone-500 dark:text-stone-400">
                  Unduh seluruh riwayat ({habitsCount} kebiasaan) dalam berkas JSON
                </div>
              </div>
            </div>
          </button>

          <button
            onClick={onImport}
            className="w-full flex items-center justify-between p-3 rounded-xl bg-stone-50 dark:bg-[#252522] hover:bg-stone-100 dark:hover:bg-[#2e2e2a] transition text-left"
          >
            <div className="flex items-center gap-2.5">
              <Upload className="w-4 h-4 text-stone-600 dark:text-stone-400" />
              <div>
                <div className="font-semibold text-stone-900 dark:text-[#f4f4f1]">Pulihkan Data</div>
                <div className="text-[11px] text-stone-500 dark:text-stone-400">
                  Unggah berkas JSON cadangan sebelumnya
                </div>
              </div>
            </div>
          </button>

          <button
            onClick={onReset}
            className="w-full flex items-center justify-between p-3 rounded-xl bg-rose-50/70 dark:bg-rose-950/30 hover:bg-rose-100/70 dark:hover:bg-rose-950/50 transition text-left"
          >
            <div className="flex items-center gap-2.5">
              <RotateCcw className="w-4 h-4 text-rose-600 dark:text-rose-400" />
              <div>
                <div className="font-semibold text-rose-700 dark:text-rose-400">Reset ke Default</div>
                <div className="text-[11px] text-rose-600/80 dark:text-rose-400/70">
                  Kembalikan kebiasaan awal contoh bawaan aplikasi
                </div>
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Privacy Notice */}
      <div className="p-4 bg-stone-100/70 dark:bg-[#252522] rounded-2xl text-stone-500 dark:text-stone-400 flex items-start gap-2.5 transition-colors">
        <Shield className="w-4 h-4 text-stone-400 dark:text-stone-500 shrink-0 mt-0.5" />
        <p className="text-[11px] leading-relaxed">
          Seluruh data rutinitas dan catatan harian disimpan secara lokal di perangkat Anda (Local Storage) untuk menjaga privasi seutuhnya.
        </p>
      </div>
    </div>
  );
};
