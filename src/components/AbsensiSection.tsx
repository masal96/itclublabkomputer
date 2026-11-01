import React, { useState, useEffect, useRef } from 'react';
import { 
  Radio, 
  QrCode, 
  Camera, 
  CheckCircle2, 
  AlertCircle, 
  Search, 
  Download, 
  Clock, 
  Calendar, 
  Volume2, 
  VolumeX,
  LogIn,
  LogOut,
  Lock, 
  UserCheck, 
  ShieldAlert, 
  CreditCard,
  Sparkles, 
  ArrowRight,
  Filter,
  Check,
  RefreshCw,
  Info
} from 'lucide-react';
import { Student, AttendanceRecord, AdminUser } from '../types';
import { soundEffects } from '../utils/audio';

interface AbsensiSectionProps {
  admin: AdminUser;
  students: Student[];
  attendanceRecords: AttendanceRecord[];
  onAddAttendance: (record: AttendanceRecord) => void;
  onOpenAdminModal: () => void;
}

export const AbsensiSection: React.FC<AbsensiSectionProps> = ({
  admin,
  students,
  attendanceRecords,
  onAddAttendance,
  onOpenAdminModal,
}) => {
  const [activeMode, setActiveMode] = useState<'rfid' | 'qrcode' | 'manual'>('rfid');
  const [tapMode, setTapMode] = useState<'auto' | 'masuk' | 'pulang'>('auto');
  const [isAudioMuted, setIsAudioMuted] = useState(soundEffects.getIsMuted());
  const [testAudioPlaying, setTestAudioPlaying] = useState<'masuk' | 'pulang' | null>(null);

  // Time simulation: null = Real-time device clock, or 'HH:mm' string (e.g. '11:15', '11:26', '13:40')
  const [simulatedTime, setSimulatedTime] = useState<string | null>(null);

  const [manualUid, setManualUid] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'Hadir' | 'Terlambat' | 'Masuk' | 'Pulang'>('all');
  const [lastScannedStudent, setLastScannedStudent] = useState<{
    student: Student;
    record: AttendanceRecord;
  } | null>(null);
  const [scanMessage, setScanMessage] = useState<{
    type: 'success' | 'error' | 'info';
    text: string;
  } | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Helper to obtain the effective date/time (real-time or simulated)
  const getEffectiveDate = (): Date => {
    const d = new Date();
    if (simulatedTime) {
      const [h, m] = simulatedTime.split(':').map(Number);
      if (!isNaN(h) && !isNaN(m)) {
        d.setHours(h, m, 0, 0);
      }
    }
    return d;
  };

  const setPresetTime = (hours: number, minutes: number) => {
    const timeStr = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
    setSimulatedTime(timeStr);
  };

  // Evaluate attendance status & notes according to schedule:
  // - Masuk: 11:15 WIB
  // - Batas Terlambat: 11:25 WIB (lewat 11:25 dihitung Terlambat)
  // - Pulang: 13:40 WIB
  const evaluateAttendance = (tapType: 'Masuk' | 'Pulang', date: Date) => {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const totalMinutes = hours * 60 + minutes;

    const MASUK_SCHEDULE_MINS = 11 * 60 + 15; // 11:15
    const LATE_THRESHOLD_MINS = 11 * 60 + 25; // 11:25
    const PULANG_SCHEDULE_MINS = 13 * 60 + 40; // 13:40

    if (tapType === 'Masuk') {
      const isLate = totalMinutes > LATE_THRESHOLD_MINS;
      const isEarly = totalMinutes < MASUK_SCHEDULE_MINS;
      const status: 'Hadir' | 'Terlambat' = isLate ? 'Terlambat' : 'Hadir';

      let notes = 'Tap Masuk Tepat Waktu (Jadwal 11:15)';
      if (isLate) {
        const lateBy = totalMinutes - LATE_THRESHOLD_MINS;
        notes = `Tap Masuk Terlambat ${lateBy} menit (Lewat batas 11:25)`;
      } else if (isEarly) {
        const earlyBy = MASUK_SCHEDULE_MINS - totalMinutes;
        notes = `Tap Masuk Lebih Awal ${earlyBy} menit (Sebelum 11:15)`;
      }

      return { status, notes, isLate };
    } else {
      // Tap Pulang
      const isEarlyDeparture = totalMinutes < PULANG_SCHEDULE_MINS;
      let notes = 'Tap Pulang Sesuai Jadwal (13:40)';
      if (isEarlyDeparture) {
        const earlyBy = PULANG_SCHEDULE_MINS - totalMinutes;
        notes = `Tap Pulang Lebih Awal ${earlyBy} menit (Sebelum jam 13:40)`;
      }
      return { status: 'Hadir' as const, notes, isLate: false };
    }
  };

  // 1. Physical USB RFID Reader Hardware Listener
  useEffect(() => {
    let buffer = '';
    let lastKeyTime = Date.now();

    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isInput = target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA');

      const currentTime = Date.now();
      if (currentTime - lastKeyTime > 250) {
        buffer = '';
      }
      lastKeyTime = currentTime;

      if (e.key === 'Enter') {
        if (buffer.length >= 4) {
          processRfidUid(buffer.trim());
          buffer = '';
        }
      } else if (e.key.length === 1) {
        buffer += e.key;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [students, attendanceRecords, tapMode, simulatedTime]);

  // Handle Camera feed for QR Code
  useEffect(() => {
    let stream: MediaStream | null = null;
    if (activeMode === 'qrcode' && isCameraActive) {
      navigator.mediaDevices?.getUserMedia({ video: { facingMode: 'environment' } })
        .then((s) => {
          stream = s;
          if (videoRef.current) {
            videoRef.current.srcObject = s;
          }
        })
        .catch(() => {
          setScanMessage({
            type: 'error',
            text: 'Izin kamera ditolak atau kamera tidak ditemukan. Gunakan mode uji simulasi di bawah.',
          });
          setIsCameraActive(false);
        });
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [activeMode, isCameraActive]);

  // Helper to determine whether tap is Masuk or Pulang
  const resolveTapType = (studentId: string, forcedType?: 'Masuk' | 'Pulang', checkTime?: Date): 'Masuk' | 'Pulang' => {
    if (forcedType) return forcedType;
    if (tapMode === 'masuk') return 'Masuk';
    if (tapMode === 'pulang') return 'Pulang';

    const now = checkTime || getEffectiveDate();
    const totalMinutes = now.getHours() * 60 + now.getMinutes();
    const PULANG_SCHEDULE_MINS = 13 * 60 + 40; // 13:40

    // Auto smart detection for today's session
    const todayRecords = attendanceRecords.filter(
      (a) => a.studentId === studentId && new Date(a.timestamp).toDateString() === now.toDateString()
    );
    const hasCheckedIn = todayRecords.some((a) => a.tapType === 'Masuk' || !a.tapType);
    const hasCheckedOut = todayRecords.some((a) => a.tapType === 'Pulang');

    // Jika sudah tap masuk dan belum tap pulang, otomatis jadi Tap Pulang
    if (hasCheckedIn && !hasCheckedOut) {
      return 'Pulang';
    }

    // Jika waktu sudah memasuki jam pulang 13:40 dan sudah pernah hadir
    if (totalMinutes >= PULANG_SCHEDULE_MINS && hasCheckedIn) {
      return 'Pulang';
    }

    return 'Masuk';
  };

  // Test sound effects
  const handleTestAudio = (type: 'masuk' | 'pulang') => {
    if (isAudioMuted) {
      soundEffects.setMuted(false);
      setIsAudioMuted(false);
    }
    soundEffects.unlockContext();
    setTestAudioPlaying(type);
    soundEffects.testVoice(type);
    setTimeout(() => {
      setTestAudioPlaying(null);
    }, 2800);
  };

  // Toggle Mute Audio
  const handleToggleMute = () => {
    const nextMuted = !isAudioMuted;
    soundEffects.setMuted(nextMuted);
    setIsAudioMuted(nextMuted);
    if (!nextMuted) {
      soundEffects.unlockContext();
    }
  };

  // Process RFID Tap
  const processRfidUid = (uid: string, forcedTapType?: 'Masuk' | 'Pulang') => {
    const cleanUid = uid.trim().toUpperCase();
    const student = students.find(
      (s) => s.rfidUid.toUpperCase() === cleanUid || s.nisn === cleanUid
    );

    if (student) {
      const now = getEffectiveDate();
      const tapType = resolveTapType(student.id, forcedTapType, now);
      const { status, notes, isLate } = evaluateAttendance(tapType, now);

      const timeFormatted = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

      const newRecord: AttendanceRecord = {
        id: `att-${Date.now()}`,
        timestamp: now.toISOString(),
        studentId: student.id,
        studentName: student.name,
        class: student.class,
        nisn: student.nisn,
        division: student.division,
        method: 'RFID',
        status: status,
        tapType: tapType,
        sessionTitle: 'Sesi Praktikum Lab & IT Club',
        notes: notes,
      };

      onAddAttendance(newRecord);
      setLastScannedStudent({ student, record: newRecord });

      if (tapType === 'Masuk') {
        soundEffects.playTapMasuk();
        setScanMessage({
          type: isLate ? 'info' : 'success',
          text: isLate
            ? `⚠️ TAP MASUK (TERLAMBAT ${timeFormatted} WIB): "Selamat datang di IT Club, ${student.name}!" (${student.class}) · Batas toleransi 11:25`
            : `🟢 TAP MASUK BERHASIL (${timeFormatted} WIB): "Selamat datang di IT Club, ${student.name}!" (${student.class}) · Tepat Waktu (Jadwal 11:15)`,
        });
      } else {
        soundEffects.playTapPulang();
        setScanMessage({
          type: 'success',
          text: `🔵 TAP PULANG BERHASIL (${timeFormatted} WIB): "Terima kasih, hati-hati di jalan ya ${student.name}!" (${student.class}) · Jadwal Pulang 13:40`,
        });
      }

      setManualUid('');
    } else {
      soundEffects.playRfidError();
      setScanMessage({
        type: 'error',
        text: `Kartu RFID [${cleanUid}] Tidak Terdaftar dalam database IT Club!`,
      });
    }
  };

  // Process QR Code Scan
  const processQrData = (qrText: string, forcedTapType?: 'Masuk' | 'Pulang') => {
    const student = students.find(
      (s) => s.qrCodeData === qrText || s.nisn === qrText || qrText.includes(s.nisn)
    );

    if (student) {
      const now = getEffectiveDate();
      const tapType = resolveTapType(student.id, forcedTapType, now);
      const { status, notes, isLate } = evaluateAttendance(tapType, now);

      const timeFormatted = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

      const newRecord: AttendanceRecord = {
        id: `att-${Date.now()}`,
        timestamp: now.toISOString(),
        studentId: student.id,
        studentName: student.name,
        class: student.class,
        nisn: student.nisn,
        division: student.division,
        method: 'QR Code',
        status: status,
        tapType: tapType,
        sessionTitle: 'Sesi Praktikum Lab & IT Club',
        notes: notes,
      };

      onAddAttendance(newRecord);
      setLastScannedStudent({ student, record: newRecord });

      if (tapType === 'Masuk') {
        soundEffects.playTapMasuk();
        setScanMessage({
          type: isLate ? 'info' : 'success',
          text: isLate
            ? `⚠️ SCAN QR MASUK (TERLAMBAT ${timeFormatted} WIB): "Selamat datang di IT Club, ${student.name}!" · Batas toleransi 11:25`
            : `🟢 SCAN QR MASUK BERHASIL (${timeFormatted} WIB): "Selamat datang di IT Club, ${student.name}!" · Tepat Waktu`,
        });
      } else {
        soundEffects.playTapPulang();
        setScanMessage({
          type: 'success',
          text: `🔵 SCAN QR PULANG BERHASIL (${timeFormatted} WIB): "Terima kasih, hati-hati di jalan ya ${student.name}!" · Jadwal Pulang 13:40`,
        });
      }
    } else {
      soundEffects.playRfidError();
      setScanMessage({
        type: 'error',
        text: 'Data QR Code tidak cocok dengan data siswa terdaftar!',
      });
    }
  };

  // Export Attendance to CSV
  const handleExportCsv = () => {
    const headers = ['ID', 'Waktu', 'Tipe', 'Nama Siswa', 'NISN', 'Kelas', 'Divisi', 'Metode', 'Status', 'Catatan'];
    const rows = attendanceRecords.map((r) => [
      r.id,
      new Date(r.timestamp).toLocaleString('id-ID'),
      r.tapType || 'Masuk',
      `"${r.studentName}"`,
      r.nisn,
      `"${r.class}"`,
      `"${r.division}"`,
      r.method,
      r.status,
      `"${r.notes || ''}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Presensi_LabKomputer_ITClub_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter records
  const filteredRecords = attendanceRecords.filter((rec) => {
    const matchQuery = 
      rec.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rec.class.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rec.nisn.includes(searchQuery);
    
    let matchStatus = true;
    if (filterStatus === 'Hadir' || filterStatus === 'Terlambat') {
      matchStatus = rec.status === filterStatus;
    } else if (filterStatus === 'Masuk') {
      matchStatus = rec.tapType === 'Masuk' || !rec.tapType;
    } else if (filterStatus === 'Pulang') {
      matchStatus = rec.tapType === 'Pulang';
    }

    return matchQuery && matchStatus;
  });

  // Calculate statistics
  const totalHadir = attendanceRecords.filter((r) => r.status === 'Hadir').length;
  const totalTerlambat = attendanceRecords.filter((r) => r.status === 'Terlambat').length;
  const totalMasuk = attendanceRecords.filter((r) => r.tapType === 'Masuk' || !r.tapType).length;
  const totalPulang = attendanceRecords.filter((r) => r.tapType === 'Pulang').length;
  const totalPresensi = attendanceRecords.length;

  // IF NOT AUTHENTICATED AS TEACHER / GURU ADMIN
  if (!admin.isAuthenticated) {
    return (
      <section className="py-20 px-4 max-w-4xl mx-auto text-center tech-grid-pattern">
        <div className="p-8 sm:p-12 rounded-3xl bg-[#0b1120] border border-violet-500/40 shadow-2xl shadow-violet-950/50 backdrop-blur-md">
          <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-violet-950/80 border border-violet-500/50 flex items-center justify-center text-violet-300 shadow-lg shadow-violet-500/30">
            <Lock className="w-8 h-8 text-amber-400" />
          </div>

          <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-amber-500/10 text-amber-300 border border-amber-500/30 mb-4 inline-block">
            RESTRICTED ACCESS // PORTAL GURU ONLY
          </span>

          <h2 className="text-3xl font-extrabold text-white mb-4">
            Fitur Absensi QR Code &amp; RFID Terkunci
          </h2>

          <p className="text-slate-300 max-w-xl mx-auto text-sm sm:text-base mb-8 leading-relaxed">
            Sesuai regulasi laboratorium sekolah, modul <strong>Absensi RFID &amp; QR Code</strong>, serta rekapan data kehadiran siswa hanya dapat dioperasikan oleh <strong>Guru Pembimbing Lab Komputer</strong>.
          </p>

          <button
            onClick={onOpenAdminModal}
            className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 transition-all shadow-xl shadow-violet-900/40"
          >
            <UserCheck className="w-4 h-4 text-cyan-300" />
            <span>Masuk Portal Guru Pembimbing</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>
    );
  }

  // GURU ADMIN IS AUTHENTICATED
  return (
    <section className="py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      
      {/* Teacher Control Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-violet-950/40 via-[#0b1120] to-cyan-950/40 border border-violet-500/40 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-violet-600/20 border border-violet-500/50 flex items-center justify-center text-violet-300">
            <Radio className="w-6 h-6 text-cyan-400 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Sistem Absensi RFID &amp; QR Code Lab
              </h2>
              <span className="px-2 py-0.5 text-[11px] font-mono font-bold bg-teal-500/20 text-teal-300 border border-teal-500/40 rounded">
                GURU AKTIF
              </span>
              <span className="px-2 py-0.5 text-[11px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded flex items-center gap-1.5 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>CLOUD FIRESTORE SERVER AKTIF</span>
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-400">
              Instruktur: <span className="text-cyan-300 font-medium">{admin.name}</span> (NIP: {admin.nip})
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCsv}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl bg-slate-900 hover:bg-slate-800 border border-cyan-500/30 text-cyan-300 transition-all shadow-sm"
          >
            <Download className="w-4 h-4" />
            <span>Ekspor CSV / Excel</span>
          </button>
        </div>
      </div>

      {/* Schedule & Rules Card (11:15 Masuk, 11:25 Terlambat, 13:40 Pulang) */}
      <div className="mb-6 p-4 sm:p-5 rounded-2xl bg-[#0b1120] border border-cyan-500/30 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 shadow-lg shadow-cyan-950/20">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-300 font-mono">
              Aturan Jadwal Presensi Lab
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
            <span className="text-[11px] text-slate-400">Jam Sesi Hari Ini</span>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs font-medium">
              <LogIn className="w-3.5 h-3.5 text-emerald-400" />
              <span>Tap Masuk: <strong className="font-mono text-white font-bold">11:15</strong> WIB</span>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-950/60 border border-amber-500/40 text-amber-300 text-xs font-medium">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>Batas Terlambat: <strong className="font-mono text-white font-bold">&gt; 11:25</strong> WIB</span>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-950/60 border border-blue-500/40 text-blue-300 text-xs font-medium">
              <LogOut className="w-3.5 h-3.5 text-blue-400" />
              <span>Tap Pulang: <strong className="font-mono text-white font-bold">13:40</strong> WIB</span>
            </div>
          </div>
        </div>

        {/* Time Simulator Control */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2.5 bg-slate-950/80 p-2.5 rounded-xl border border-slate-800">
          <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            <span>Jam Aktif:</span>
            <span className="font-mono font-bold text-white">
              {simulatedTime ? `${simulatedTime} WIB (Simulasi)` : 'Waktu Riil'}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setSimulatedTime(null)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                simulatedTime === null
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow'
                  : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800'
              }`}
              title="Gunakan waktu jam nyata perangkat Anda"
            >
              Waktu Riil
            </button>
            <button
              type="button"
              onClick={() => setPresetTime(11, 15)}
              className={`px-2 py-1 rounded-lg text-[11px] font-mono font-bold transition-all ${
                simulatedTime === '11:15'
                  ? 'bg-emerald-500 text-slate-950 shadow ring-1 ring-emerald-400'
                  : 'text-emerald-300 hover:bg-slate-900 bg-emerald-950/40 border border-emerald-500/30'
              }`}
              title="Uji Jam 11:15 (Tap Masuk Tepat Waktu)"
            >
              11:15
            </button>
            <button
              type="button"
              onClick={() => setPresetTime(11, 26)}
              className={`px-2 py-1 rounded-lg text-[11px] font-mono font-bold transition-all ${
                simulatedTime === '11:26'
                  ? 'bg-amber-500 text-slate-950 shadow ring-1 ring-amber-400'
                  : 'text-amber-300 hover:bg-slate-900 bg-amber-950/40 border border-amber-500/30'
              }`}
              title="Uji Jam 11:26 (Tap Masuk Terlambat > 11:25)"
            >
              11:26
            </button>
            <button
              type="button"
              onClick={() => setPresetTime(13, 40)}
              className={`px-2 py-1 rounded-lg text-[11px] font-mono font-bold transition-all ${
                simulatedTime === '13:40'
                  ? 'bg-blue-500 text-slate-950 shadow ring-1 ring-blue-400'
                  : 'text-blue-300 hover:bg-slate-900 bg-blue-950/40 border border-blue-500/30'
              }`}
              title="Uji Jam 13:40 (Tap Pulang Sesuai Jadwal)"
            >
              13:40
            </button>
          </div>
        </div>
      </div>

      {/* Mode Selection Tabs (RFID / QR / Manual) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Interactive Terminal Scanner */}
        <div className="lg:col-span-5 space-y-6">
          <div className="rounded-2xl bg-[#0b1120] border border-cyan-500/30 p-5 sm:p-6 shadow-xl shadow-cyan-950/30">
            
            {/* Audio Voice Announcements & Tap Mode Controller */}
            <div className="mb-5 p-4 rounded-xl bg-slate-950/90 border border-cyan-500/30 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shrink-0">
                    <Volume2 className="w-4 h-4 animate-pulse" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                      <span>Suara Presensi Otomatis</span>
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold ${
                        isAudioMuted 
                          ? 'bg-red-500/20 text-red-300 border border-red-500/40' 
                          : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      }`}>
                        {isAudioMuted ? 'Muted' : 'Voice ON'}
                      </span>
                    </h4>
                    <p className="text-[10px] text-slate-400">
                      Notifikasi suara: Tap Masuk &amp; Tap Pulang
                    </p>
                  </div>
                </div>

                {/* Mute/Unmute Toggle */}
                <button
                  type="button"
                  onClick={handleToggleMute}
                  className={`p-2 rounded-lg border text-xs transition-colors flex items-center gap-1.5 ${
                    isAudioMuted
                      ? 'bg-red-950/60 border-red-500/50 text-red-300 hover:bg-red-900/60'
                      : 'bg-slate-900 border-slate-700 text-cyan-300 hover:bg-slate-800'
                  }`}
                  title={isAudioMuted ? 'Aktifkan Suara' : 'Bisukan Suara'}
                >
                  {isAudioMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  <span className="text-[10px] font-semibold">{isAudioMuted ? 'Bisu' : 'Aktif'}</span>
                </button>
              </div>

              {/* Mode Selection: Auto / Masuk / Pulang */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
                  <span>Pilih Mode Tap:</span>
                  <span className="text-[10px] font-mono text-cyan-400">
                    {tapMode === 'auto' && 'Mode Otomatis (Cerdas)'}
                    {tapMode === 'masuk' && 'Mode Khusus Masuk'}
                    {tapMode === 'pulang' && 'Mode Khusus Pulang'}
                  </span>
                </label>

                <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-900/90 rounded-xl border border-slate-800">
                  <button
                    type="button"
                    onClick={() => setTapMode('auto')}
                    className={`py-1.5 px-2 rounded-lg text-[11px] font-bold transition-all flex items-center justify-center gap-1.5 ${
                      tapMode === 'auto'
                        ? 'bg-gradient-to-r from-violet-600 to-cyan-600 text-white shadow-md'
                        : 'text-slate-400 hover:text-white'
                    }`}
                    title="Otomatis: Masuk saat pertama tap, Pulang saat tap berikutnya"
                  >
                    <Sparkles className="w-3 h-3 text-amber-300" />
                    <span>Auto</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTapMode('masuk')}
                    className={`py-1.5 px-2 rounded-lg text-[11px] font-bold transition-all flex items-center justify-center gap-1.5 ${
                      tapMode === 'masuk'
                        ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950/50'
                        : 'text-slate-400 hover:text-emerald-300'
                    }`}
                    title="Semua tap diproses sebagai Tap Masuk (Selamat datang)"
                  >
                    <LogIn className="w-3 h-3 text-emerald-300" />
                    <span>Tap Masuk</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTapMode('pulang')}
                    className={`py-1.5 px-2 rounded-lg text-[11px] font-bold transition-all flex items-center justify-center gap-1.5 ${
                      tapMode === 'pulang'
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-950/50'
                        : 'text-slate-400 hover:text-blue-300'
                    }`}
                    title="Semua tap diproses sebagai Tap Pulang (Hati-hati di jalan)"
                  >
                    <LogOut className="w-3 h-3 text-cyan-300" />
                    <span>Tap Pulang</span>
                  </button>
                </div>
              </div>

              {/* Sound Test / Preview Buttons */}
              <div className="pt-1 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleTestAudio('masuk')}
                  className={`flex-1 py-1.5 px-2.5 rounded-lg border text-[11px] font-semibold transition-all flex items-center justify-center gap-1.5 ${
                    testAudioPlaying === 'masuk'
                      ? 'bg-emerald-500/30 border-emerald-400 text-emerald-200 ring-2 ring-emerald-400/40'
                      : 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300 hover:bg-emerald-900/50'
                  }`}
                  title="Dengarkan file suara: Selamat datang di IT Club"
                >
                  <Volume2 className={`w-3.5 h-3.5 ${testAudioPlaying === 'masuk' ? 'animate-bounce text-emerald-300' : ''}`} />
                  <span>🔊 Uji Suara Masuk</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleTestAudio('pulang')}
                  className={`flex-1 py-1.5 px-2.5 rounded-lg border text-[11px] font-semibold transition-all flex items-center justify-center gap-1.5 ${
                    testAudioPlaying === 'pulang'
                      ? 'bg-blue-500/30 border-blue-400 text-blue-200 ring-2 ring-blue-400/40'
                      : 'bg-blue-950/40 border-blue-500/40 text-blue-300 hover:bg-blue-900/50'
                  }`}
                  title="Dengarkan file suara: Pesan hati-hati di jalan ya"
                >
                  <Volume2 className={`w-3.5 h-3.5 ${testAudioPlaying === 'pulang' ? 'animate-bounce text-blue-300' : ''}`} />
                  <span>🔊 Uji Suara Pulang</span>
                </button>
              </div>

            </div>
            
            {/* Tab Buttons (RFID / QR / Manual) */}
            <div className="flex items-center gap-2 p-1 bg-slate-950 rounded-xl mb-6 border border-slate-800">
              <button
                onClick={() => {
                  setActiveMode('rfid');
                  setIsCameraActive(false);
                }}
                className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                  activeMode === 'rfid'
                    ? 'bg-gradient-to-r from-cyan-500 to-teal-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Radio className="w-3.5 h-3.5" />
                <span>Kartu RFID</span>
              </button>

              <button
                onClick={() => {
                  setActiveMode('qrcode');
                  setIsCameraActive(true);
                }}
                className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                  activeMode === 'qrcode'
                    ? 'bg-gradient-to-r from-cyan-500 to-teal-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <QrCode className="w-3.5 h-3.5" />
                <span>Kamera QR</span>
              </button>

              <button
                onClick={() => {
                  setActiveMode('manual');
                  setIsCameraActive(false);
                }}
                className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                  activeMode === 'manual'
                    ? 'bg-gradient-to-r from-cyan-500 to-teal-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Search className="w-3.5 h-3.5" />
                <span>Pencarian</span>
              </button>
            </div>

            {/* TAB 1: RFID READER MODE */}
            {activeMode === 'rfid' && (
              <div className="space-y-6">
                
                {/* Visual RFID Scanner Antenna Area */}
                <div className="relative p-6 rounded-2xl bg-slate-950/80 border-2 border-dashed border-cyan-500/40 text-center overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/5 to-transparent pointer-events-none" />

                  <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-cyan-950/80 border border-cyan-400/50 flex items-center justify-center relative shadow-lg shadow-cyan-500/20">
                    <Radio className="w-9 h-9 text-cyan-300 animate-pulse" />
                    {/* Concentric pulsing rings */}
                    <span className="absolute inset-0 rounded-full border border-cyan-400/40 animate-ping opacity-30" />
                  </div>

                  <h3 className="text-base font-bold text-white mb-1">
                    Terminal Pembaca RFID Aktif
                  </h3>
                  <p className="text-xs text-slate-400 max-w-xs mx-auto mb-4">
                    Tempelkan kartu RFID siswa pada USB Card Reader lab atau klik tombol simulasi siswa di bawah.
                  </p>

                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-[11px] font-mono text-cyan-300">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Hardware Wedge Listener ON</span>
                  </div>
                </div>

                {/* Input Manual RFID UID */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (manualUid) processRfidUid(manualUid);
                  }}
                  className="flex gap-2"
                >
                  <input
                    type="text"
                    value={manualUid}
                    onChange={(e) => setManualUid(e.target.value)}
                    placeholder="Input UID RFID (cth: E280-1170-01)"
                    className="flex-1 px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold rounded-xl transition-all"
                  >
                    Tap UID
                  </button>
                </form>

                {/* Deck Kartu Siswa untuk Pengujian Cepat (Quick Tap Simulator) */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-slate-300">
                      Simulasi Tap Kartu Siswa:
                    </span>
                    <span className="text-[11px] text-cyan-400 font-mono">
                      Klik Masuk atau Pulang
                    </span>
                  </div>

                  <div className="space-y-2">
                    {students.slice(0, 4).map((s) => (
                      <div
                        key={s.id}
                        className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-cyan-500/40 transition-all flex items-center justify-between gap-2"
                      >
                        <div 
                          onClick={() => processRfidUid(s.rfidUid)}
                          className="flex items-center gap-2.5 min-w-0 flex-1 cursor-pointer"
                        >
                          <img
                            src={s.avatarUrl}
                            alt={s.name}
                            className="w-9 h-9 rounded-lg object-cover border border-cyan-500/30 shrink-0"
                            referrerPolicy="no-referrer"
                          />
                          <div className="min-w-0 flex-1">
                            <div className="text-xs font-bold text-white truncate hover:text-cyan-300">
                              {s.name}
                            </div>
                            <div className="text-[10px] font-mono text-slate-400 truncate">
                              UID: {s.rfidUid} · {s.class.split(' ')[0]}
                            </div>
                          </div>
                        </div>

                        {/* Direct action buttons for Masuk & Pulang */}
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => processRfidUid(s.rfidUid, 'Masuk')}
                            className="px-2.5 py-1 rounded-lg bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/50 text-emerald-300 text-[10px] font-bold flex items-center gap-1 transition-colors"
                            title="Simulasikan Tap Masuk (Selamat datang di IT Club)"
                          >
                            <LogIn className="w-3 h-3 text-emerald-400" />
                            <span>Masuk</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => processRfidUid(s.rfidUid, 'Pulang')}
                            className="px-2.5 py-1 rounded-lg bg-blue-950/80 hover:bg-blue-900 border border-blue-500/50 text-blue-300 text-[10px] font-bold flex items-center gap-1 transition-colors"
                            title="Simulasikan Tap Pulang (Hati-hati di jalan ya)"
                          >
                            <LogOut className="w-3 h-3 text-blue-400" />
                            <span>Pulang</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            )}

            {/* TAB 2: QR CODE SCANNER MODE */}
            {activeMode === 'qrcode' && (
              <div className="space-y-4">
                <div className="relative rounded-2xl bg-black border border-cyan-500/40 overflow-hidden aspect-video flex items-center justify-center">
                  {isCameraActive ? (
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-center p-6">
                      <Camera className="w-12 h-12 text-slate-600 mx-auto mb-2" />
                      <p className="text-xs text-slate-400">Kamera dinonaktifkan</p>
                    </div>
                  )}

                  {/* Laser Scan Guide Frame */}
                  <div className="absolute inset-8 border-2 border-cyan-400/70 rounded-xl pointer-events-none flex flex-col justify-between p-2">
                    <div className="flex justify-between">
                      <span className="w-4 h-4 border-t-2 border-l-2 border-cyan-400" />
                      <span className="w-4 h-4 border-t-2 border-r-2 border-cyan-400" />
                    </div>
                    {/* Animated Laser Line */}
                    <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-lg shadow-cyan-400/80 animate-bounce" />
                    <div className="flex justify-between">
                      <span className="w-4 h-4 border-b-2 border-l-2 border-cyan-400" />
                      <span className="w-4 h-4 border-b-2 border-r-2 border-cyan-400" />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Arahkan kamera ke QR Code pada kartu fisik / smartphone siswa.</span>
                </div>

                {/* Quick QR Simulator Buttons */}
                <div>
                  <span className="text-xs font-semibold text-slate-300 block mb-2">
                    Uji Scan QR Siswa (Masuk / Pulang):
                  </span>
                  <div className="space-y-2">
                    {students.slice(0, 4).map((s) => (
                      <div
                        key={s.id}
                        className="p-2 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-2"
                      >
                        <div className="text-xs text-slate-200 truncate flex items-center gap-1.5">
                          <QrCode className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                          <span className="font-semibold">{s.name.split(' ')[0]}</span>
                          <span className="text-slate-400 text-[10px]">({s.class.split(' ')[0]})</span>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => processQrData(s.qrCodeData, 'Masuk')}
                            className="px-2 py-0.5 rounded bg-emerald-950 border border-emerald-500/40 text-[10px] text-emerald-300 font-semibold hover:bg-emerald-900"
                          >
                            Masuk
                          </button>
                          <button
                            type="button"
                            onClick={() => processQrData(s.qrCodeData, 'Pulang')}
                            className="px-2 py-0.5 rounded bg-blue-950 border border-blue-500/40 text-[10px] text-blue-300 font-semibold hover:bg-blue-900"
                          >
                            Pulang
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: MANUAL SEARCH & ATTENDANCE */}
            {activeMode === 'manual' && (
              <div className="space-y-4">
                <p className="text-xs text-slate-400">
                  Tandai kehadiran secara manual jika siswa tertinggal kartu RFID / baterai HP habis:
                </p>
                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {students.map((s) => (
                    <div
                      key={s.id}
                      className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-2"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-bold text-white truncate">{s.name}</div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {s.nisn} · {s.class}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => processRfidUid(s.rfidUid, 'Masuk')}
                          className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-[10px] font-semibold"
                        >
                          Masuk
                        </button>
                        <button
                          onClick={() => processRfidUid(s.rfidUid, 'Pulang')}
                          className="px-2.5 py-1 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/40 text-[10px] font-semibold"
                        >
                          Pulang
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Status Feedback Message */}
            {scanMessage && (
              <div
                className={`mt-4 p-3.5 rounded-xl text-xs flex items-start gap-2.5 border ${
                  scanMessage.type === 'success'
                    ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-200'
                    : scanMessage.type === 'error'
                    ? 'bg-red-950/60 border-red-500/50 text-red-200'
                    : 'bg-cyan-950/60 border-cyan-500/50 text-cyan-200'
                }`}
              >
                {scanMessage.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                )}
                <span className="leading-snug">{scanMessage.text}</span>
              </div>
            )}

          </div>

          {/* Last Scanned Student Identity Card Highlight */}
          {lastScannedStudent && (
            <div className="rounded-2xl bg-gradient-to-br from-[#0c162d] to-[#080d1a] border border-cyan-500/50 p-5 shadow-xl relative overflow-hidden animate-fadeIn">
              <div className="flex items-start justify-between mb-3">
                <span className="px-2.5 py-1 rounded-full text-[11px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 flex items-center gap-1.5">
                  <span>VERIFIKASI: {lastScannedStudent.record.method}</span>
                  <span className="text-slate-400">·</span>
                  <span className={lastScannedStudent.record.tapType === 'Pulang' ? 'text-blue-300' : 'text-emerald-300'}>
                    TAP {lastScannedStudent.record.tapType?.toUpperCase() || 'MASUK'}
                  </span>
                </span>
                <span className={`px-2.5 py-0.5 rounded text-xs font-bold ${
                  lastScannedStudent.record.status === 'Hadir' 
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' 
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                }`}>
                  {lastScannedStudent.record.status}
                </span>
              </div>

              <div className="flex items-center gap-4">
                <img
                  src={lastScannedStudent.student.avatarUrl}
                  alt={lastScannedStudent.student.name}
                  className="w-14 h-14 rounded-xl object-cover border-2 border-cyan-400 shadow-md"
                  referrerPolicy="no-referrer"
                />
                <div>
                  <h4 className="text-base font-bold text-white">
                    {lastScannedStudent.student.name}
                  </h4>
                  <p className="text-xs text-slate-300 font-mono">
                    NISN: {lastScannedStudent.student.nisn}
                  </p>
                  <p className="text-xs text-cyan-300">
                    {lastScannedStudent.student.class}
                  </p>
                  <p className="text-[11px] text-slate-400 font-mono mt-1">
                    Waktu: {new Date(lastScannedStudent.record.timestamp).toLocaleTimeString('id-ID')} WIB
                  </p>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Right Column: Attendance Records & Metrics Table */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Summary Stats Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <div className="p-4 rounded-xl bg-[#0b1120] border border-slate-800">
              <span className="text-xs text-slate-400 block mb-1">Total Presensi</span>
              <span className="text-2xl font-mono font-bold text-white tabular-nums">
                {totalPresensi}
              </span>
            </div>
            <div className="p-4 rounded-xl bg-[#0b1120] border border-emerald-900/40">
              <span className="text-xs text-emerald-400 block mb-1 flex items-center gap-1">
                <LogIn className="w-3.5 h-3.5" />
                <span>Tap Masuk</span>
              </span>
              <span className="text-2xl font-mono font-bold text-emerald-300 tabular-nums">
                {totalMasuk}
              </span>
            </div>
            <div className="p-4 rounded-xl bg-[#0b1120] border border-blue-900/40">
              <span className="text-xs text-blue-400 block mb-1 flex items-center gap-1">
                <LogOut className="w-3.5 h-3.5" />
                <span>Tap Pulang</span>
              </span>
              <span className="text-2xl font-mono font-bold text-blue-300 tabular-nums">
                {totalPulang}
              </span>
            </div>
            <div className="p-4 rounded-xl bg-[#0b1120] border border-amber-900/40">
              <span className="text-xs text-amber-400 block mb-1">Terlambat</span>
              <span className="text-2xl font-mono font-bold text-amber-300 tabular-nums">
                {totalTerlambat}
              </span>
            </div>
          </div>

          {/* Table Container */}
          <div className="rounded-2xl bg-[#0b1120] border border-slate-800 overflow-hidden shadow-xl">
            
            {/* Table Header Filter & Search */}
            <div className="p-4 sm:p-5 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#0a0f1d]">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari nama, kelas, atau NISN siswa..."
                  className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                />
              </div>

              {/* Status Segmented Filter */}
              <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-950 rounded-xl border border-slate-800">
                <button
                  onClick={() => setFilterStatus('all')}
                  className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-colors ${
                    filterStatus === 'all'
                      ? 'bg-cyan-500/20 text-cyan-300 font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Semua ({attendanceRecords.length})
                </button>
                <button
                  onClick={() => setFilterStatus('Masuk')}
                  className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-colors flex items-center gap-1 ${
                    filterStatus === 'Masuk'
                      ? 'bg-emerald-500/20 text-emerald-300 font-bold'
                      : 'text-slate-400 hover:text-emerald-300'
                  }`}
                >
                  <LogIn className="w-3 h-3" />
                  <span>Masuk</span>
                </button>
                <button
                  onClick={() => setFilterStatus('Pulang')}
                  className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-colors flex items-center gap-1 ${
                    filterStatus === 'Pulang'
                      ? 'bg-blue-500/20 text-blue-300 font-bold'
                      : 'text-slate-400 hover:text-blue-300'
                  }`}
                >
                  <LogOut className="w-3 h-3" />
                  <span>Pulang</span>
                </button>
                <button
                  onClick={() => setFilterStatus('Terlambat')}
                  className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-colors ${
                    filterStatus === 'Terlambat'
                      ? 'bg-amber-500/20 text-amber-300 font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Terlambat
                </button>
              </div>
            </div>

            {/* Attendance Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#080c16] text-slate-400 font-mono uppercase tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="px-4 py-3">Waktu</th>
                    <th className="px-4 py-3">Tipe Tap</th>
                    <th className="px-4 py-3">Nama Siswa</th>
                    <th className="px-4 py-3">Kelas &amp; Divisi</th>
                    <th className="px-4 py-3">Metode</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-sans">
                  {filteredRecords.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                        Belum ada data presensi yang cocok dengan kriteria pencarian.
                      </td>
                    </tr>
                  ) : (
                    filteredRecords.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-900/50 transition-colors">
                        <td className="px-4 py-3 text-slate-300 font-mono tabular-nums whitespace-nowrap">
                          {new Date(item.timestamp).toLocaleTimeString('id-ID', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })} WIB
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-bold ${
                              item.tapType === 'Pulang'
                                ? 'bg-blue-950/80 text-blue-300 border border-blue-500/40'
                                : 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/40'
                            }`}
                          >
                            {item.tapType === 'Pulang' ? (
                              <>
                                <LogOut className="w-3 h-3 text-blue-400" />
                                <span>Tap Pulang</span>
                              </>
                            ) : (
                              <>
                                <LogIn className="w-3 h-3 text-emerald-400" />
                                <span>Tap Masuk</span>
                              </>
                            )}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-semibold text-white">
                          <div>{item.studentName}</div>
                          <div className="text-[10px] text-slate-500 font-mono">NISN: {item.nisn}</div>
                        </td>
                        <td className="px-4 py-3 text-slate-300">
                          <div>{item.class}</div>
                          <div className="text-[10px] text-cyan-400">{item.division}</div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-slate-900 text-slate-300 border border-slate-800">
                            {item.method === 'RFID' ? (
                              <Radio className="w-3 h-3 text-cyan-400" />
                            ) : (
                              <QrCode className="w-3 h-3 text-teal-400" />
                            )}
                            {item.method}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span
                            className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                              item.status === 'Hadir'
                                ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/40'
                                : 'bg-amber-950/80 text-amber-300 border border-amber-500/40'
                            }`}
                          >
                            {item.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Table Footer */}
            <div className="p-3 bg-[#080d1a] border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
              <span>Menampilkan {filteredRecords.length} rekaman presensi hari ini</span>
              <span className="font-mono text-emerald-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Cloud Firestore Database Terkoneksi (Real-time Sync)</span>
              </span>
            </div>

          </div>

        </div>

      </div>

    </section>
  );
};
