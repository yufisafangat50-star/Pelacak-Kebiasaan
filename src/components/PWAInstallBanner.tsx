import React, { useState } from 'react';
import { Smartphone, Download, Share, X, CheckCircle2 } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface PWAInstallBannerProps {
  compact?: boolean;
}

export const PWAInstallBanner: React.FC<PWAInstallBannerProps> = ({ compact = false }) => {
  const { isInstallable, isInstalled, isIOS, isDismissed, dismiss, install } = usePWAInstall();
  const [showIOSModal, setShowIOSModal] = useState(false);

  // If already installed as native standalone app, do not show
  if (isInstalled) {
    return null;
  }

  // If user dismissed this session
  if (isDismissed) {
    return null;
  }

  // If compact version (for settings page or header button)
  if (compact) {
    if (isInstallable) {
      return (
        <button
          onClick={install}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-semibold shadow-xs transition active:scale-95"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Pasang di HP</span>
        </button>
      );
    }
    if (isIOS) {
      return (
        <>
          <button
            onClick={() => setShowIOSModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-semibold shadow-xs transition active:scale-95"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Pasang di iOS</span>
          </button>

          {showIOSModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
              <div className="bg-white dark:bg-[#1c1c1a] border border-transparent dark:border-[#282825] rounded-2xl p-5 max-w-sm w-full shadow-2xl text-xs space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sm text-stone-900 dark:text-[#f4f4f1]">Pasang di iPhone / iPad</h4>
                  <button
                    onClick={() => setShowIOSModal(false)}
                    className="p-1 text-stone-400 dark:text-stone-500 hover:text-stone-700 dark:hover:text-stone-200 rounded-lg"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-3 text-stone-600 dark:text-stone-300">
                  <div className="flex items-start gap-2.5">
                    <div className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-bold flex items-center justify-center shrink-0 text-[10px]">
                      1
                    </div>
                    <p>
                      Buka aplikasi ini di browser <strong>Safari</strong> pada iPhone/iPad.
                    </p>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <div className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-bold flex items-center justify-center shrink-0 text-[10px]">
                      2
                    </div>
                    <p>
                      Ketuk tombol <strong>Bagikan (Share)</strong> <Share className="w-3.5 h-3.5 inline text-stone-700 dark:text-stone-300 -mt-0.5" /> di bilah bawah Safari.
                    </p>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <div className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-bold flex items-center justify-center shrink-0 text-[10px]">
                      3
                    </div>
                    <p>
                      Gulir ke bawah dan ketuk <strong>"Tambah ke Layar Utama" (Add to Home Screen)</strong>.
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setShowIOSModal(false)}
                  className="w-full py-2 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 rounded-xl font-medium transition"
                >
                  Saya Mengerti
                </button>
              </div>
            </div>
          )}
        </>
      );
    }
    return null;
  }

  // Full Banner Card
  return (
    <>
      <div className="bg-gradient-to-r from-emerald-900 to-stone-900 text-white rounded-2xl p-3.5 shadow-sm relative overflow-hidden">
        <button
          onClick={dismiss}
          className="absolute top-2.5 right-2.5 text-stone-400 hover:text-white p-1 rounded-lg transition"
          aria-label="Tutup saran"
        >
          <X className="w-3.5 h-3.5" />
        </button>

        <div className="flex items-start gap-3 pr-6">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300 shrink-0">
            <Smartphone className="w-5 h-5" />
          </div>

          <div className="space-y-1">
            <h4 className="text-xs font-bold text-white tracking-tight">
              Jalankan Sebagai Aplikasi Ponsel
            </h4>
            <p className="text-[11px] text-stone-300 leading-relaxed">
              Pasang ke layar beranda handphone untuk akses instan satu sentuhan, mode layar penuh, dan notifikasi pengingat harian.
            </p>

            <div className="pt-2 flex items-center gap-2">
              {isInstallable ? (
                <button
                  onClick={install}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-bold text-[11px] rounded-xl transition shadow-xs active:scale-95"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Pasang Sekarang</span>
                </button>
              ) : isIOS ? (
                <button
                  onClick={() => setShowIOSModal(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-bold text-[11px] rounded-xl transition shadow-xs active:scale-95"
                >
                  <Share className="w-3.5 h-3.5" />
                  <span>Cara Pasang di iOS</span>
                </button>
              ) : (
                <div className="flex items-center gap-1 text-[11px] text-stone-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Dapat dipasang via menu browser ponsel (Tambahkan ke Layar Utama)</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {showIOSModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-[#1c1c1a] border border-transparent dark:border-[#282825] rounded-2xl p-5 max-w-sm w-full shadow-2xl text-xs space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-sm text-stone-900 dark:text-[#f4f4f1]">Pasang di iPhone / iPad</h4>
              <button
                onClick={() => setShowIOSModal(false)}
                className="p-1 text-stone-400 dark:text-stone-500 hover:text-stone-700 dark:hover:text-stone-200 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-stone-600 dark:text-stone-300">
              <div className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-bold flex items-center justify-center shrink-0 text-[10px]">
                  1
                </div>
                <p>
                  Buka aplikasi ini di browser <strong>Safari</strong> pada iPhone/iPad Anda.
                </p>
              </div>
              <div className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-bold flex items-center justify-center shrink-0 text-[10px]">
                  2
                </div>
                <p>
                  Ketuk tombol <strong>Bagikan (Share)</strong> <Share className="w-3.5 h-3.5 inline text-stone-700 dark:text-stone-300 -mt-0.5" /> di bilah bawah Safari.
                </p>
              </div>
              <div className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-bold flex items-center justify-center shrink-0 text-[10px]">
                  3
                </div>
                <p>
                  Gulir ke bawah dan ketuk <strong>"Tambah ke Layar Utama" (Add to Home Screen)</strong>.
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowIOSModal(false)}
              className="w-full py-2 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 rounded-xl font-medium transition"
            >
              Saya Mengerti
            </button>
          </div>
        </div>
      )}
    </>
  );
};
