import { Habit } from '../types';
import { formatDateStr } from '../utils/dateUtils';

function getRelativeDateStr(offsetDays: number): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return formatDateStr(d);
}

export const INITIAL_HABITS: Habit[] = [];

export const CATEGORY_DETAILS: Record<
  string,
  { label: string; color: string; bgSoft: string; textClass: string }
> = {
  kesehatan: {
    label: 'Kesehatan',
    color: '#0284c7',
    bgSoft: 'bg-sky-50 dark:bg-sky-950/40',
    textClass: 'text-sky-700 dark:text-sky-300',
  },
  produktivitas: {
    label: 'Produktivitas',
    color: '#d97706',
    bgSoft: 'bg-amber-50 dark:bg-amber-950/40',
    textClass: 'text-amber-700 dark:text-amber-300',
  },
  belajar: {
    label: 'Belajar',
    color: '#4f46e5',
    bgSoft: 'bg-indigo-50 dark:bg-indigo-950/40',
    textClass: 'text-indigo-700 dark:text-indigo-300',
  },
  olahraga: {
    label: 'Olahraga',
    color: '#059669',
    bgSoft: 'bg-emerald-50 dark:bg-emerald-950/40',
    textClass: 'text-emerald-700 dark:text-emerald-300',
  },
  mindfulness: {
    label: 'Ketenangan',
    color: '#0891b2',
    bgSoft: 'bg-cyan-50 dark:bg-cyan-950/40',
    textClass: 'text-cyan-700 dark:text-cyan-300',
  },
  keuangan: {
    label: 'Keuangan',
    color: '#0d9488',
    bgSoft: 'bg-teal-50 dark:bg-teal-950/40',
    textClass: 'text-teal-700 dark:text-teal-300',
  },
  sosial: {
    label: 'Sosial',
    color: '#e11d48',
    bgSoft: 'bg-rose-50 dark:bg-rose-950/40',
    textClass: 'text-rose-700 dark:text-rose-300',
  },
};

export const TIME_OF_DAY_LABELS: Record<string, { label: string; icon: string }> = {
  anytime: { label: 'Kapan saja', icon: 'Clock' },
  pagi: { label: 'Pagi', icon: 'Sunrise' },
  siang: { label: 'Siang', icon: 'Sun' },
  sore: { label: 'Sore', icon: 'Sunset' },
  malam: { label: 'Malam', icon: 'Moon' },
};

export const FREQUENCY_LABELS: Record<string, string> = {
  daily: 'Setiap Hari',
  weekdays: 'Hari Kerja (Sen-Jum)',
  weekends: 'Akhir Pekan (Sab-Min)',
};
