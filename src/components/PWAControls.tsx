import React, { useState } from 'react';
import { Download, Smartphone, WifiOff, X } from 'lucide-react';
import { useOnlineStatus, usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  if (isInstalled) {
    return null;
  }

  if (isInstallable) {
    return (
      <button
        type="button"
        onClick={install}
        title="Install aplikasi ke perangkat"
        className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl bg-teal-950/80 hover:bg-teal-900 border border-teal-500/40 text-teal-200 transition-all shadow-sm"
      >
        <Download className="w-3.5 h-3.5 text-teal-300" />
        <span className="hidden xl:inline">Install App</span>
      </button>
    );
  }

  if (isIOS) {
    return (
      <>
        <button
          type="button"
          onClick={() => setShowIOSGuide(true)}
          title="Install di iPhone / iPad"
          className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl bg-teal-950/80 hover:bg-teal-900 border border-teal-500/40 text-teal-200 transition-all"
        >
          <Smartphone className="w-3.5 h-3.5 text-teal-300" />
          <span className="hidden xl:inline">Install iOS</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
            <div className="relative w-full max-w-sm rounded-2xl bg-[#0b1120] border border-cyan-500/40 p-6 shadow-2xl">
              <button
                type="button"
                onClick={() => setShowIOSGuide(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-2.5 mb-3">
                <div className="p-2 rounded-xl bg-cyan-950 border border-cyan-500/40 text-cyan-300">
                  <Smartphone className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white">Install di iPhone / iPad</h3>
              </div>
              <ol className="space-y-2 text-xs text-slate-300 leading-relaxed list-decimal list-inside">
                <li>
                  Ketuk ikon <strong className="text-white">Share</strong> (kotak dengan panah ke atas) di bilah Safari.
                </li>
                <li>
                  Gulir ke bawah dan pilih <strong className="text-cyan-300">Add to Home Screen</strong> (Tambahkan ke Layar Utama).
                </li>
                <li>
                  Ketuk <strong className="text-white">Add</strong> untuk membuka IT Club Lab layaknya aplikasi.
                </li>
              </ol>
              <button
                type="button"
                onClick={() => setShowIOSGuide(false)}
                className="mt-5 w-full rounded-xl bg-cyan-500 hover:bg-cyan-400 py-2.5 text-xs font-bold text-slate-950 transition-colors"
              >
                Mengerti
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50 flex items-center gap-2 rounded-xl bg-amber-950/95 border border-amber-500/50 px-3.5 py-2 text-xs font-semibold text-amber-200 shadow-2xl backdrop-blur-md">
      <WifiOff className="w-4 h-4 text-amber-400 animate-pulse" />
      <span>Mode Offline — Menampilkan data tersimpan sementara.</span>
    </div>
  );
};
