import React, { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  User, 
  Users, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight,
  Trophy
} from 'lucide-react';
import { ActivityEvent } from '../types';

interface KegiatanSectionProps {
  activities: ActivityEvent[];
  onOpenJoinModal: () => void;
}

export const KegiatanSection: React.FC<KegiatanSectionProps> = ({ activities, onOpenJoinModal }) => {
  const [registeredIds, setRegisteredIds] = useState<string[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleRegister = (id: string, title: string) => {
    if (registeredIds.includes(id)) return;
    setRegisteredIds((prev) => [...prev, id]);
    setToastMessage(`Berhasil mendaftar ke kegiatan: "${title}". Notifikasi telah dikirim ke WA pembimbing.`);
    setTimeout(() => setToastMessage(null), 4000);
  };

  return (
    <section className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs uppercase tracking-wider mb-2">
            <Trophy className="w-4 h-4" />
            <span>Agenda &amp; Kompetisi Siswa</span>
          </div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">
            Kegiatan &amp; Workshop IT Club
          </h2>
          <p className="text-sm text-slate-400 mt-1 max-w-xl">
            Ikuti sesi coding maraton, workshop sertifikasi jaringan, dan kompetisi internal laboratorium sekolah.
          </p>
        </div>

        <button
          onClick={onOpenJoinModal}
          className="self-start md:self-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-teal-400 to-cyan-400 text-slate-950 text-xs font-bold hover:opacity-95 shadow-md shadow-cyan-500/20"
        >
          Gabung Member IT Club
        </button>
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="mb-6 p-4 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-200 text-xs flex items-center gap-3 animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Activities Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {activities.map((act) => {
          const isRegistered = registeredIds.includes(act.id);
          const currentCount = act.registeredCount + (isRegistered ? 1 : 0);
          const isFull = currentCount >= act.maxParticipants;

          return (
            <div
              key={act.id}
              className="rounded-2xl bg-[#0b1120] border border-slate-800 hover:border-cyan-500/40 p-6 shadow-xl transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-4">
                  <span className="px-2.5 py-0.5 rounded text-[11px] font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-500/30">
                    {act.category}
                  </span>
                  <span className="text-xs font-mono text-emerald-400">
                    {act.status}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-white mb-3 leading-snug">
                  {act.title}
                </h3>

                <p className="text-xs text-slate-400 leading-relaxed mb-6">
                  {act.description}
                </p>

                <div className="space-y-2 text-xs text-slate-300 mb-6 bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span>{act.date}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                    <span className="font-mono">{act.time}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-violet-400 shrink-0" />
                    <span>{act.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{act.speaker}</span>
                  </div>
                </div>
              </div>

              <div>
                {/* Capacity Counter */}
                <div className="mb-4">
                  <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-1">
                    <span>Kuota Peserta Lab:</span>
                    <span className="text-cyan-300 font-bold tabular-nums">
                      {currentCount} / {act.maxParticipants} Kursi
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-400 to-teal-400 rounded-full"
                      style={{
                        width: `${Math.min(100, (currentCount / act.maxParticipants) * 100)}%`,
                      }}
                    />
                  </div>
                </div>

                <button
                  onClick={() => handleRegister(act.id, act.title)}
                  disabled={isRegistered || isFull}
                  className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                    isRegistered
                      ? 'bg-emerald-950 border border-emerald-500/50 text-emerald-300'
                      : isFull
                      ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-md shadow-cyan-500/20'
                  }`}
                >
                  {isRegistered ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>Sudah Terdaftar</span>
                    </>
                  ) : isFull ? (
                    <span>Kuota Penuh</span>
                  ) : (
                    <>
                      <span>Ikuti Kegiatan Ini</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>

            </div>
          );
        })}
      </div>

    </section>
  );
};
