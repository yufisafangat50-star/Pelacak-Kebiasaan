import React from 'react';
import { Plus, BarChart3, CheckCircle2, RotateCcw, Download, Upload } from 'lucide-react';
import { AppLogo } from './AppLogo';
import { formatIndonesianDate, getTodayStr } from '../utils/dateUtils';

interface NavbarProps {
  onAddHabit: () => void;
  activeTab: 'tracker' | 'stats';
  setActiveTab: (tab: 'tracker' | 'stats') => void;
  onResetDefault: () => void;
  onExportData: () => void;
  onImportData: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onAddHabit,
  activeTab,
  setActiveTab,
  onResetDefault,
  onExportData,
  onImportData,
}) => {
  const todayStr = getTodayStr();
  const [showMenu, setShowMenu] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-stone-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        {/* Brand & Date */}
        <div className="flex items-center justify-between sm:justify-start gap-4">
          <div className="flex items-center gap-2.5">
            <AppLogo size={40} className="rounded-xl shadow-xs" />
            <div className="flex flex-col">
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-bold text-stone-900 leading-none">
                  Rima Karsa
                </h1>
                <span className="text-xs font-medium text-stone-500 border-l border-stone-300 pl-3">
                  {formatIndonesianDate(todayStr, true)}
                </span>
              </div>
              <span className="block text-[9px] text-emerald-600 font-bold tracking-[0.18em] uppercase mt-1">
                Make It a Rhythm
              </span>
            </div>
          </div>

          {/* Mobile Add Button shortcut */}
          <div className="flex items-center gap-2 sm:hidden">
            <button
              onClick={onAddHabit}
              className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition"
              aria-label="Tambah Kebiasaan"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs & Actions */}
        <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">
          {/* Tabs */}
          <div className="flex items-center p-1 bg-stone-100 rounded-xl border border-stone-200/80 text-xs font-medium">
            <button
              onClick={() => setActiveTab('tracker')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition ${
                activeTab === 'tracker'
                  ? 'bg-white text-stone-900 shadow-xs font-semibold'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Daftar Rutinitas</span>
            </button>
            <button
              onClick={() => setActiveTab('stats')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition ${
                activeTab === 'stats'
                  ? 'bg-white text-stone-900 shadow-xs font-semibold'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5 text-stone-600" />
              <span>Statistik & Tren</span>
            </button>
          </div>

          {/* Desktop Actions */}
          <div className="hidden sm:flex items-center gap-2">
            <button
              onClick={onAddHabit}
              className="inline-flex items-center gap-2 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-xs transition active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Kebiasaan</span>
            </button>

            {/* Menu options dropdown */}
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="w-8 h-8 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-stone-600 flex items-center justify-center transition"
                title="Pilihan Data"
              >
                <span className="text-sm font-bold leading-none">⋯</span>
              </button>

              {showMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-stone-200 py-1.5 z-50 text-xs">
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      onExportData();
                    }}
                    className="w-full text-left px-3.5 py-2 hover:bg-stone-50 flex items-center gap-2 text-stone-700"
                  >
                    <Download className="w-3.5 h-3.5 text-stone-500" />
                    <span>Cadangkan Data (JSON)</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      onImportData();
                    }}
                    className="w-full text-left px-3.5 py-2 hover:bg-stone-50 flex items-center gap-2 text-stone-700"
                  >
                    <Upload className="w-3.5 h-3.5 text-stone-500" />
                    <span>Pulihkan Data (JSON)</span>
                  </button>
                  <div className="my-1 border-t border-stone-100" />
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      onResetDefault();
                    }}
                    className="w-full text-left px-3.5 py-2 hover:bg-rose-50 flex items-center gap-2 text-rose-600"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-rose-500" />
                    <span>Reset Kebiasaan Default</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
