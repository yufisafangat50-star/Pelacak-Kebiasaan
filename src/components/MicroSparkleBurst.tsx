import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const PARTICLE_ANGLES = [0, 45, 90, 135, 180, 225, 270, 315];

export const MicroSparkleBurst: React.FC<{ active: boolean; color?: string }> = ({ active, color = '#10b981' }) => {
  return (
    <AnimatePresence>
      {active && (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-visible z-20">
          {PARTICLE_ANGLES.map((deg, i) => {
            const rad = (deg * Math.PI) / 180;
            const dist = 24;
            return (
              <motion.span
                key={i}
                initial={{ x: 0, y: 0, scale: 0, opacity: 1 }}
                animate={{
                  x: Math.cos(rad) * dist,
                  y: Math.sin(rad) * dist,
                  scale: [0, 1.25, 0],
                  opacity: [1, 0.9, 0],
                }}
                transition={{ duration: 0.55, ease: 'easeOut' }}
                className="absolute w-1.5 h-1.5 rounded-full pointer-events-none"
                style={{
                  backgroundColor: i % 2 === 0 ? color : '#f59e0b',
                }}
              />
            );
          })}
        </div>
      )}
    </AnimatePresence>
  );
};
