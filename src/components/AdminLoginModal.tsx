import React, { useState } from 'react';
import { 
  ShieldCheck, 
  X, 
  KeyRound, 
  User, 
  AlertCircle, 
  Lock, 
  ArrowRight
} from 'lucide-react';
import { AdminUser } from '../types';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: AdminUser) => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
}) => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    setTimeout(() => {
      // Allow demo / configured credentials
      const valid = 
        (identifier.trim().toLowerCase() === 'gurulabit2026' || 
         identifier.trim() === '198503152010011002' || 
         identifier.trim().toLowerCase() === 'guru') &&
        (password === 'Labitclub2026' || password === 'guru123');

      if (valid) {
        const adminData: AdminUser = {
          isAuthenticated: true,
          name: 'Dwi Ambal Aziz, S.Kom',
          nip: '',
          role: 'guru_admin',
          email: 'dwi.aziz@labkomputer.sch.id',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
        };
        onLoginSuccess(adminData);
        onClose();
      } else {
        setError('NIP / Email atau Password guru tidak valid. Silakan coba lagi.');
      }
      setIsLoading(false);
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md rounded-2xl bg-[#0b1120] border border-violet-500/40 p-6 sm:p-8 shadow-2xl shadow-violet-950/60 overflow-hidden">
        
        {/* Glow ambient */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-violet-600/15 blur-[60px] pointer-events-none rounded-full" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-cyan-600/15 blur-[60px] pointer-events-none rounded-full" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-xl bg-violet-950/80 border border-violet-500/50 text-violet-300 shadow-md shadow-violet-500/20">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white tracking-tight">
              Portal Admin Guru
            </h3>
            <p className="text-xs text-slate-400">
              Autentikasi Pengelola &amp; Pembimbing Lab Komputer
            </p>
          </div>
        </div>

        {/* Role Notice */}
        <div className="mb-6 p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-slate-300 leading-relaxed flex items-start gap-2.5">
          <Lock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <span>
            Hanya <strong>Guru &amp; Tim Pembina</strong> yang dapat mengakses fitur Absensi RFID/QR, merubah jadwal, memvalidasi portofolio, dan mencetak kartu anggota siswa.
          </span>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-950/60 border border-red-500/50 text-xs text-red-200 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Email Guru / NIP
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="Contoh: 198503152010011002"
                required
                className="w-full pl-10 pr-4 py-2.5 bg-slate-950/80 border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Kata Sandi
            </label>
            <div className="relative">
              <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full pl-10 pr-4 py-2.5 bg-slate-950/80 border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 transition-all shadow-lg shadow-violet-900/40 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <span>Memverifikasi Akun...</span>
            ) : (
              <>
                <span>Masuk Sebagai Guru</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        

      </div>
    </div>
  );
};
