import React from 'react';
import { Info } from 'lucide-react';

export const HeatmapLegend: React.FC = () => {
  return (
    <div className="flex items-center justify-between pt-1 border-t border-stone-100 dark:border-[#282825] text-[10px] text-stone-400 dark:text-stone-500">
      <span className="flex items-center gap-1">
        <Info className="w-3 h-3" />
        Keterangan Intensitas
      </span>

      <div className="flex items-center gap-1.5">
        <span>0%</span>
        <div className="w-2.5 h-2.5 rounded-xs bg-stone-100 dark:bg-[#252522]" />
        <div className="w-2.5 h-2.5 rounded-xs bg-emerald-100 dark:bg-emerald-950/80" />
        <div className="w-2.5 h-2.5 rounded-xs bg-emerald-300 dark:bg-emerald-800" />
        <div className="w-2.5 h-2.5 rounded-xs bg-emerald-500 dark:bg-emerald-600" />
        <div className="w-2.5 h-2.5 rounded-xs bg-emerald-600 dark:bg-emerald-500" />
        <span>100%</span>
      </div>
    </div>
  );
};
