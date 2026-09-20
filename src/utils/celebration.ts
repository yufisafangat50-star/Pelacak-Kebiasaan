import confetti from 'canvas-confetti';

/**
 * Triggers an elegant celebration particle burst when a habit is completed.
 * @param origin Optional viewport normalized coordinates ({ x: 0..1, y: 0..1 })
 * @param primaryColor Optional habit theme color to harmonize confetti
 */
export const triggerHabitCompletionCelebration = (
  origin?: { x: number; y: number },
  primaryColor?: string
) => {
  try {
    const colors = primaryColor
      ? [primaryColor, '#10b981', '#34d399', '#f59e0b', '#fbbf24']
      : ['#10b981', '#059669', '#34d399', '#f59e0b', '#6366f1'];

    // Burst 1: Quick localized particle spray
    confetti({
      particleCount: 28,
      spread: 60,
      startVelocity: 24,
      ticks: 150,
      gravity: 1.1,
      scalar: 0.75,
      origin: origin || { x: 0.5, y: 0.6 },
      colors,
      disableForReducedMotion: true,
      shapes: ['circle', 'square'],
      zIndex: 9999,
    });

    // Burst 2: Light micro stars/twinkles slightly higher
    setTimeout(() => {
      confetti({
        particleCount: 16,
        spread: 80,
        startVelocity: 18,
        ticks: 120,
        gravity: 0.9,
        scalar: 0.6,
        origin: origin
          ? { x: origin.x, y: Math.max(0.1, origin.y - 0.05) }
          : { x: 0.5, y: 0.55 },
        colors: ['#34d399', '#fbbf24', '#ffffff', primaryColor || '#10b981'],
        disableForReducedMotion: true,
        shapes: ['circle'],
        zIndex: 9999,
      });
    }, 80);
  } catch {
    // Graceful fallback if confetti fails or is blocked
  }
};
