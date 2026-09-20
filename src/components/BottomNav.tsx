import React from 'react';
import { CheckCircle2, CalendarDays, BarChart3, Settings } from 'lucide-react';

export type TabType = 'tracker' | 'matrix' | 'stats' | 'settings';

interface BottomNavProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, setActiveTab }) => {
  const tabs: { id: TabType; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'tracker', label: 'Hari Ini', icon: CheckCircle2 },
    { id: 'matrix', label: 'Mingguan', icon: CalendarDays },
    { id: 'stats', label: 'Statistik', icon: BarChart3 },
    { id: 'settings', label: 'Pengaturan', icon: Settings },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#191918]/95 backdrop-blur-md border-t border-stone-100 dark:border-[#272724] pb-[env(safe-area-inset-bottom,0px)] transition-colors">
      <div className="max-w-md mx-auto grid grid-cols-4 px-2 py-1.5">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center justify-center py-1 rounded-xl transition-all ${
                isActive
                  ? 'text-stone-900 dark:text-[#f4f4f1] font-semibold'
                  : 'text-stone-400 dark:text-stone-500 hover:text-stone-700 dark:hover:text-stone-300'
              }`}
            >
              <div
                className={`p-1 rounded-lg transition-transform ${
                  isActive ? 'scale-110 text-emerald-600 dark:text-emerald-400' : ''
                }`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
