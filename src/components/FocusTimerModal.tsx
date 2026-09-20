import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Play, Pause, RotateCcw, Volume2, VolumeX, Waves } from 'lucide-react';
import { Habit } from '../types';
import { startBrownNoise, stopBrownNoise } from '../utils/sound';

interface FocusTimerModalProps {
  habit: Habit | null;
  isOpen: boolean;
  onClose: () => void;
  onComplete: (habitId: string) => void;
}

export const FocusTimerModal: React.FC<FocusTimerModalProps> = ({ habit, isOpen, onClose, onComplete }) => {
  const [timeLeft, setTimeLeft] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [ambientEnabled, setAmbientEnabled] = useState(false);
  const workerRef = useRef<Worker | null>(null);

  const durationSecs = habit?.durationMinutes ? habit.durationMinutes * 60 : 600;

  useEffect(() => {
    if (isOpen && habit) {
      setTimeLeft(durationSecs);
      setIsRunning(false);
    }
  }, [isOpen, habit, durationSecs]);

  useEffect(() => {
    // Setup Web Worker for background tracking
    if (window.Worker) {
      workerRef.current = new Worker(new URL('../workers/timerWorker.ts', import.meta.url), { type: 'module' });
      workerRef.current.onmessage = (e) => {
        if (e.data.type === 'TICK') {
          setTimeLeft(e.data.timeLeft);
        } else if (e.data.type === 'COMPLETE') {
          setIsRunning(false);
          onComplete(habit!.id);
          if (soundEnabled) {
             const audio = new Audio('/sounds/complete.mp3');
             audio.play().catch(() => {});
          }
          if (ambientEnabled) {
             stopBrownNoise();
             setAmbientEnabled(false);
          }
          if ('Notification' in window && Notification.permission === 'granted') {
             new Notification('Waktu Fokus Selesai!', {
               body: `Kerja bagus! Sesi untuk "${habit?.title}" sudah berakhir.`,
             });
          }
        }
      };
    }
    return () => {
      workerRef.current?.terminate();
      stopBrownNoise();
    };
  }, [habit, onComplete, soundEnabled, ambientEnabled]);

  const toggleTimer = () => {
    if (!isRunning) {
      if (Notification.permission === 'default') {
        Notification.requestPermission();
      }
      workerRef.current?.postMessage({ type: 'START', duration: timeLeft });
      setIsRunning(true);
    } else {
      workerRef.current?.postMessage({ type: 'PAUSE' });
      setIsRunning(false);
    }
  };

  const resetTimer = () => {
    workerRef.current?.postMessage({ type: 'STOP' });
    setIsRunning(false);
    setTimeLeft(durationSecs);
    if (ambientEnabled) {
      stopBrownNoise();
      setAmbientEnabled(false);
    }
  };

  const toggleAmbient = () => {
    if (ambientEnabled) {
      stopBrownNoise();
      setAmbientEnabled(false);
    } else {
      startBrownNoise();
      setAmbientEnabled(true);
    }
  };

  if (!isOpen || !habit) return null;

  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;
  const progress = 100 - (timeLeft / durationSecs) * 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-sm bg-white dark:bg-[#1c1c1a] rounded-3xl shadow-xl overflow-hidden p-6"
      >
        <div className="flex items-center justify-between mb-8">
          <div className="flex flex-col">
             <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">Mode Fokus</span>
             <h2 className="text-lg font-bold text-stone-900 dark:text-[#f4f4f1]">{habit.title}</h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-full bg-stone-100 dark:bg-[#252522] text-stone-500 hover:text-stone-900">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="relative flex justify-center items-center py-6">
          {/* Circular Progress */}
          <svg className="w-64 h-64 -rotate-90">
            <circle cx="128" cy="128" r="120" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-stone-100 dark:text-[#252522]" />
            <circle cx="128" cy="128" r="120" stroke={habit.color} strokeWidth="8" fill="transparent" strokeDasharray={2 * Math.PI * 120} strokeDashoffset={(2 * Math.PI * 120) * (1 - progress / 100)} className="transition-all duration-1000 ease-linear" strokeLinecap="round" />
          </svg>
          <div className="absolute flex flex-col items-center">
            <span className="text-5xl font-bold tabular-nums text-stone-900 dark:text-[#f4f4f1]">
              {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-center gap-4 mt-8">
          <button onClick={resetTimer} className="p-4 rounded-full bg-stone-100 dark:bg-[#252522] text-stone-600 hover:bg-stone-200 transition-colors" title="Ulang Waktu">
            <RotateCcw className="w-5 h-5" />
          </button>
          
          <button onClick={toggleAmbient} className={`p-4 rounded-full transition-colors ${ambientEnabled ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'bg-stone-100 dark:bg-[#252522] text-stone-600 hover:bg-stone-200'}`} title="Suara Fokus (Brown Noise)">
            <Waves className="w-5 h-5" />
          </button>
          
          <button onClick={toggleTimer} className="p-6 rounded-full text-white transition-transform hover:scale-105 active:scale-95 shadow-lg" style={{ backgroundColor: habit.color }}>
            {isRunning ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8 ml-1" />}
          </button>
          
          <button onClick={() => setSoundEnabled(!soundEnabled)} className="p-4 rounded-full bg-stone-100 dark:bg-[#252522] text-stone-600 hover:bg-stone-200 transition-colors" title="Suara Selesai">
            {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </button>
        </div>
      </motion.div>
    </div>
  );
};
