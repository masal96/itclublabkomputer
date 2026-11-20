import React, { useState } from 'react';
import {
  ShieldCheck,
  X,
  KeyRound,
  User,
  AlertCircle,
  Lock,
  ArrowRight,
  Users,
  Plus,
  Trash2,
  CheckCircle2,
} from 'lucide-react';
import { AdminRole, AdminUser, PembinaCardProfile, StaffRoleEntry } from '../types';
import {
  getStaffRoleByEmail,
  PRIMARY_PEMBINA_EMAIL,
  signInWithGoogleFirebase,
} from '../services/firebase';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: AdminUser) => void;
  pembinaProfile?: PembinaCardProfile;
  currentAdmin?: AdminUser;
  staffRoles?: StaffRoleEntry[];
  onSaveStaffRole?: (entry: StaffRoleEntry) => Promise<void> | void;
  onDeleteStaffRole?: (email: string) => Promise<void> | void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  pembinaProfile,
  currentAdmin,
  staffRoles = [],
  onSaveStaffRole,
  onDeleteStaffRole,
}) => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  // Staff role management form (visible when Pembina Utama is already logged in)
  const [newStaffEmail, setNewStaffEmail] = useState('');
  const [newStaffName, setNewStaffName] = useState('');
  const [newStaffRole, setNewStaffRole] = useState<AdminRole>('pengurus');
  const [roleSavedMsg, setRoleSavedMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    setError(null);
    setIsGoogleLoading(true);
    try {
      const fbUser = await signInWithGoogleFirebase();
      const email = (fbUser.email || '').trim().toLowerCase();
      if (!email) {
        setError('Akun Google tidak memiliki alamat email yang valid.');
        return;
      }

      const roleEntry = await getStaffRoleByEmail(email);
      if (!roleEntry) {
        setError(
          `Email "${email}" belum terdaftar sebagai Pembina atau Pengurus IT Club. Hubungi Pembina Utama untuk mendaftarkan akses Anda.`
        );
        return;
      }

      const isPembina = roleEntry.role === 'guru_admin';
      const adminData: AdminUser = {
        isAuthenticated: true,
        name: isPembina
          ? pembinaProfile?.name || fbUser.displayName || roleEntry.name
          : roleEntry.name || fbUser.displayName || 'Pengurus IT Club',
        nip: isPembina ? pembinaProfile?.nip || '' : '',
        role: roleEntry.role,
        email,
        avatar:
          (isPembina ? pembinaProfile?.avatarUrl : '') ||
          fbUser.photoURL ||
          'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
        authProvider: 'google',
      };

      onLoginSuccess(adminData);
      onClose();
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes('popup-closed-by-user')) {
        setError('Jendela login Google ditutup sebelum selesai.');
      } else {
        setError('Login Google tidak dapat dibuka di browser ini. Anda tetap bisa masuk menggunakan form kredensial server di bawah.');
      }
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleServerPasscodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: identifier.trim(),
          password,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success || !json.user) {
        setError(json.error || 'ID / Email atau kata sandi tidak valid.');
        return;
      }

      const user: AdminUser = json.user;
      if (user.role === 'guru_admin' && pembinaProfile) {
        user.name = pembinaProfile.name || user.name;
        user.nip = pembinaProfile.nip || user.nip;
        user.avatar = pembinaProfile.avatarUrl || user.avatar;
        user.email = pembinaProfile.email || user.email;
      }

      onLoginSuccess(user);
      onClose();
    } catch {
      setError('Gagal terhubung ke server autentikasi. Pastikan server berjalan.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!onSaveStaffRole || !newStaffEmail.trim() || !newStaffName.trim()) return;
    await onSaveStaffRole({
      email: newStaffEmail.trim().toLowerCase(),
      name: newStaffName.trim(),
      role: newStaffRole,
      addedBy: currentAdmin?.email || PRIMARY_PEMBINA_EMAIL,
      createdAt: new Date().toISOString(),
    });
    setRoleSavedMsg(`Akses ${newStaffRole === 'guru_admin' ? 'Pembina' : 'Pengurus'} untuk ${newStaffEmail} berhasil disimpan.`);
    setNewStaffEmail('');
    setNewStaffName('');
    setTimeout(() => setRoleSavedMsg(null), 3500);
  };

  const isManagingRoles = currentAdmin?.isAuthenticated && currentAdmin.role === 'guru_admin';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md rounded-2xl bg-[#0b1120] border border-violet-500/40 p-6 sm:p-8 shadow-2xl shadow-violet-950/60 overflow-hidden max-h-[92vh] overflow-y-auto">
        <div className="absolute top-0 right-0 w-48 h-48 bg-violet-600/15 blur-[60px] pointer-events-none rounded-full" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-cyan-600/15 blur-[60px] pointer-events-none rounded-full" />

        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="p-3 rounded-xl bg-violet-950/80 border border-violet-500/50 text-violet-300 shadow-md shadow-violet-500/20">
            {isManagingRoles ? <Users className="w-6 h-6" /> : <ShieldCheck className="w-6 h-6" />}
          </div>
          <div>
            <h3 className="text-xl font-bold text-white tracking-tight">
              {isManagingRoles ? 'Kelola Akses Multi-Role' : 'Portal Admin & Pengurus'}
            </h3>
            <p className="text-xs text-slate-400">
              {isManagingRoles
                ? 'Atur akun Google Pembina & Pengurus IT Club'
                : 'Autentikasi Terverifikasi Pembina & Pengurus Lab'}
            </p>
          </div>
        </div>

        {/* If Pembina Utama is already logged in, show Multi-Role Access Manager */}
        {isManagingRoles ? (
          <div className="space-y-4">
            <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-slate-300 leading-relaxed">
              <strong className="text-cyan-300">Perbedaan Hak Akses:</strong>
              <ul className="mt-1 space-y-1 text-[11px] text-slate-400 list-disc list-inside">
                <li><strong>Pembina Utama:</strong> Akses penuh (Reset Absensi, Hapus Anggota, Penilaian/Rapor, Kartu Pembina).</li>
                <li><strong>Pengurus IT Club:</strong> Bantu operasional Absensi/Kiosk, Kegiatan, Modul, Portofolio, &amp; Inventaris tanpa akses Reset/Nilai.</li>
              </ul>
            </div>

            {roleSavedMsg && (
              <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-xs text-emerald-200 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{roleSavedMsg}</span>
              </div>
            )}

            <form onSubmit={handleAddStaff} className="space-y-2.5 p-3.5 rounded-xl bg-slate-950 border border-slate-800">
              <div className="text-xs font-bold text-white">Tambah Akun Google Pengurus / Pembina</div>
              <input
                type="text"
                required
                value={newStaffName}
                onChange={(e) => setNewStaffName(e.target.value)}
                placeholder="Nama Lengkap (cth: Ketua IT Club)"
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
              />
              <input
                type="email"
                required
                value={newStaffEmail}
                onChange={(e) => setNewStaffEmail(e.target.value)}
                placeholder="Email Google (cth: pengurus@gmail.com)"
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white font-mono"
              />
              <div className="flex gap-2">
                <select
                  value={newStaffRole}
                  onChange={(e) => setNewStaffRole(e.target.value as AdminRole)}
                  className="flex-1 px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
                >
                  <option value="pengurus">Pengurus IT Club (Operasional)</option>
                  <option value="guru_admin">Pembina / Guru (Akses Penuh)</option>
                </select>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-extrabold flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tambah</span>
                </button>
              </div>
            </form>

            <div className="space-y-2">
              <div className="text-[11px] font-mono text-slate-400 uppercase">Daftar Akses Terdaftar</div>
              <div className="p-3 rounded-xl bg-violet-950/30 border border-violet-500/30 flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-white">{pembinaProfile?.name || 'Pembina Utama'}</div>
                  <div className="text-[11px] font-mono text-violet-300">{PRIMARY_PEMBINA_EMAIL}</div>
                </div>
                <span className="px-2 py-0.5 rounded bg-violet-500/20 text-violet-200 text-[10px] font-bold">
                  Pembina Utama
                </span>
              </div>
              {staffRoles.map((entry) => (
                <div
                  key={entry.email}
                  className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-2 text-xs"
                >
                  <div className="min-w-0">
                    <div className="font-bold text-white truncate">{entry.name}</div>
                    <div className="text-[11px] font-mono text-slate-400 truncate">{entry.email}</div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        entry.role === 'guru_admin'
                          ? 'bg-violet-500/20 text-violet-200'
                          : 'bg-cyan-500/20 text-cyan-200'
                      }`}
                    >
                      {entry.role === 'guru_admin' ? 'Pembina' : 'Pengurus'}
                    </span>
                    {onDeleteStaffRole && (
                      <button
                        type="button"
                        onClick={() => onDeleteStaffRole(entry.email)}
                        className="p-1 rounded-lg bg-rose-950/50 hover:bg-rose-900 text-rose-300"
                        title="Cabut akses"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <>
            {/* Role Notice */}
            <div className="mb-5 p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-slate-300 leading-relaxed flex items-start gap-2.5">
              <Lock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span>
                Gunakan <strong>Login Google Resmi</strong> (Firebase Auth) atau akun kredensial server untuk masuk sebagai <strong>Pembina Utama</strong> maupun <strong>Pengurus IT Club</strong>.
              </span>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-red-950/60 border border-red-500/50 text-xs text-red-200 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Primary: Firebase Google Auth */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isGoogleLoading}
              className="w-full py-3 px-4 rounded-xl font-bold text-sm text-slate-950 bg-white hover:bg-slate-100 transition-all shadow-lg flex items-center justify-center gap-2.5 disabled:opacity-60 mb-4"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z" />
                <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.29v3.14C3.26 21.3 7.31 24 12 24z" />
                <path fill="#FBBC05" d="M5.28 14.24c-.24-.72-.38-1.49-.38-2.24s.14-1.52.38-2.24V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.99-3.14z" />
                <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.99 3.14c.95-2.85 3.6-4.96 6.72-4.96z" />
              </svg>
              <span>{isGoogleLoading ? 'Menghubungkan Google...' : 'Masuk dengan Akun Google (Direkomendasikan)'}</span>
            </button>

            <div className="relative flex items-center my-4">
              <div className="flex-grow border-t border-slate-800" />
              <span className="shrink-0 mx-3 text-[10px] font-mono uppercase text-slate-500">
                atau login kredensial server
              </span>
              <div className="flex-grow border-t border-slate-800" />
            </div>

            {/* Secondary: Server-Verified Login Form (No hardcoded password in client JS) */}
            <form onSubmit={handleServerPasscodeSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  NIP / Email Pembina / ID Pengurus
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="Email Pembina, NIP, atau pengurus"
                    required
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950/80 border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-mono"
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
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950/80 border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 transition-all shadow-lg shadow-violet-900/40 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <span>Memverifikasi ke Server...</span>
                ) : (
                  <>
                    <span>Masuk Portal</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};
