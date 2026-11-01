import React, { useState, useRef } from 'react';
import confetti from 'canvas-confetti';
import { 
  Sparkles, 
  X, 
  CheckCircle2, 
  CreditCard, 
  ArrowRight, 
  User, 
  BookOpen, 
  Phone, 
  ShieldCheck,
  Camera,
  Upload
} from 'lucide-react';
import { Student, DivisionType } from '../types';

interface JoinClubModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStudentRegistered: (student: Student) => void;
}

export const JoinClubModal: React.FC<JoinClubModalProps> = ({
  isOpen,
  onClose,
  onStudentRegistered,
}) => {
  const [name, setName] = useState('');
  const [nisn, setNisn] = useState('');
  const [studentClass, setStudentClass] = useState('X RPL 1');
  const [division, setDivision] = useState<DivisionType>('C# .NET');
  const [phone, setPhone] = useState('');
  const [motivation, setMotivation] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string>('https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=300&auto=format&fit=crop&q=80');
  const [isSuccess, setIsSuccess] = useState(false);
  const [registeredCard, setRegisteredCard] = useState<Student | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Pilih file gambar valid (JPG, PNG, WebP).');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      setAvatarUrl(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !nisn) return;

    const randomUid = `B${Math.floor(100 + Math.random() * 900)}-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(10 + Math.random() * 90)}`;
    const newStudent: Student = {
      id: `std-${Date.now()}`,
      nisn: nisn.trim(),
      name: name.trim(),
      class: studentClass,
      division: division,
      rfidUid: randomUid,
      qrCodeData: `ITCLUB:${nisn}:${name}:${studentClass}`,
      avatarUrl: avatarUrl || `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=300&auto=format&fit=crop&q=80`,
      email: `${name.toLowerCase().replace(/\s+/g, '.')}@student.sch.id`,
      phone: phone || '0812-3456-7890',
      joinedDate: new Date().toISOString().split('T')[0],
      status: 'Aktif',
      position: 'Anggota Baru 2026/2027',
    };

    onStudentRegistered(newStudent);
    setRegisteredCard(newStudent);
    setIsSuccess(true);

    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#06b6d4', '#14b8a6', '#8b5cf6', '#38bdf8'],
      });
    } catch {
      // Audio or animation fallback
    }
  };

  const handleResetAndClose = () => {
    setIsSuccess(false);
    setRegisteredCard(null);
    setName('');
    setNisn('');
    setPhone('');
    setMotivation('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg rounded-2xl bg-[#0b1120] border border-cyan-500/40 p-6 sm:p-8 shadow-2xl overflow-hidden">
        
        {/* Glow backdrop */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-600/15 blur-[60px] pointer-events-none rounded-full" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-violet-600/15 blur-[60px] pointer-events-none rounded-full" />

        <button
          onClick={handleResetAndClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-xl transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {!isSuccess ? (
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-xl bg-cyan-950 border border-cyan-500/40 text-cyan-400">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white tracking-tight">
                  Pendaftaran Anggota IT Club
                </h3>
                <p className="text-xs text-slate-400">
                  Tahun Ajaran 2026/2027 · Laboratorium Komputer
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Nama Lengkap Siswa
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: Farhan Ramadhan"
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              {/* Foto Profil Calon Anggota */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Camera className="w-3.5 h-3.5 text-cyan-400" />
                    Foto Profil Kartu Siswa
                  </span>
                  <span className="text-[10px] text-cyan-400 font-mono">Opsional / Pasfoto 3:4</span>
                </label>
                
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-3">
                  <div className="relative w-12 h-14 rounded-lg overflow-hidden border border-cyan-400/60 bg-slate-900 shrink-0 shadow-sm">
                    <img src={avatarUrl} alt="Preview Foto" className="w-full h-full object-cover" />
                  </div>
                  
                  <div className="flex-1">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handlePhotoUpload}
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3 py-1.5 rounded-lg border border-cyan-500/40 bg-cyan-950/30 hover:bg-cyan-900/40 text-cyan-300 hover:text-white text-xs font-medium flex items-center gap-1.5 transition-all"
                    >
                      <Upload className="w-3 h-3" />
                      <span>Unggah Foto dari HP / Komputer</span>
                    </button>
                    <p className="text-[10px] text-slate-400 mt-1">
                      Foto akan otomatis dicetak pada Kartu Identitas Resmi Siswa.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    NISN
                  </label>
                  <input
                    type="text"
                    value={nisn}
                    onChange={(e) => setNisn(e.target.value)}
                    placeholder="0081928371"
                    required
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm font-mono text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Kelas &amp; Jurusan
                  </label>
                  <input
                    type="text"
                    value={studentClass}
                    onChange={(e) => setStudentClass(e.target.value)}
                    placeholder="X RPL 1"
                    required
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Pilihan Divisi Minat
                </label>
                <select
                  value={division}
                  onChange={(e) => setDivision(e.target.value as DivisionType)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-400"
                >
                  <option value="Python Programming">Python Programming (Dasar, AI &amp; Otomasi)</option>
                  <option value="C# .NET">Pemrograman C# .NET (Software &amp; Game)</option>
                  <option value="Scratch">Scratch Creative Coding (Logika Pemula)</option>
                  <option value="Desain Grafis">Desain Grafis &amp; UI/UX Figma</option>
                  <option value="Jaringan Komputer">Jaringan Komputer &amp; Server MikroTik</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  No. WhatsApp / HP Siswa
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0812-xxxx-xxxx"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm font-mono text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="pt-3">
                <button
                  type="submit"
                  className="w-full py-3 px-4 rounded-xl font-bold text-sm text-slate-950 bg-gradient-to-r from-cyan-400 via-teal-300 to-cyan-400 hover:from-cyan-300 hover:to-teal-200 transition-all shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4 text-slate-950" />
                  <span>Kirim Formulir &amp; Terbitkan Kartu ID</span>
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* SUCCESS SCREEN WITH AUTO GENERATED CARD PREVIEW */
          <div className="text-center py-4 space-y-5 animate-fadeIn">
            <div className="w-16 h-16 mx-auto rounded-full bg-emerald-950/80 border border-emerald-500/50 flex items-center justify-center text-emerald-400 shadow-xl shadow-emerald-500/20">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-2xl font-extrabold text-white">
                Selamat Bergabung di IT Club!
              </h3>
              <p className="text-xs text-slate-300 mt-1">
                Data kamu telah terverifikasi ke sistem database Laboratorium Komputer.
              </p>
            </div>

            {/* Generated Card Identity Snapshot */}
            {registeredCard && (
              <div className="p-4 rounded-2xl bg-gradient-to-br from-[#0c162d] to-[#080d1a] border border-cyan-500/40 text-left space-y-2">
                <div className="flex items-center justify-between text-[11px] font-mono text-cyan-300">
                  <span>KARTU AKSES LAB RESMI</span>
                  <span>TA 2026/2027</span>
                </div>
                <div className="text-sm font-bold text-white">
                  {registeredCard.name}
                </div>
                <div className="text-xs text-slate-300 font-mono">
                  NISN: {registeredCard.nisn} · {registeredCard.class}
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
                  <span className="px-2 py-0.5 rounded bg-violet-950 text-violet-300 border border-violet-500/40 text-[10px]">
                    Divisi {registeredCard.division}
                  </span>
                  <span className="font-mono text-cyan-300 text-[11px]">
                    RFID: {registeredCard.rfidUid}
                  </span>
                </div>
              </div>
            )}

            <p className="text-xs text-slate-400">
              Kartu fisik dapat dicetak oleh Guru Pembimbing di menu "Cetak Kartu".
            </p>

            <button
              onClick={handleResetAndClose}
              className="w-full py-2.5 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold transition-all shadow-md"
            >
              Selesai &amp; Kembali ke Beranda
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
