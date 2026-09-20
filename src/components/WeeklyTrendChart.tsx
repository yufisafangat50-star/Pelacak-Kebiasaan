import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Area,
  AreaChart,
} from 'recharts';
import { BarChart3, TrendingUp, Calendar, CheckCircle2, ArrowUpRight } from 'lucide-react';
import { Habit } from '../types';
import { formatDateStr, formatIndonesianDate, isHabitScheduledForDate } from '../utils/dateUtils';

interface WeeklyTrendChartProps {
  habits: Habit[];
}

type ChartType = 'bar' | 'line';

interface DayTrendData {
  dayLabel: string;
  shortDate: string;
  fullDateStr: string;
  completed: number;
  scheduled: number;
  rate: number; // percentage 0-100
}

export const WeeklyTrendChart: React.FC<WeeklyTrendChartProps> = ({ habits }) => {
  const [chartType, setChartType] = useState<ChartType>('bar');

  // Compute last 7 days data
  const trendData = useMemo<DayTrendData[]>(() => {
    const data: DayTrendData[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const DAY_NAMES = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateStr = formatDateStr(d);

      let scheduled = 0;
      let completed = 0;

      habits.forEach((h) => {
        if (isHabitScheduledForDate(dateStr, h.frequency)) {
          scheduled++;
          if (h.completedDates.includes(dateStr)) {
            completed++;
          }
        }
      });

      const rate = scheduled > 0 ? Math.round((completed / scheduled) * 100) : 0;
      const isToday = i === 0;

      data.push({
        dayLabel: isToday ? 'Hari Ini' : DAY_NAMES[d.getDay()],
        shortDate: `${d.getDate()}/${d.getMonth() + 1}`,
        fullDateStr: dateStr,
        completed,
        scheduled,
        rate,
      });
    }

    return data;
  }, [habits]);

  // Calculations for quick metrics
  const summary = useMemo(() => {
    const totalDone = trendData.reduce((acc, d) => acc + d.completed, 0);
    const totalScheduled = trendData.reduce((acc, d) => acc + d.scheduled, 0);
    const avgDailyDone = trendData.length > 0 ? (totalDone / trendData.length).toFixed(1) : '0';
    const overallRate = totalScheduled > 0 ? Math.round((totalDone / totalScheduled) * 100) : 0;

    // Find best day
    let bestDay = trendData[0];
    trendData.forEach((d) => {
      if (d.rate > (bestDay?.rate || 0) || (d.rate === bestDay?.rate && d.completed > bestDay.completed)) {
        bestDay = d;
      }
    });

    return {
      totalDone,
      avgDailyDone,
      overallRate,
      bestDayName: bestDay ? `${bestDay.dayLabel} (${bestDay.rate}%)` : '-',
    };
  }, [trendData]);

  // Custom tooltip component
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item: DayTrendData = payload[0].payload;
      return (
        <div className="bg-white dark:bg-[#252522] border border-stone-200/90 dark:border-[#33332f] rounded-xl shadow-lg p-3 text-xs min-w-[150px] transition-colors">
          <div className="flex items-center justify-between font-bold text-stone-900 dark:text-[#f4f4f1] border-b border-stone-100 dark:border-[#33332f] pb-1.5 mb-2">
            <span>{formatIndonesianDate(item.fullDateStr, true)}</span>
            <span className="text-[10px] text-stone-400 font-normal">{item.shortDate}</span>
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-stone-500 dark:text-stone-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                Selesai
              </span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">
                {item.completed} kebiasaan
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-stone-500 dark:text-stone-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-stone-300 dark:bg-stone-600" />
                Target Jadwal
              </span>
              <span className="font-semibold text-stone-700 dark:text-stone-300">
                {item.scheduled}
              </span>
            </div>
            <div className="flex items-center justify-between pt-1 border-t border-stone-100 dark:border-[#33332f]">
              <span className="text-stone-500 dark:text-stone-400">Tingkat Capaian</span>
              <span className="font-bold text-stone-900 dark:text-[#f4f4f1]">
                {item.rate}%
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  const maxDailyCount = useMemo(() => {
    const maxVal = Math.max(...trendData.map((d) => Math.max(d.scheduled, d.completed)), 4);
    return Math.ceil(maxVal * 1.2);
  }, [trendData]);

  return (
    <div className="bg-white dark:bg-[#1c1c1a] p-4 rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.03)] dark:shadow-none dark:border dark:border-[#282825] transition-colors space-y-3.5">
      {/* Header & Chart Controls */}
      <div className="flex items-center justify-between gap-2">
        <div>
          <div className="flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <h3 className="text-xs font-bold text-stone-900 dark:text-[#f4f4f1]">
              Tren Penyelesaian Mingguan
            </h3>
          </div>
          <p className="text-[10px] text-stone-500 dark:text-stone-400 mt-0.5">
            Aktivitas 7 hari terakhir
          </p>
        </div>

        {/* View Toggle: Bar vs Line */}
        <div className="flex items-center bg-stone-100 dark:bg-[#252522] p-0.5 rounded-xl text-[11px] transition-colors">
          <button
            onClick={() => setChartType('bar')}
            className={`px-2.5 py-1 rounded-lg font-medium transition flex items-center gap-1 ${
              chartType === 'bar'
                ? 'bg-white dark:bg-[#33332f] text-stone-900 dark:text-[#f4f4f1] shadow-2xs font-semibold'
                : 'text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200'
            }`}
            title="Tampilkan grafik batang"
          >
            <BarChart3 className="w-3 h-3" />
            <span>Batang</span>
          </button>
          <button
            onClick={() => setChartType('line')}
            className={`px-2.5 py-1 rounded-lg font-medium transition flex items-center gap-1 ${
              chartType === 'line'
                ? 'bg-white dark:bg-[#33332f] text-stone-900 dark:text-[#f4f4f1] shadow-2xs font-semibold'
                : 'text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200'
            }`}
            title="Tampilkan grafik garis persentase"
          >
            <TrendingUp className="w-3 h-3" />
            <span>Garis</span>
          </button>
        </div>
      </div>

      {/* Mini KPIs Row */}
      <div className="grid grid-cols-3 gap-2 py-2 px-3 bg-stone-50/80 dark:bg-[#22221f] rounded-xl border border-stone-100/80 dark:border-[#282825]">
        <div>
          <span className="block text-[10px] text-stone-400 dark:text-stone-500">
            Rata-rata/Hari
          </span>
          <span className="text-xs font-bold text-stone-900 dark:text-[#f4f4f1]">
            {summary.avgDailyDone}{' '}
            <span className="text-[10px] font-normal text-stone-400">tuntas</span>
          </span>
        </div>
        <div>
          <span className="block text-[10px] text-stone-400 dark:text-stone-500">
            Kepatuhan 7H
          </span>
          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
            {summary.overallRate}%
          </span>
        </div>
        <div>
          <span className="block text-[10px] text-stone-400 dark:text-stone-500">
            Hari Terbaik
          </span>
          <span className="text-xs font-bold text-stone-900 dark:text-[#f4f4f1] truncate block">
            {summary.bestDayName}
          </span>
        </div>
      </div>

      {/* Main Chart Area */}
      <div className="w-full h-52 pt-2">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'bar' ? (
            <BarChart
              data={trendData}
              margin={{ top: 10, right: 8, left: -22, bottom: 0 }}
              barGap={3}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#888888"
                opacity={0.15}
              />
              <XAxis
                dataKey="dayLabel"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: '#78716c' }}
                dy={6}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: '#78716c' }}
                domain={[0, maxDailyCount]}
                allowDecimals={false}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(16, 185, 129, 0.05)' }} />
              <Bar
                name="Selesai"
                dataKey="completed"
                fill="#059669"
                radius={[5, 5, 0, 0]}
                maxBarSize={28}
              />
              <Bar
                name="Jadwal"
                dataKey="scheduled"
                fill="#d6d3d1"
                opacity={0.35}
                radius={[5, 5, 0, 0]}
                maxBarSize={28}
              />
            </BarChart>
          ) : (
            <AreaChart
              data={trendData}
              margin={{ top: 10, right: 8, left: -22, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#888888"
                opacity={0.15}
              />
              <XAxis
                dataKey="dayLabel"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: '#78716c' }}
                dy={6}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: '#78716c' }}
                domain={[0, 100]}
                unit="%"
                ticks={[0, 25, 50, 75, 100]}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="rate"
                name="Persentase"
                stroke="#059669"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#colorRate)"
                activeDot={{ r: 5, fill: '#059669', stroke: '#ffffff', strokeWidth: 2 }}
              />
            </AreaChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Legend Footer */}
      <div className="flex items-center justify-center gap-4 text-[11px] text-stone-500 dark:text-stone-400 pt-1 border-t border-stone-100/80 dark:border-[#282825]">
        {chartType === 'bar' ? (
          <>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-xs bg-emerald-600 inline-block" />
              <span>Selesai Dikerjakan</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-xs bg-stone-300 dark:bg-stone-600 inline-block" />
              <span>Target Terjadwal</span>
            </div>
          </>
        ) : (
          <div className="flex items-center gap-1.5">
            <span className="w-4 h-0.5 bg-emerald-600 inline-block rounded-full" />
            <span>Tingkat Kepatuhan Harian (%)</span>
          </div>
        )}
      </div>
    </div>
  );
};
