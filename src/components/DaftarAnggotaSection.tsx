import React, { useState, useMemo, useEffect } from 'react';
import QRCode from 'qrcode';
import { 
  Users, 
  Search, 
  Filter, 
  Plus, 
  Download, 
  CreditCard, 
  Radio, 
  CheckCircle2, 
  ShieldCheck, 
  Sparkles, 
  UserCheck, 
  Mail, 
  Phone, 
  QrCode, 
  Copy, 
  Check, 
  Edit3, 
  Trash2, 
  Eye, 
  Calendar, 
  School, 
  Layers, 
  Upload, 
  X, 
  AlertCircle,
  FileSpreadsheet,
  Award,
  ArrowRight,
  ExternalLink
} from 'lucide-react';
import { Student, AdminUser, DivisionType, AttendanceRecord } from '../types';

interface DaftarAnggotaSectionProps {
  admin: AdminUser;
  students: Student[];
  attendanceRecords?: AttendanceRecord[];
  onAddStudent: (newStudent: Student) => void;
  onUpdateStudent: (updatedStudent: Student) => void;
  onDeleteStudent: (studentId: string) => void;
  onNavigateToCardStudio?: (studentId: string) => void;
  onOpenAdminModal: () => void;
}

export const DaftarAnggotaSection: React.FC<DaftarAnggotaSectionProps> = ({
  admin,
  students,
  attendanceRecords = [],
  onAddStudent,
  onUpdateStudent,
  onDeleteStudent,
  onNavigateToCardStudio,
  onOpenAdminModal,
}) => {
  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDivision, setSelectedDivision] = useState<string>('Semua');
  const [selectedStatus, setSelectedStatus] = useState<string>('Semua');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Modals
  const [selectedStudentForDetail, setSelectedStudentForDetail] = useState<Student | null>(null);
  const [detailQrUrl, setDetailQrUrl] = useState<string>('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);

  // Quick Copy RFID UID feedback
  const [copiedUid, setCopiedUid] = useState<string | null>(null);

  // Form State for Add / Edit
  const [formData, setFormData] = useState({
    name: '',
    nisn: '',
    class: '',
    division: 'Python Programming' as DivisionType,
    status: 'Aktif' as 'Aktif' | 'Pengurus' | 'Alumni',
    position: 'Anggota Aktif',
    email: '',
    phone: '',
    avatarUrl: '',
    rfidUid: '',
  });

  // Division Options
  const divisions: (DivisionType | 'Semua')[] = [
    'Semua',
    'Python Programming',
    'C# .NET',
    'Scratch',
    'Desain Grafis',
    'Jaringan Komputer',
  ];

  // Division Badge Color mapping
  const getDivisionStyle = (div: DivisionType) => {
    switch (div) {
      case 'Python Programming':
        return {
          badge: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
          gradient: 'from-emerald-500/20 via-teal-500/10 to-transparent',
          border: 'border-emerald-500/30',
          dot: 'bg-emerald-400',
        };
      case 'C# .NET':
        return {
          badge: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
          gradient: 'from-purple-500/20 via-indigo-500/10 to-transparent',
          border: 'border-purple-500/30',
          dot: 'bg-purple-400',
        };
      case 'Scratch':
        return {
          badge: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
          gradient: 'from-amber-500/20 via-orange-500/10 to-transparent',
          border: 'border-amber-500/30',
          dot: 'bg-amber-400',
        };
      case 'Desain Grafis':
        return {
          badge: 'bg-pink-500/15 text-pink-300 border-pink-500/30',
          gradient: 'from-pink-500/20 via-rose-500/10 to-transparent',
          border: 'border-pink-500/30',
          dot: 'bg-pink-400',
        };
      case 'Jaringan Komputer':
        return {
          badge: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
          gradient: 'from-cyan-500/20 via-blue-500/10 to-transparent',
          border: 'border-cyan-500/30',
          dot: 'bg-cyan-400',
        };
      default:
        return {
          badge: 'bg-slate-500/15 text-slate-300 border-slate-500/30',
          gradient: 'from-slate-500/20 to-transparent',
          border: 'border-slate-500/30',
          dot: 'bg-slate-400',
        };
    }
  };

  // Generate QR Code when detail modal opens
  useEffect(() => {
    if (selectedStudentForDetail) {
      QRCode.toDataURL(selectedStudentForDetail.qrCodeData || selectedStudentForDetail.nisn, {
        width: 240,
        margin: 1,
        color: {
          dark: '#080c16',
          light: '#ffffff',
        },
      })
        .then((url) => setDetailQrUrl(url))
        .catch(() => setDetailQrUrl(''));
    }
  }, [selectedStudentForDetail]);

  // Copy RFID to clipboard
  const handleCopyUid = (uid: string) => {
    navigator.clipboard.writeText(uid);
    setCopiedUid(uid);
    setTimeout(() => {
      setCopiedUid(null);
    }, 2000);
  };

  // Filtered Students
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const query = searchQuery.toLowerCase().trim();
      const matchSearch =
        !query ||
        s.name.toLowerCase().includes(query) ||
        s.nisn.toLowerCase().includes(query) ||
        s.class.toLowerCase().includes(query) ||
        s.rfidUid.toLowerCase().includes(query) ||
        (s.position && s.position.toLowerCase().includes(query)) ||
        s.email.toLowerCase().includes(query);

      const matchDivision =
        selectedDivision === 'Semua' || s.division === selectedDivision;

      const matchStatus =
        selectedStatus === 'Semua' || s.status === selectedStatus;

      return matchSearch && matchDivision && matchStatus;
    });
  }, [students, searchQuery, selectedDivision, selectedStatus]);

  // Statistics
  const stats = useMemo(() => {
    const total = students.length;
    const pengurus = students.filter((s) => s.status === 'Pengurus').length;
    const aktif = students.filter((s) => s.status === 'Aktif').length;
    const divisionsCount = new Set(students.map((s) => s.division)).size;
    return { total, pengurus, aktif, divisionsCount };
  }, [students]);

  // Count attendance records for a student
  const getStudentAttendanceCount = (studentId: string, nisn: string) => {
    return attendanceRecords.filter(
      (r) => r.studentId === studentId || r.nisn === nisn
    ).length;
  };

  // Export to CSV
  const handleExportCSV = () => {
    const headers = [
      'No',
      'NISN',
      'Nama Lengkap',
      'Kelas',
      'Divisi',
      'Status',
      'Jabatan',
      'RFID UID',
      'Email',
      'No HP',
      'Tanggal Bergabung',
    ];

    const rows = filteredStudents.map((s, index) => [
      index + 1,
      `="${s.nisn}"`,
      `"${s.name.replace(/"/g, '""')}"`,
      `"${s.class}"`,
      `"${s.division}"`,
      s.status,
      `"${s.position || '-'}"`,
      `="${s.rfidUid}"`,
      s.email || '-',
      s.phone || '-',
      s.joinedDate || '-',
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `data_anggota_itclub_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Open Add Modal
  const handleOpenAddModal = () => {
    const randomUid = `E${Math.floor(100 + Math.random() * 899)}-${Math.floor(
      1000 + Math.random() * 8999
    )}-${String(students.length + 1).padStart(2, '0')}`;

    setFormData({
      name: '',
      nisn: '',
      class: 'X RPL 1 (Rekayasa Perangkat Lunak)',
      division: 'Python Programming',
      status: 'Aktif',
      position: 'Anggota Divisi Python',
      email: '',
      phone: '',
      avatarUrl: `https://images.unsplash.com/photo-${1535713875002 + students.length}?w=200&auto=format&fit=crop&q=80`,
      rfidUid: randomUid,
    });
    setEditingStudent(null);
    setShowAddModal(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (std: Student) => {
    setFormData({
      name: std.name,
      nisn: std.nisn,
      class: std.class,
      division: std.division,
      status: std.status,
      position: std.position || 'Anggota Aktif',
      email: std.email || '',
      phone: std.phone || '',
      avatarUrl: std.avatarUrl || '',
      rfidUid: std.rfidUid,
    });
    setEditingStudent(std);
    setShowAddModal(true);
  };

  // Handle Form Submit
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.nisn.trim()) return;

    if (editingStudent) {
      // Update
      const updated: Student = {
        ...editingStudent,
        name: formData.name.trim(),
        nisn: formData.nisn.trim(),
        class: formData.class.trim(),
        division: formData.division,
        status: formData.status,
        position: formData.position.trim(),
        email: formData.email.trim() || `${formData.nisn}@student.sch.id`,
        phone: formData.phone.trim() || '0812-0000-0000',
        avatarUrl: formData.avatarUrl.trim() || editingStudent.avatarUrl,
        rfidUid: formData.rfidUid.trim(),
        qrCodeData: `ITCLUB:${formData.nisn.trim()}:${formData.name.trim()}:${formData.class.trim()}`,
      };
      onUpdateStudent(updated);
      if (selectedStudentForDetail?.id === updated.id) {
        setSelectedStudentForDetail(updated);
      }
    } else {
      // Create new
      const newId = `std-${String(Date.now()).slice(-4)}`;
      const newStudent: Student = {
        id: newId,
        name: formData.name.trim(),
        nisn: formData.nisn.trim(),
        class: formData.class.trim(),
        division: formData.division,
        status: formData.status,
        position: formData.position.trim() || `Anggota Divisi ${formData.division}`,
        email: formData.email.trim() || `${formData.nisn.trim()}@student.sch.id`,
        phone: formData.phone.trim() || '0812-3456-7890',
        avatarUrl:
          formData.avatarUrl.trim() ||
          'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80',
        rfidUid: formData.rfidUid.trim(),
        qrCodeData: `ITCLUB:${formData.nisn.trim()}:${formData.name.trim()}:${formData.class.trim()}`,
        joinedDate: new Date().toISOString().slice(0, 10),
      };
      onAddStudent(newStudent);
    }

    setShowAddModal(false);
    setEditingStudent(null);
  };

  // Handle Photo Upload
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('Ukuran file maksimal 2MB');
        return;
      }
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        const result = uploadEvent.target?.result as string;
        if (result) {
          setFormData((prev) => ({ ...prev, avatarUrl: result }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header Banner */}
      <div className="relative rounded-3xl bg-gradient-to-br from-[#0c1427] via-[#080d1a] to-[#120f2e] border border-cyan-900/40 p-6 sm:p-8 lg:p-10 mb-8 overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 -mb-10 w-80 h-80 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 text-xs font-mono font-semibold">
              <Users className="w-3.5 h-3.5 text-cyan-400" />
              <span>DIREKTORI RESMI ANGGOTA IT CLUB</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Data Siswa &amp; <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-300 to-indigo-400">Daftar Anggota</span>
            </h1>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Pusat database keanggotaan IT Club Laboratorium Komputer. Pantau data siswa, spesialisasi divisi, kartu RFID 13.56 MHz, QR Code presensi, dan peran pengurus.
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-900/80 hover:bg-slate-800 text-slate-200 hover:text-white text-xs font-semibold transition-all shadow-md active:scale-95"
              title="Unduh Data Anggota dalam Format CSV"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              <span>Ekspor CSV</span>
            </button>

            <button
              onClick={handleOpenAddModal}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-400 hover:from-cyan-400 hover:to-teal-300 text-slate-950 text-xs font-bold transition-all shadow-lg shadow-cyan-500/25 active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Siswa Baru</span>
            </button>
          </div>
        </div>

        {/* Statistics Tiles */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-8 border-t border-slate-800/80">
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400">Total Anggota</span>
              <div className="p-2 rounded-lg bg-cyan-950/60 text-cyan-400">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-white">{stats.total}</span>
              <span className="text-xs text-slate-400 font-mono">siswa</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400">Pengurus &amp; Inti</span>
              <div className="p-2 rounded-lg bg-violet-950/60 text-violet-400">
                <ShieldCheck className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-violet-300">{stats.pengurus}</span>
              <span className="text-xs text-slate-400 font-mono">personel</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400">Anggota Aktif</span>
              <div className="p-2 rounded-lg bg-emerald-950/60 text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-emerald-300">{stats.aktif}</span>
              <span className="text-xs text-slate-400 font-mono">terdaftar</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400">Divisi Spesialisasi</span>
              <div className="p-2 rounded-lg bg-amber-950/60 text-amber-400">
                <Layers className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-amber-300">{stats.divisionsCount}</span>
              <span className="text-xs text-slate-400 font-mono">track keahlian</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#0b1120] border border-cyan-900/30 rounded-2xl p-4 sm:p-5 mb-8 space-y-4 shadow-xl">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari berdasarkan nama, NISN, kelas, rfid uid, atau jabatan..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 text-xs"
              >
                Reset
              </button>
            )}
          </div>

          {/* Status Filter Dropdown & View Mode Switcher */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-slate-300">
              <Filter className="w-3.5 h-3.5 text-cyan-400" />
              <span>Status:</span>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="bg-transparent text-cyan-300 font-semibold focus:outline-none cursor-pointer text-xs"
              >
                <option value="Semua" className="bg-[#0b1120] text-slate-200">Semua Status</option>
                <option value="Pengurus" className="bg-[#0b1120] text-slate-200">Pengurus</option>
                <option value="Aktif" className="bg-[#0b1120] text-slate-200">Aktif</option>
                <option value="Alumni" className="bg-[#0b1120] text-slate-200">Alumni</option>
              </select>
            </div>

            {/* Toggle Grid vs Table */}
            <div className="flex items-center p-1 rounded-xl bg-slate-900 border border-slate-800 text-xs">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                  viewMode === 'grid'
                    ? 'bg-cyan-500 text-slate-950 font-bold shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Grid
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                  viewMode === 'table'
                    ? 'bg-cyan-500 text-slate-950 font-bold shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Tabel
              </button>
            </div>
          </div>
        </div>

        {/* Division Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-xs text-slate-400 whitespace-nowrap font-mono flex items-center gap-1">
            <Layers className="w-3.5 h-3.5 text-slate-500" />
            Divisi:
          </span>
          {divisions.map((div) => {
            const isSelected = selectedDivision === div;
            const count =
              div === 'Semua'
                ? students.length
                : students.filter((s) => s.division === div).length;

            return (
              <button
                key={div}
                onClick={() => setSelectedDivision(div)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                    : 'bg-slate-900/80 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-800'
                }`}
              >
                <span>{div}</span>
                <span
                  className={`px-1.5 py-0.2 rounded-md text-[10px] font-mono ${
                    isSelected ? 'bg-slate-950/30 text-slate-950' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between mb-4 px-1">
        <p className="text-xs font-mono text-slate-400">
          Menampilkan <span className="text-cyan-400 font-bold">{filteredStudents.length}</span> dari {students.length} anggota
        </p>
        {copiedUid && (
          <span className="text-xs text-emerald-400 font-mono animate-fade-in flex items-center gap-1">
            <Check className="w-3.5 h-3.5" /> RFID UID disalin ke clipboard!
          </span>
        )}
      </div>

      {/* Empty State */}
      {filteredStudents.length === 0 && (
        <div className="text-center py-16 px-4 bg-[#0b1120] rounded-3xl border border-dashed border-slate-800">
          <AlertCircle className="w-12 h-12 text-slate-500 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-200">Tidak ada anggota yang cocok</h3>
          <p className="text-sm text-slate-400 max-w-md mx-auto mt-1 mb-4">
            Tidak ditemukan siswa dengan kata kunci "{searchQuery}" pada filter yang dipilih. Silakan ubah filter atau kata kunci pencarian.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedDivision('Semua');
              setSelectedStatus('Semua');
            }}
            className="px-4 py-2 rounded-xl text-xs font-bold text-cyan-300 bg-cyan-950/60 border border-cyan-800/60 hover:bg-cyan-900/40"
          >
            Reset Semua Filter
          </button>
        </div>
      )}

      {/* GRID VIEW */}
      {viewMode === 'grid' && filteredStudents.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredStudents.map((std) => {
            const divStyle = getDivisionStyle(std.division);
            const attendanceCount = getStudentAttendanceCount(std.id, std.nisn);

            return (
              <div
                key={std.id}
                className={`group relative rounded-2xl bg-gradient-to-b from-[#0e1628] to-[#080d19] border border-slate-800 hover:${divStyle.border} transition-all duration-300 p-5 shadow-lg hover:shadow-cyan-500/10 flex flex-col justify-between`}
              >
                {/* Top: Avatar, Status, Division */}
                <div>
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="relative">
                      <img
                        src={std.avatarUrl}
                        alt={std.name}
                        className="w-14 h-14 rounded-2xl object-cover border-2 border-slate-700 group-hover:border-cyan-400 transition-colors shadow-md"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80';
                        }}
                      />
                      <span
                        className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-[#0e1628] ${
                          std.status === 'Pengurus'
                            ? 'bg-violet-400'
                            : std.status === 'Aktif'
                            ? 'bg-emerald-400'
                            : 'bg-slate-500'
                        }`}
                        title={`Status: ${std.status}`}
                      />
                    </div>

                    <div className="flex flex-col items-end gap-1.5">
                      <span
                        className={`text-[11px] font-bold font-mono px-2.5 py-0.5 rounded-full border ${divStyle.badge}`}
                      >
                        {std.division}
                      </span>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${
                          std.status === 'Pengurus'
                            ? 'bg-violet-950/80 text-violet-300 border border-violet-700/50'
                            : std.status === 'Aktif'
                            ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-700/50'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {std.status}
                      </span>
                    </div>
                  </div>

                  {/* Name & Position */}
                  <div className="space-y-1 mb-4">
                    <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors line-clamp-1">
                      {std.name}
                    </h3>
                    <p className="text-xs text-cyan-400 font-medium line-clamp-1">
                      {std.position || 'Anggota Aktif'}
                    </p>
                    <p className="text-xs text-slate-400 flex items-center gap-1.5 pt-0.5">
                      <School className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span className="line-clamp-1">{std.class}</span>
                    </p>
                  </div>

                  {/* Details Badges */}
                  <div className="space-y-2 mb-4 bg-slate-900/70 p-3 rounded-xl border border-slate-800/80 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 font-mono text-[11px]">NISN:</span>
                      <span className="text-slate-200 font-mono font-semibold">{std.nisn}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 font-mono text-[11px] flex items-center gap-1">
                        <Radio className="w-3 h-3 text-cyan-400" />
                        RFID UID:
                      </span>
                      <div className="flex items-center gap-1.5">
                        <code className="text-[11px] font-mono text-cyan-300 bg-cyan-950/50 px-1.5 py-0.5 rounded border border-cyan-800/40">
                          {std.rfidUid}
                        </code>
                        <button
                          onClick={() => handleCopyUid(std.rfidUid)}
                          className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors"
                          title="Salin RFID UID"
                        >
                          {copiedUid === std.rfidUid ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-slate-800/60">
                      <span className="text-slate-400 font-mono text-[11px]">Presensi Lab:</span>
                      <span className="text-emerald-400 font-semibold font-mono text-[11px]">
                        {attendanceCount > 0 ? `${attendanceCount}x Hadir` : 'Belum ada record'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bottom Action Buttons */}
                <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between gap-2">
                  <button
                    onClick={() => setSelectedStudentForDetail(std)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-800/90 hover:bg-cyan-950/60 text-slate-200 hover:text-cyan-300 border border-slate-700/80 hover:border-cyan-500/40 text-xs font-semibold transition-all"
                  >
                    <CreditCard className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Lihat KTA &amp; Profil</span>
                  </button>

                  <button
                    onClick={() => handleOpenEditModal(std)}
                    className="p-2 rounded-xl bg-slate-800/60 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/60 transition-colors"
                    title="Edit Data Siswa"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => setStudentToDelete(std)}
                    className="p-2 rounded-xl bg-slate-800/60 hover:bg-red-950/50 text-slate-400 hover:text-red-400 border border-slate-700/60 hover:border-red-800/50 transition-colors"
                    title="Hapus Siswa"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TABLE VIEW */}
      {viewMode === 'table' && filteredStudents.length > 0 && (
        <div className="bg-[#0b1120] border border-cyan-900/30 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#080d19] border-b border-slate-800 text-slate-400 uppercase tracking-wider font-mono">
                <tr>
                  <th className="py-3.5 px-4">Siswa</th>
                  <th className="py-3.5 px-4">NISN &amp; Kelas</th>
                  <th className="py-3.5 px-4">Divisi</th>
                  <th className="py-3.5 px-4">RFID UID</th>
                  <th className="py-3.5 px-4">Presensi</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/70 text-slate-300">
                {filteredStudents.map((std) => {
                  const divStyle = getDivisionStyle(std.division);
                  const attCount = getStudentAttendanceCount(std.id, std.nisn);

                  return (
                    <tr
                      key={std.id}
                      className="hover:bg-slate-900/60 transition-colors group"
                    >
                      {/* Siswa */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={std.avatarUrl}
                            alt={std.name}
                            className="w-10 h-10 rounded-xl object-cover border border-slate-700"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80';
                            }}
                          />
                          <div>
                            <div className="font-bold text-white group-hover:text-cyan-300 transition-colors">
                              {std.name}
                            </div>
                            <div className="text-[11px] text-cyan-400 font-medium">
                              {std.position || 'Anggota'}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* NISN & Kelas */}
                      <td className="py-3.5 px-4">
                        <div className="font-mono text-slate-200 font-semibold">{std.nisn}</div>
                        <div className="text-[11px] text-slate-400">{std.class}</div>
                      </td>

                      {/* Divisi */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold font-mono border ${divStyle.badge}`}
                        >
                          {std.division}
                        </span>
                      </td>

                      {/* RFID UID */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5">
                          <code className="font-mono text-[11px] text-cyan-300 bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-800/40">
                            {std.rfidUid}
                          </code>
                          <button
                            onClick={() => handleCopyUid(std.rfidUid)}
                            className="p-1 text-slate-400 hover:text-white"
                            title="Salin UID"
                          >
                            {copiedUid === std.rfidUid ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </td>

                      {/* Presensi */}
                      <td className="py-3.5 px-4">
                        <span className="font-mono text-emerald-400 font-semibold">
                          {attCount}x
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                            std.status === 'Pengurus'
                              ? 'bg-violet-950 text-violet-300 border border-violet-800'
                              : std.status === 'Aktif'
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {std.status}
                        </span>
                      </td>

                      {/* Aksi */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedStudentForDetail(std)}
                            className="p-1.5 rounded-lg bg-slate-800 text-cyan-300 hover:bg-cyan-950 border border-slate-700"
                            title="Lihat KTA & Detail"
                          >
                            <CreditCard className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleOpenEditModal(std)}
                            className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700"
                            title="Edit Data"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setStudentToDelete(std)}
                            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-red-400 hover:bg-red-950/40 border border-slate-700"
                            title="Hapus"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 1: DETAIL SISWA & VIRTUAL KTA */}
      {/* ======================================================== */}
      {selectedStudentForDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-2xl bg-[#090e1a] border border-cyan-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
            {/* Close Button */}
            <button
              onClick={() => setSelectedStudentForDetail(null)}
              className="absolute top-5 right-5 p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Title */}
            <div className="flex items-center gap-2 mb-6">
              <div className="p-2.5 rounded-xl bg-cyan-950/80 border border-cyan-500/40 text-cyan-400">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-extrabold text-white">
                  Kartu Tanda Anggota &amp; Profil Siswa
                </h3>
                <p className="text-xs text-slate-400">
                  Identitas resmi ekstrakurikuler IT Club &amp; Laboratorium Komputer
                </p>
              </div>
            </div>

            {/* Virtual Card Preview (Simulasi KTA) */}
            <div className="mb-6 p-1 rounded-2xl bg-gradient-to-r from-cyan-500 via-indigo-500 to-violet-600 shadow-xl">
              <div className="relative rounded-[14px] bg-gradient-to-br from-[#0c1427] via-[#091122] to-[#14122d] p-5 sm:p-6 text-white overflow-hidden">
                {/* Hologram Watermark Background */}
                <div className="absolute top-0 right-0 -mt-8 -mr-8 w-44 h-44 bg-cyan-400/10 rounded-full blur-2xl pointer-events-none" />
                <div className="absolute bottom-0 right-1/3 w-32 h-32 bg-violet-500/10 rounded-full blur-xl pointer-events-none" />

                {/* Card Header */}
                <div className="flex items-center justify-between pb-4 border-b border-cyan-900/50 mb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-teal-500 flex items-center justify-center font-extrabold text-slate-950 text-xs">
                      IT
                    </div>
                    <div>
                      <div className="text-xs font-black tracking-wider uppercase text-cyan-300">
                        IT CLUB LABORATORY
                      </div>
                      <div className="text-[10px] font-mono text-slate-400">
                        Official Student Member Card
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-cyan-950/80 border border-cyan-600/40 text-[10px] font-mono text-cyan-300">
                    <Radio className="w-3 h-3 text-cyan-400 animate-pulse" />
                    <span>RFID 13.56 MHz</span>
                  </div>
                </div>

                {/* Card Body: Photo, Info, QR */}
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
                  {/* Photo with frame */}
                  <div className="relative shrink-0">
                    <img
                      src={selectedStudentForDetail.avatarUrl}
                      alt={selectedStudentForDetail.name}
                      className="w-24 h-28 object-cover rounded-xl border-2 border-cyan-400 shadow-md"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80';
                      }}
                    />
                    <div className="absolute -bottom-2 -left-2 -right-2 text-center">
                      <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded bg-slate-950/90 border border-cyan-500/50 text-cyan-300 shadow">
                        {selectedStudentForDetail.status}
                      </span>
                    </div>
                  </div>

                  {/* Student Details */}
                  <div className="flex-1 space-y-1.5 text-center sm:text-left">
                    <h4 className="text-lg font-black text-white leading-tight">
                      {selectedStudentForDetail.name}
                    </h4>
                    <p className="text-xs font-semibold text-cyan-300">
                      {selectedStudentForDetail.position || 'Anggota Club'}
                    </p>

                    <div className="grid grid-cols-2 gap-2 pt-2 text-[11px] font-mono">
                      <div>
                        <span className="text-slate-400 block text-[10px]">NISN:</span>
                        <span className="text-slate-100 font-bold">{selectedStudentForDetail.nisn}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Kelas:</span>
                        <span className="text-slate-100 font-bold">{selectedStudentForDetail.class}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Divisi:</span>
                        <span className="text-teal-300 font-bold">{selectedStudentForDetail.division}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">RFID UID:</span>
                        <span className="text-cyan-300 font-bold">{selectedStudentForDetail.rfidUid}</span>
                      </div>
                    </div>
                  </div>

                  {/* QR Code */}
                  <div className="shrink-0 flex flex-col items-center bg-white p-2 rounded-xl shadow-lg">
                    {detailQrUrl ? (
                      <img
                        src={detailQrUrl}
                        alt="QR Absensi"
                        className="w-20 h-20"
                      />
                    ) : (
                      <div className="w-20 h-20 bg-slate-100 flex items-center justify-center">
                        <QrCode className="w-8 h-8 text-slate-400" />
                      </div>
                    )}
                    <span className="text-[9px] font-mono text-slate-800 font-bold mt-1">
                      SCAN ABSEN
                    </span>
                  </div>
                </div>

                {/* Card Footer Bar */}
                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono text-slate-400">
                  <span>Masa Berlaku: TA 2026/2027</span>
                  <span>ID: {selectedStudentForDetail.id}</span>
                </div>
              </div>
            </div>

            {/* Additional Info Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1 text-xs">
                <span className="text-slate-400 flex items-center gap-1.5 font-mono text-[11px]">
                  <Mail className="w-3.5 h-3.5 text-cyan-400" />
                  Email Terdaftar:
                </span>
                <span className="text-slate-200 font-semibold block break-all">
                  {selectedStudentForDetail.email || '-'}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1 text-xs">
                <span className="text-slate-400 flex items-center gap-1.5 font-mono text-[11px]">
                  <Phone className="w-3.5 h-3.5 text-cyan-400" />
                  No. Telepon / WA:
                </span>
                <span className="text-slate-200 font-semibold block">
                  {selectedStudentForDetail.phone || '-'}
                </span>
              </div>
            </div>

            {/* Action Buttons in Modal */}
            <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-4 border-t border-slate-800">
              <button
                onClick={() => {
                  const std = selectedStudentForDetail;
                  setSelectedStudentForDetail(null);
                  handleOpenEditModal(std);
                }}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
              >
                <Edit3 className="w-4 h-4" />
                <span>Edit Biodata</span>
              </button>

              {onNavigateToCardStudio && (
                <button
                  onClick={() => {
                    const id = selectedStudentForDetail.id;
                    setSelectedStudentForDetail(null);
                    onNavigateToCardStudio(id);
                  }}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-400 hover:from-cyan-400 hover:to-teal-300 text-slate-950 text-xs font-bold transition-all shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-1.5"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Buka di Studio Cetak Kartu</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 2: TAMBAH / EDIT SISWA */}
      {/* ======================================================== */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-xl bg-[#0b1120] border border-cyan-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl max-h-[92vh] overflow-y-auto">
            {/* Close Button */}
            <button
              onClick={() => {
                setShowAddModal(false);
                setEditingStudent(null);
              }}
              className="absolute top-5 right-5 p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 rounded-2xl bg-cyan-950/80 border border-cyan-500/40 text-cyan-400">
                {editingStudent ? <Edit3 className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
              </div>
              <div>
                <h3 className="text-xl font-extrabold text-white">
                  {editingStudent ? 'Edit Data Anggota' : 'Tambah Anggota Baru'}
                </h3>
                <p className="text-xs text-slate-400">
                  {editingStudent
                    ? 'Perbarui informasi siswa dan pengaturan kartu RFID'
                    : 'Daftarkan siswa baru ke database IT Club & Lab Komputer'}
                </p>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
              {/* Photo Preview & Upload */}
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center gap-4">
                <img
                  src={formData.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80'}
                  alt="Preview"
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-cyan-500/50 shadow"
                />
                <div className="flex-1 space-y-2">
                  <label className="block text-slate-300 font-semibold">
                    Foto Profil Siswa
                  </label>
                  <div className="flex items-center gap-2">
                    <label className="cursor-pointer px-3 py-1.5 rounded-xl bg-cyan-950/80 border border-cyan-700/60 hover:bg-cyan-900/60 text-cyan-300 font-semibold transition-colors flex items-center gap-1.5">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Unggah Foto</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        className="hidden"
                      />
                    </label>
                    <span className="text-[11px] text-slate-500">Maksimal 2MB (JPG/PNG)</span>
                  </div>
                </div>
              </div>

              {/* Nama & NISN */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Nama Lengkap <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Contoh: Muhammad Rizky"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    NISN (Nomor Induk Siswa) <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.nisn}
                    onChange={(e) => setFormData({ ...formData, nisn: e.target.value })}
                    placeholder="Contoh: 0078129041"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 font-mono"
                  />
                </div>
              </div>

              {/* Kelas & Divisi */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Kelas &amp; Jurusan <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.class}
                    onChange={(e) => setFormData({ ...formData, class: e.target.value })}
                    placeholder="Contoh: XI RPL 1 (Rekayasa Perangkat Lunak)"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Divisi Spesialisasi <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={formData.division}
                    onChange={(e) =>
                      setFormData({ ...formData, division: e.target.value as DivisionType })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 cursor-pointer"
                  >
                    <option value="Python Programming">Python Programming</option>
                    <option value="C# .NET">C# .NET</option>
                    <option value="Scratch">Scratch</option>
                    <option value="Desain Grafis">Desain Grafis</option>
                    <option value="Jaringan Komputer">Jaringan Komputer</option>
                  </select>
                </div>
              </div>

              {/* Status & Jabatan */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Status Keanggotaan
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        status: e.target.value as 'Aktif' | 'Pengurus' | 'Alumni',
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 cursor-pointer"
                  >
                    <option value="Aktif">Aktif</option>
                    <option value="Pengurus">Pengurus</option>
                    <option value="Alumni">Alumni</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Jabatan / Peran di Club
                  </label>
                  <input
                    type="text"
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                    placeholder="Contoh: Ketua Divisi / Anggota Aktif"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50"
                  />
                </div>
              </div>

              {/* RFID UID with Auto-generate */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-slate-300 font-semibold flex items-center gap-1.5">
                    <Radio className="w-3.5 h-3.5 text-cyan-400" />
                    RFID Card UID (13.56 MHz) <span className="text-red-400">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      const newUid = `E${Math.floor(100 + Math.random() * 899)}-${Math.floor(
                        1000 + Math.random() * 8999
                      )}-${String(students.length + 1).padStart(2, '0')}`;
                      setFormData({ ...formData, rfidUid: newUid });
                    }}
                    className="text-[11px] text-cyan-400 hover:text-cyan-300 font-mono font-medium underline"
                  >
                    Generate UID Baru
                  </button>
                </div>
                <input
                  type="text"
                  required
                  value={formData.rfidUid}
                  onChange={(e) => setFormData({ ...formData, rfidUid: e.target.value })}
                  placeholder="Contoh: E280-1170-01"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-cyan-300 font-mono font-semibold placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50"
                />
              </div>

              {/* Email & No HP */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="nama@student.sch.id"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">No. WhatsApp</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="0812-3456-7890"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 font-mono"
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-5 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingStudent(null);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
                >
                  Batal
                </button>

                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-400 hover:from-cyan-400 hover:to-teal-300 text-slate-950 text-xs font-bold transition-all shadow-lg shadow-cyan-500/25 active:scale-95 flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>{editingStudent ? 'Simpan Perubahan' : 'Daftarkan Anggota'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 3: KONFIRMASI HAPUS SISWA */}
      {/* ======================================================== */}
      {studentToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-md bg-[#0b1120] border border-red-500/40 rounded-3xl p-6 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-2xl bg-red-950/80 border border-red-500/40 text-red-400">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Konfirmasi Hapus Data</h3>
                <p className="text-xs text-slate-400">Tindakan ini tidak dapat dibatalkan</p>
              </div>
            </div>

            <p className="text-sm text-slate-300 mb-6">
              Apakah Anda yakin ingin menghapus data anggota{' '}
              <strong className="text-white font-bold">{studentToDelete.name}</strong> (NISN:{' '}
              {studentToDelete.nisn}) dari database IT Club?
            </p>

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setStudentToDelete(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
              >
                Batal
              </button>

              <button
                onClick={() => {
                  onDeleteStudent(studentToDelete.id);
                  setStudentToDelete(null);
                }}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition-colors shadow-lg shadow-red-600/30"
              >
                Hapus Anggota
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
