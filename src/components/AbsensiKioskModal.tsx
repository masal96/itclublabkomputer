import React, { useEffect, useState } from 'react';
import {
  Radio,
  QrCode,
  Volume2,
  VolumeX,
  Minimize2,
  CheckCircle2,
  Clock,
  Award,
  Camera,
  CameraOff,
  AlertTriangle,
} from 'lucide-react';
import { AttendanceRecord, Student } from '../types';

interface AbsensiKioskModalProps {
  isOpen: boolean;
  onClose: () => void;
  lastScannedStudent: { student: Student; record: AttendanceRecord } | null;
  scanMessage: { type: 'success' | 'error' | 'info'; text: string } | null;
  isAudioMuted: boolean;
  onToggleMute: () => void;
  onManualRfidSubmit: (uid: string) => void;
  isCameraActive: boolean;
  onToggleCamera: () => void;
  videoRef: React.RefObject<HTMLVideoElement | null>;
}

export const AbsensiKioskModal: React.FC<AbsensiKioskModalProps> = ({
  isOpen,
  onClose,
  lastScannedStudent,
  scanMessage,
  isAudioMuted,
  onToggleMute,
  onManualRfidSubmit,
  isCameraActive,
  onToggleCamera,
  videoRef,
}) => {
  const [clock, setClock] = useState(new Date());
  const [kioskInput, setKioskInput] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    const t = setInterval(() => setClock(new Date()), 1000);
    // Request browser fullscreen gently if supported
    if (document.documentElement.requestFullscreen && !document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    }
    return () => {
      clearInterval(t);
    };
  }, [isOpen]);

  const handleExit = () => {
    if (document.fullscreenElement && document.exitFullscreen) {
      document.exitFullscreen().catch(() => {});
    }
    onClose();
  };

  if (!isOpen) return null;

  const isPembina =
    lastScannedStudent?.record.isPembina ||
    lastScannedStudent?.student.id === 'pembina_card';

  return (
    <div className="fixed inset-0 z-[70] bg-[#050812] text-slate-100 flex flex-col justify-between p-6 sm:p-10 overflow-y-auto">
      {/* Subtle Ambient Glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-cyan-500/10 blur-[120px]" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-violet-600/10 blur-[120px]" />
      </div>

      {/* Top Bar */}
      <div className="relative z-10 flex items-center justify-between gap-4 border-b border-cyan-900/40 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-cyan-400 to-violet-600 p-[1.5px]">
            <div className="w-full h-full rounded-[14px] bg-[#080c16] flex items-center justify-center">
              <Radio className="w-6 h-6 text-cyan-400 animate-pulse" />
            </div>
          </div>
          <div>
            <div className="text-lg sm:text-xl font-extrabold text-white tracking-tight">
              TERMINAL PRESENSI LAB KOMPUTER &amp; IT CLUB
            </div>
            <div className="text-xs font-mono text-cyan-400">
              MODE KIOSK LAYAR PENUH · RFID 13.56 MHz &amp; QR CODE SIAP PINDAI
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={onToggleCamera}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold border flex items-center gap-1.5 transition-all ${
              isCameraActive
                ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200'
                : 'bg-slate-900 border-slate-700 text-slate-300 hover:text-white'
            }`}
          >
            {isCameraActive ? <CameraOff className="w-4 h-4" /> : <Camera className="w-4 h-4" />}
            <span className="hidden sm:inline">{isCameraActive ? 'Matikan Kamera QR' : 'Aktifkan Kamera QR'}</span>
          </button>

          <button
            type="button"
            onClick={onToggleMute}
            className="p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 hover:text-cyan-300"
            title={isAudioMuted ? 'Aktifkan Suara' : 'Bisukan Suara'}
          >
            {isAudioMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-cyan-300" />}
          </button>

          <button
            type="button"
            onClick={handleExit}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-bold text-slate-200 flex items-center gap-1.5"
          >
            <Minimize2 className="w-4 h-4 text-amber-400" />
            <span>Keluar Kiosk</span>
          </button>
        </div>
      </div>

      {/* Main Center Stage */}
      <div className="relative z-10 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center my-6 max-w-6xl w-full mx-auto">
        {/* Left: Live Clock & Tap Prompt */}
        <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
          <div>
            <div className="text-5xl sm:text-7xl font-mono font-black tracking-tight text-white">
              {clock.toLocaleTimeString('id-ID', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
              })}
              <span className="text-xl sm:text-2xl text-cyan-400 ml-2">WIB</span>
            </div>
            <div className="text-sm sm:text-base text-slate-400 mt-1">
              {clock.toLocaleDateString('id-ID', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-[#0b1120]/90 border border-cyan-500/35 shadow-2xl space-y-4">
            <div className="flex items-center justify-center lg:justify-start gap-3">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-400/50 flex items-center justify-center">
                <Radio className="w-6 h-6 text-cyan-300 animate-ping" />
              </div>
              <div className="text-left">
                <h2 className="text-lg font-extrabold text-white">
                  Silakan Tap Kartu RFID Anda
                </h2>
                <p className="text-xs text-slate-400">
                  Tempelkan kartu anggota siswa / kartu Pembina ke reader atau arahkan QR ke kamera.
                </p>
              </div>
            </div>

            {isCameraActive && (
              <div className="relative rounded-2xl overflow-hidden border border-cyan-500/40 bg-black aspect-video">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 border-2 border-cyan-400/50 m-6 rounded-xl pointer-events-none" />
                <span className="absolute bottom-2 left-3 px-2.5 py-1 rounded-lg bg-slate-950/80 text-[11px] font-mono text-cyan-300 flex items-center gap-1.5">
                  <QrCode className="w-3.5 h-3.5" /> Scanner QR Aktif
                </span>
              </div>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (kioskInput.trim()) {
                  onManualRfidSubmit(kioskInput.trim());
                  setKioskInput('');
                }
              }}
              className="flex gap-2 pt-2"
            >
              <input
                type="text"
                value={kioskInput}
                onChange={(e) => setKioskInput(e.target.value)}
                placeholder="Input manual UID RFID / NIS lalu tekan Enter..."
                className="flex-1 px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white font-mono focus:border-cyan-400 focus:outline-none"
              />
              <button
                type="submit"
                className="px-5 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-extrabold"
              >
                Tap
              </button>
            </form>
          </div>
        </div>

        {/* Right: Large Greeting & Identity Display */}
        <div className="lg:col-span-6">
          {scanMessage && (
            <div
              className={`mb-4 p-4 rounded-2xl border text-sm font-bold flex items-center gap-2.5 ${
                scanMessage.type === 'error'
                  ? 'bg-rose-950/70 border-rose-500/50 text-rose-200'
                  : scanMessage.type === 'info'
                  ? 'bg-amber-950/70 border-amber-500/50 text-amber-200'
                  : 'bg-emerald-950/70 border-emerald-500/50 text-emerald-200'
              }`}
            >
              {scanMessage.type === 'error' ? (
                <AlertTriangle className="w-5 h-5 shrink-0 text-rose-400" />
              ) : (
                <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400" />
              )}
              <span>{scanMessage.text}</span>
            </div>
          )}

          {lastScannedStudent ? (
            <div
              className={`p-8 rounded-3xl border shadow-2xl text-center space-y-5 ${
                isPembina
                  ? 'bg-gradient-to-b from-amber-950/40 to-[#0b1120] border-amber-500/50'
                  : 'bg-gradient-to-b from-cyan-950/35 to-[#0b1120] border-cyan-500/40'
              }`}
            >
              <div className="flex justify-center">
                <div
                  className={`relative w-28 h-28 rounded-3xl overflow-hidden border-4 shadow-xl ${
                    isPembina ? 'border-amber-400' : 'border-cyan-400'
                  }`}
                >
                  <img
                    src={lastScannedStudent.student.avatarUrl}
                    alt={lastScannedStudent.student.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              <div>
                {isPembina && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/50 text-amber-300 text-xs font-mono font-bold mb-2">
                    <Award className="w-3.5 h-3.5" /> PEMBINA LAB &amp; IT CLUB
                  </span>
                )}
                <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
                  {lastScannedStudent.student.name}
                </h3>
                <p className="text-sm font-mono text-slate-300 mt-1">
                  {isPembina ? 'NIP' : 'NIS'}: {lastScannedStudent.student.nisn} · {lastScannedStudent.student.class}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800">
                  <div className="text-[11px] text-slate-400">Tipe Presensi</div>
                  <div className="text-lg font-extrabold text-cyan-300 mt-0.5">
                    Tap {lastScannedStudent.record.tapType || 'Masuk'}
                  </div>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800">
                  <div className="text-[11px] text-slate-400">Status Kehadiran</div>
                  <div
                    className={`text-lg font-extrabold mt-0.5 ${
                      lastScannedStudent.record.status === 'Terlambat'
                        ? 'text-amber-300'
                        : 'text-emerald-300'
                    }`}
                  >
                    {lastScannedStudent.record.status}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-10 rounded-3xl bg-[#0b1120]/70 border border-slate-800 text-center space-y-3">
              <Clock className="w-12 h-12 text-cyan-400/60 mx-auto" />
              <div className="text-lg font-bold text-white">Menunggu Pemindaian Kartu...</div>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Jadwal Masuk: 11:15 WIB (batas toleransi 11:25 WIB) · Jadwal Pulang: 13:40 WIB.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Footer Info */}
      <div className="relative z-10 text-center text-[11px] font-mono text-slate-500 border-t border-slate-900 pt-3">
        Anti Tap-Ganda Aktif (Jeda 5 Detik/Kartu) · Sinkronisasi Otomatis ke Cloud Lab Komputer
      </div>
    </div>
  );
};
