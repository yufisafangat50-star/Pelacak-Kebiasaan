import { Habit, Category, TimeOfDay, Frequency, HabitType } from '../types';

export interface HabitTemplate extends Omit<Habit, 'id' | 'createdAt' | 'completedDates' | 'progressMap' | 'notesMap' | 'restDays' | 'stackParentHabitId' | 'triggerCue'> {}

export interface HabitPack {
  id: string;
  name: string;
  description: string;
  icon: string; // lucide icon name
  color: string;
  habits: HabitTemplate[];
}

export const HABIT_PACKS: HabitPack[] = [
  {
    id: 'morning-routine',
    name: 'Rutinitas Pagi Terarah',
    description: 'Awali hari dengan energi positif dan produktivitas tinggi.',
    icon: 'Sunrise',
    color: '#059669', // Emerald
    habits: [
      {
        title: 'Minum Air Putih',
        description: 'Minum 2 gelas air putih setelah bangun tidur.',
        category: 'kesehatan',
        timeOfDay: 'pagi',
        frequency: 'daily',
        habitType: 'counter',
        targetCount: 2,
        unit: 'Gelas',
        icon: 'Droplets',
        color: '#0ea5e9', // Sky blue
      },
      {
        title: 'Meditasi 10 Menit',
        description: 'Duduk tenang dan fokus pada pernapasan.',
        category: 'mindfulness',
        timeOfDay: 'pagi',
        frequency: 'daily',
        habitType: 'boolean',
        icon: 'Wind',
        color: '#8b5cf6', // Violet
      },
      {
        title: 'Olahraga Ringan',
        description: 'Stretching atau jogging singkat.',
        category: 'olahraga',
        timeOfDay: 'pagi',
        frequency: 'daily',
        habitType: 'boolean',
        icon: 'Activity',
        color: '#ef4444', // Red
      },
    ]
  },
  {
    id: 'focus-study',
    name: 'Fokus & Produktif',
    description: 'Paket kebiasaan untuk meningkatkan konsentrasi dalam belajar atau bekerja.',
    icon: 'Target',
    color: '#2563eb', // Blue
    habits: [
      {
        title: 'Deep Work Session',
        description: 'Fokus tanpa gangguan menggunakan metode Pomodoro.',
        category: 'produktivitas',
        timeOfDay: 'siang',
        frequency: 'weekdays',
        habitType: 'counter',
        targetCount: 4,
        unit: 'Sesi',
        icon: 'Timer',
        color: '#ea580c', // Orange
      },
      {
        title: 'Membaca Buku',
        description: 'Membaca buku non-fiksi.',
        category: 'produktivitas',
        timeOfDay: 'sore',
        frequency: 'daily',
        habitType: 'timer',
        durationMinutes: 20,
        icon: 'BookOpen',
        color: '#d97706', // Amber
      },
      {
        title: 'Jauhkan HP',
        description: 'Tidak memegang HP selama bekerja/belajar.',
        category: 'produktivitas',
        timeOfDay: 'siang',
        frequency: 'weekdays',
        habitType: 'boolean',
        icon: 'Smartphone',
        color: '#3b82f6', // Blue
      },
    ]
  },
  {
    id: 'evening-unwind',
    name: 'Istirahat Malam',
    description: 'Tutup hari dengan tenang untuk kualitas tidur yang lebih baik.',
    icon: 'Moon',
    color: '#4f46e5', // Indigo
    habits: [
      {
        title: 'Jurnal Syukur',
        description: 'Tuliskan 3 hal yang disyukuri hari ini.',
        category: 'mindfulness',
        timeOfDay: 'malam',
        frequency: 'daily',
        habitType: 'boolean',
        icon: 'BookHeart',
        color: '#ec4899', // Pink
      },
      {
        title: 'Digital Detox',
        description: 'Tidak melihat layar 1 jam sebelum tidur.',
        category: 'kesehatan',
        timeOfDay: 'malam',
        frequency: 'daily',
        habitType: 'boolean',
        icon: 'MonitorOff',
        color: '#64748b', // Slate
      },
      {
        title: 'Tidur Tepat Waktu',
        description: 'Tidur sebelum jam 10 malam.',
        category: 'kesehatan',
        timeOfDay: 'malam',
        frequency: 'daily',
        habitType: 'boolean',
        icon: 'Bed',
        color: '#3f6212', // Lime
      },
    ]
  }
];
