import React from 'react';
import {
  Droplets,
  BookOpen,
  Activity,
  CheckSquare,
  Heart,
  Wallet,
  Dumbbell,
  Smile,
  Moon,
  Sun,
  Sunrise,
  Sunset,
  Flame,
  Clock,
  Sparkles,
  Award,
  Zap,
  Coffee,
  Check,
  Calendar,
  Layers,
  Wind,
  Target,
  Timer,
  Smartphone,
  BookHeart,
  MonitorOff,
  Bed,
  LucideProps,
} from 'lucide-react';

const ICON_MAP: Record<string, React.ComponentType<LucideProps>> = {
  Droplets,
  BookOpen,
  Activity,
  CheckSquare,
  Heart,
  Wallet,
  Dumbbell,
  Smile,
  Moon,
  Sun,
  Sunrise,
  Sunset,
  Flame,
  Clock,
  Sparkles,
  Award,
  Zap,
  Coffee,
  Check,
  Calendar,
  Layers,
  Wind,
  Target,
  Timer,
  Smartphone,
  BookHeart,
  MonitorOff,
  Bed,
};

interface HabitIconProps extends LucideProps {
  name: string;
}

export const HabitIcon: React.FC<HabitIconProps> = ({ name, ...props }) => {
  const IconComponent = ICON_MAP[name] || Sparkles;
  return <IconComponent {...props} />;
};

export const AVAILABLE_ICONS = [
  'Droplets',
  'BookOpen',
  'Activity',
  'CheckSquare',
  'Heart',
  'Wallet',
  'Dumbbell',
  'Coffee',
  'Zap',
  'Sparkles',
  'Moon',
  'Sun',
];
