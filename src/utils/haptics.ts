// Haptic feedback utility
// Menggunakan navigator.vibrate yang didukung oleh sebagian besar browser mobile Android.
// Di iOS Safari/Web, getaran sering kali dibatasi, tapi ini fallback yang aman.

export type HapticType = 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error';

export const triggerHaptic = (type: HapticType = 'light') => {
  if (typeof window === 'undefined' || !window.navigator || !window.navigator.vibrate) {
    return;
  }

  try {
    switch (type) {
      case 'light':
        // Getaran super singkat untuk interaksi UI ringan (cth: klik tombol)
        window.navigator.vibrate(10);
        break;
      case 'medium':
        // Getaran sedang (cth: counter nambah)
        window.navigator.vibrate(20);
        break;
      case 'heavy':
        window.navigator.vibrate(40);
        break;
      case 'success':
        // Pola getaran sukses: dua getaran singkat
        window.navigator.vibrate([15, 60, 25]);
        break;
      case 'warning':
        // Pola peringatan
        window.navigator.vibrate([30, 40, 30]);
        break;
      case 'error':
        window.navigator.vibrate([50, 50, 50, 50, 50]);
        break;
      default:
        window.navigator.vibrate(10);
    }
  } catch (e) {
    // Silent fail jika browser menolak
  }
};
