import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, ChevronRight, Activity, Bell, Smartphone } from 'lucide-react';
import { AppLogo } from './AppLogo';

interface OnboardingTutorialProps {
  onComplete: () => void;
}

export const OnboardingTutorial: React.FC<OnboardingTutorialProps> = ({ onComplete }) => {
  const [step, setStep] = useState(0);

  const steps = [
    {
      id: 'welcome',
      icon: <AppLogo size={64} className="rounded-2xl shadow-md mb-6" />,
      title: 'Selamat Datang di Rima Karsa',
      description: 'Membangun ritme kebiasaan yang konsisten. Lacak rutinitas Anda dan capai target harian dengan mudah.',
    },
    {
      id: 'how-to',
      icon: <Activity className="w-16 h-16 text-emerald-500 mb-6" />,
      title: 'Cara Kerja',
      description: 'Tambahkan kebiasaan yang ingin Anda bangun, selesaikan setiap hari, dan pantau streak keberhasilan Anda.',
    },
    {
      id: 'pwa',
      icon: <Smartphone className="w-16 h-16 text-emerald-500 mb-6" />,
      title: 'Pasang di Beranda',
      description: 'Jadikan aplikasi ini layaknya aplikasi native. Pasang (Install) di beranda HP Anda melalui menu browser.',
    },
    {
      id: 'notifications',
      icon: <Bell className="w-16 h-16 text-emerald-500 mb-6" />,
      title: 'Jangan Terlewat',
      description: 'Aktifkan notifikasi pengingat agar Anda selalu ingat untuk menyelesaikan kebiasaan setiap harinya.',
    }
  ];

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      onComplete();
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-stone-900/60 backdrop-blur-sm p-4">
      <div className="absolute top-4 right-4 z-10">
        <button 
          onClick={handleSkip}
          className="px-4 py-2 text-white/80 hover:text-white text-sm font-semibold tracking-wider uppercase transition"
        >
          Lewati
        </button>
      </div>
      
      <div className="bg-white dark:bg-[#1c1c1a] w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl relative flex flex-col min-h-[400px]">
        {/* Progress indicators */}
        <div className="absolute top-0 left-0 right-0 h-1.5 flex gap-1 px-4 pt-4 z-10">
          {steps.map((_, idx) => (
            <div 
              key={idx} 
              className={`h-1 flex-1 rounded-full transition-all duration-300 ${idx <= step ? 'bg-emerald-500' : 'bg-stone-200 dark:bg-stone-700'}`}
            />
          ))}
        </div>

        <div className="flex-1 flex flex-col justify-center p-8 text-center relative overflow-hidden mt-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center"
            >
              {steps[step].icon}
              <h2 className="text-2xl font-bold text-stone-900 dark:text-[#f4f4f1] mb-3 leading-tight">
                {steps[step].title}
              </h2>
              <p className="text-stone-500 dark:text-stone-400 text-sm font-medium leading-relaxed max-w-[260px]">
                {steps[step].description}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="p-6 pt-0 bg-white dark:bg-[#1c1c1a] z-10">
          <button
            onClick={handleNext}
            className="w-full py-4 rounded-2xl bg-stone-900 dark:bg-emerald-500 text-white font-bold flex items-center justify-center gap-2 hover:bg-stone-800 dark:hover:bg-emerald-400 active:scale-95 transition-all shadow-md"
          >
            <span>{step === steps.length - 1 ? 'Mulai Sekarang' : 'Lanjut'}</span>
            {step === steps.length - 1 ? (
              <CheckCircle2 className="w-5 h-5" />
            ) : (
              <ChevronRight className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
