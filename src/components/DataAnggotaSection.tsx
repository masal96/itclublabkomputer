import React, { useState, useRef } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  Plus, 
  Edit3, 
  Trash2, 
  CreditCard, 
  Download, 
  Lock, 
  UserCheck, 
  ArrowRight, 
  Upload, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  Phone, 
  Mail, 
  Calendar, 
  Radio, 
  ShieldCheck, 
  Sparkles,
  LayoutGrid,
  List,
  RefreshCw,
  Award
} from 'lucide-react';
import { Student, DivisionType, AdminUser } from '../types';

interface DataAnggotaSectionProps {
  admin: AdminUser;
  students: Student[];
  onAddStudent: (newStudent: Student) => void;
  onUpdateStudent: (updatedStudent: Student) => void;
  onDeleteStudent: (id: string) => void;
  onOpenAdminModal: () => void;
  onNavigateToCardStudio?: (student: Student) => void;
}

export const DataAnggotaSection: React.FC<DataAnggotaSectionProps> = ({
  admin,
  students,
  onAddStudent,
  onUpdateStudent,
  onDeleteStudent,
  onOpenAdminModal,
  onNavigateToCardStudio,
}) => {
  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDivision, setSelectedDivision] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [studentToEdit, setStudentToEdit] = useState<Student | null>(null);
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Edit form state
  const [editName, setEditName] = useState('');
  const [editNisn, setEditNisn] = useState('');
  const [editClass, setEditClass] = useState('');
  const [editDivision, setEditDivision] = useState<DivisionType>('C# .NET');
  const [editStatus, setEditStatus] = useState<'Aktif' | 'Pengurus' | 'Alumni'>('Aktif');
  const [editPosition, setEditPosition] = useState('');
  const [editRfidUid, setEditRfidUid] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editAvatarUrl, setEditAvatarUrl] = useState('');
  const [editAvatarTab, setEditAvatarTab] = useState<'upload' | 'preset' | 'url'>('upload');
  const [editCustomUrl, setEditCustomUrl] = useState('');
  const editFileInputRef = useRef<HTMLInputElement | null>(null);

  // Add form state
  const [addName, setAddName] = useState('');
  const [addNisn, setAddNisn] = useState('');
  const [addClass, setAddClass] = useState('');
  const [addDivision, setAddDivision] = useState<DivisionType>('C# .NET');
  const [addStatus, setAddStatus] = useState<'Aktif' | 'Pengurus' | 'Alumni'>('Aktif');
  const [addPosition, setAddPosition] = useState('');
  const [addRfidUid, setAddRfidUid] = useState('');
  const [addEmail, setAddEmail] = useState('');
  const [addPhone, setAddPhone] = useState('');
  const [addAvatarUrl, setAddAvatarUrl] = useState('https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=300&auto=format&fit=crop&q=80');
  const [addAvatarTab, setAddAvatarTab] = useState<'upload' | 'preset' | 'url'>('preset');
  const [addCustomUrl, setAddCustomUrl] = useState('');
  const addFileInputRef = useRef<HTMLInputElement | null>(null);

  const AVATAR_PRESETS = [
    { id: 'av-1', label: 'Siswa 1', url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=300&auto=format&fit=crop&q=80' },
    { id: 'av-2', label: 'Siswi 1', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80' },
    { id: 'av-3', label: 'Siswa 2', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80' },
    { id: 'av-4', label: 'Siswi 2', url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&auto=format&fit=crop&q=80' },
    { id: 'av-5', label: 'Siswa 3', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80' },
    { id: 'av-6', label: 'Siswi 3', url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&auto=format&fit=crop&q=80' },
  ];

  const DIVISIONS: DivisionType[] = [
    'C# .NET',
    'Scratch',
    'Desain Grafis',
    'Jaringan Komputer',
    'Python Programming',
  ];

  const showToast = (type: 'success' | 'error', text: string) => {
    setNotification({ type, text });
    setTimeout(() => setNotification(null), 4000);
  };

  // Generate random RFID UID
  const generateRandomRfid = () => {
    const hex = '0123456789ABCDEF';
    const segment = (len: number) => Array.from({ length: len }, () => hex[Math.floor(Math.random() * hex.length)]).join('');
    return `${segment(4)}-${segment(4)}-${segment(2)}`;
  };

  // Open Edit Modal
  const handleOpenEdit = (student: Student) => {
    setStudentToEdit(student);
    setEditName(student.name);
    setEditNisn(student.nisn);
    setEditClass(student.class);
    setEditDivision(student.division);
    setEditStatus(student.status || 'Aktif');
    setEditPosition(student.position || '');
    setEditRfidUid(student.rfidUid);
    setEditEmail(student.email || '');
    setEditPhone(student.phone || '');
    setEditAvatarUrl(student.avatarUrl);
    setEditAvatarTab('upload');
    setEditCustomUrl('');
    setShowEditModal(true);
  };

  // Handle Edit Image File
  const handleEditImageUpload = (file: File) => {
    if (!file.type.startsWith('image/')) {
      showToast('error', 'Pilih file format gambar (JPG, PNG, WebP).');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showToast('error', 'Ukuran gambar maksimal 5MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setEditAvatarUrl(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  // Save Edit
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentToEdit) return;

    if (!editName.trim() || !editNisn.trim()) {
      showToast('error', 'Nama lengkap dan NISN wajib diisi.');
      return;
    }

    const updated: Student = {
      ...studentToEdit,
      name: editName.trim(),
      nisn: editNisn.trim(),
      class: editClass.trim() || studentToEdit.class,
      division: editDivision,
      status: editStatus,
      position: editPosition.trim() || undefined,
      rfidUid: editRfidUid.trim() || studentToEdit.rfidUid,
      email: editEmail.trim(),
      phone: editPhone.trim(),
      avatarUrl: editAvatarUrl || studentToEdit.avatarUrl,
      qrCodeData: `ITCLUB:${editNisn.trim()}:${editName.trim()}:${editClass.trim()}`,
    };

    onUpdateStudent(updated);
    setShowEditModal(false);
    setStudentToEdit(null);
    showToast('success', `Data anggota ${updated.name} berhasil diperbarui.`);
  };

  // Open Add Modal
  const handleOpenAdd = () => {
    setAddName('');
    setAddNisn('');
    setAddClass('X RPL 1');
    setAddDivision('C# .NET');
    setAddStatus('Aktif');
    setAddPosition('');
    setAddRfidUid(generateRandomRfid());
    setAddEmail('');
    setAddPhone('');
    setAddAvatarUrl(AVATAR_PRESETS[0].url);
    setAddAvatarTab('preset');
    setAddCustomUrl('');
    setShowAddModal(true);
  };

  // Handle Add Image File
  const handleAddImageUpload = (file: File) => {
    if (!file.type.startsWith('image/')) {
      showToast('error', 'Pilih file format gambar (JPG, PNG, WebP).');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showToast('error', 'Ukuran gambar maksimal 5MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setAddAvatarUrl(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  // Save Add
  const handleSaveAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addName.trim() || !addNisn.trim()) {
      showToast('error', 'Nama lengkap dan NISN wajib diisi.');
      return;
    }

    // Check NISN duplicate
    if (students.some((s) => s.nisn === addNisn.trim())) {
      showToast('error', `NISN ${addNisn} sudah terdaftar dalam sistem.`);
      return;
    }

    const newStudent: Student = {
      id: `std-${Date.now()}`,
      name: addName.trim(),
      nisn: addNisn.trim(),
      class: addClass.trim() || 'X RPL 1',
      division: addDivision,
      rfidUid: addRfidUid.trim() || generateRandomRfid(),
      qrCodeData: `ITCLUB:${addNisn.trim()}:${addName.trim()}:${addClass.trim()}`,
      avatarUrl: addAvatarUrl,
      email: addEmail.trim() || `${addNisn.trim()}@student.sch.id`,
      phone: addPhone.trim() || '0812-0000-0000',
      joinedDate: new Date().toISOString().split('T')[0],
      status: addStatus,
      position: addPosition.trim() || (addStatus === 'Pengurus' ? 'Pengurus Divisi' : 'Anggota'),
    };

    onAddStudent(newStudent);
    setShowAddModal(false);
    showToast('success', `Anggota baru ${newStudent.name} berhasil ditambahkan.`);
  };

  // Open Delete Confirmation
  const handleOpenDelete = (student: Student) => {
    setStudentToDelete(student);
    setShowDeleteModal(true);
  };

  // Execute Delete
  const handleConfirmDelete = () => {
    if (!studentToDelete) return;
    const deletedName = studentToDelete.name;
    onDeleteStudent(studentToDelete.id);
    setShowDeleteModal(false);
    setStudentToDelete(null);
    showToast('success', `Anggota ${deletedName} berhasil dihapus dari database.`);
  };

  // Export CSV
  const handleExportCsv = () => {
    const headers = [
      'ID',
      'Nama Lengkap',
      'NISN',
      'Kelas',
      'Divisi Spesialisasi',
      'Status',
      'Jabatan',
      'RFID UID',
      'Email',
      'No. WhatsApp',
      'Tanggal Bergabung',
    ];

    const rows = students.map((s) => [
      s.id,
      `"${s.name}"`,
      s.nisn,
      `"${s.class}"`,
      `"${s.division}"`,
      s.status,
      `"${s.position || '-'}"`,
      s.rfidUid,
      `"${s.email}"`,
      `"${s.phone}"`,
      s.joinedDate,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Data_Anggota_ITClub_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtered Students
  const filteredStudents = students.filter((s) => {
    const query = searchQuery.toLowerCase().trim();
    const matchQuery =
      !query ||
      s.name.toLowerCase().includes(query) ||
      s.nisn.toLowerCase().includes(query) ||
      s.class.toLowerCase().includes(query) ||
      s.rfidUid.toLowerCase().includes(query) ||
      s.email.toLowerCase().includes(query) ||
      s.phone.toLowerCase().includes(query);

    const matchDivision = selectedDivision === 'all' || s.division === selectedDivision;
    const matchStatus = selectedStatus === 'all' || s.status === selectedStatus;

    return matchQuery && matchDivision && matchStatus;
  });

  // Stats calculation
  const totalAnggota = students.length;
  const totalPengurus = students.filter((s) => s.status === 'Pengurus').length;
  const totalAktif = students.filter((s) => s.status === 'Aktif').length;
  const totalPython = students.filter((s) => s.division === 'Python Programming').length;

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
            Menu Data Anggota Terkunci
          </h2>

          <p className="text-slate-300 max-w-xl mx-auto text-sm sm:text-base mb-8 leading-relaxed">
            Halaman manajemen <strong>Data Anggota IT Club</strong> yang berisi privasi siswa (NISN, kontak, RFID UID, serta hak akses untuk <strong>Edit dan Hapus Anggota</strong>) hanya dapat diakses oleh <strong>Guru Pembimbing Lab Komputer</strong>.
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

  // GURU ADMIN LOGGED IN
  return (
    <section className="py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-24 right-4 z-50 max-w-md animate-fadeIn">
          <div className={`p-4 rounded-xl border flex items-center gap-3 shadow-2xl backdrop-blur-md ${
            notification.type === 'success'
              ? 'bg-emerald-950/90 border-emerald-500 text-emerald-200'
              : 'bg-red-950/90 border-red-500 text-red-200'
          }`}>
            {notification.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
            )}
            <span className="text-xs font-medium">{notification.text}</span>
          </div>
        </div>
      )}

      {/* Header Banner Guru */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-violet-950/40 via-[#0b1120] to-cyan-950/40 border border-violet-500/40 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-violet-600/20 border border-violet-500/50 flex items-center justify-center text-violet-300">
            <Users className="w-6 h-6 text-cyan-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Manajemen Data Anggota IT Club
              </h2>
              <span className="px-2 py-0.5 text-[11px] font-mono font-bold bg-teal-500/20 text-teal-300 border border-teal-500/40 rounded">
                GURU ONLY
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-400">
              Instruktur Pengelola: <span className="text-cyan-300 font-medium">{admin.name}</span> (NIP: {admin.nip})
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={handleExportCsv}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl bg-slate-900 hover:bg-slate-800 border border-cyan-500/30 text-cyan-300 transition-all shadow-sm"
          >
            <Download className="w-4 h-4" />
            <span>Ekspor CSV</span>
          </button>

          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-slate-950 transition-all shadow-lg shadow-cyan-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Anggota</span>
          </button>
        </div>
      </div>

      {/* Stat Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8">
        <div className="p-4 rounded-2xl bg-[#0b1120] border border-cyan-900/30">
          <span className="text-xs text-slate-400 block mb-1">Total Anggota Terdaftar</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-mono font-bold text-white tabular-nums">
              {totalAnggota}
            </span>
            <span className="text-xs font-mono text-cyan-400">Siswa</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#0b1120] border border-violet-900/40">
          <span className="text-xs text-violet-300 block mb-1">Pengurus IT Club</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-mono font-bold text-violet-300 tabular-nums">
              {totalPengurus}
            </span>
            <span className="text-xs font-mono text-violet-400">Koordinator</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#0b1120] border border-emerald-900/40">
          <span className="text-xs text-emerald-300 block mb-1">Anggota Aktif</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-mono font-bold text-emerald-300 tabular-nums">
              {totalAktif}
            </span>
            <span className="text-xs font-mono text-emerald-400">Praktikan</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#0b1120] border border-amber-900/40">
          <span className="text-xs text-amber-300 block mb-1">Divisi Python Programming</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-mono font-bold text-amber-300 tabular-nums">
              {totalPython}
            </span>
            <span className="text-xs font-mono text-amber-400">AI &amp; Otomasi</span>
          </div>
        </div>
      </div>

      {/* Control Bar: Search, Filters & View Toggle */}
      <div className="p-4 rounded-2xl bg-[#0b1120] border border-slate-800 mb-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama siswa, NISN, kelas, nomor HP, atau UID RFID..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-colors"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Division Filter */}
          <select
            value={selectedDivision}
            onChange={(e) => setSelectedDivision(e.target.value)}
            aria-label="Filter Divisi"
            className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-cyan-400"
          >
            <option value="all">Semua Divisi ({students.length})</option>
            {DIVISIONS.map((div) => (
              <option key={div} value={div}>
                {div}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            aria-label="Filter Status"
            className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-cyan-400"
          >
            <option value="all">Semua Status</option>
            <option value="Pengurus">Pengurus</option>
            <option value="Aktif">Aktif</option>
            <option value="Alumni">Alumni</option>
          </select>

          {/* View Mode Toggle */}
          <div className="flex items-center p-1 bg-slate-950 rounded-xl border border-slate-800">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'grid' ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-400 hover:text-white'
              }`}
              title="Tampilan Grid Card"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'table' ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-400 hover:text-white'
              }`}
              title="Tampilan Tabel Detail"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Content Rendering: Grid Mode vs Table Mode */}
      {filteredStudents.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-[#0b1120] border border-slate-800">
          <Users className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white mb-1">Tidak Ada Data Anggota Ditemukan</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mb-4">
            Tidak ada siswa yang cocok dengan filter pencarian "{searchQuery}" atau divisi yang dipilih.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedDivision('all');
              setSelectedStatus('all');
            }}
            className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-cyan-500/30"
          >
            Reset Semua Filter
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        // GRID CARD VIEW
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredStudents.map((student) => (
            <div
              key={student.id}
              className="p-5 rounded-2xl bg-[#0b1120] border border-slate-800 hover:border-cyan-500/40 transition-all flex flex-col justify-between group shadow-lg"
            >
              <div>
                {/* Header card with status and division badges */}
                <div className="flex items-start justify-between gap-2 mb-4">
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-cyan-950/80 text-cyan-300 border border-cyan-800/60 truncate">
                    {student.division}
                  </span>

                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    student.status === 'Pengurus'
                      ? 'bg-violet-950/80 text-violet-300 border border-violet-500/40'
                      : student.status === 'Aktif'
                      ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/40'
                      : 'bg-slate-800 text-slate-400 border border-slate-700'
                  }`}>
                    {student.status}
                  </span>
                </div>

                {/* Profile Avatar & Info */}
                <div className="flex items-center gap-3.5 mb-4">
                  <img
                    src={student.avatarUrl}
                    alt={student.name}
                    className="w-14 h-14 rounded-xl object-cover border-2 border-cyan-500/40 shadow-md group-hover:border-cyan-400 transition-colors"
                    referrerPolicy="no-referrer"
                  />
                  <div className="min-w-0 flex-1">
                    <h4 className="text-sm font-bold text-white truncate group-hover:text-cyan-300 transition-colors">
                      {student.name}
                    </h4>
                    <p className="text-xs text-slate-300 font-mono truncate">
                      NISN: {student.nisn}
                    </p>
                    <p className="text-xs text-slate-400 truncate">
                      {student.class}
                    </p>
                    {student.position && (
                      <p className="text-[11px] text-teal-400 font-medium truncate mt-0.5">
                        {student.position}
                      </p>
                    )}
                  </div>
                </div>

                {/* Details Meta */}
                <div className="space-y-1.5 p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 text-xs mb-4">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <Radio className="w-3.5 h-3.5 text-cyan-400" />
                      <span>UID RFID:</span>
                    </span>
                    <span className="font-mono text-cyan-300 font-bold">{student.rfidUid}</span>
                  </div>

                  {student.phone && (
                    <div className="flex items-center justify-between text-slate-400">
                      <span className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-slate-500" />
                        <span>WhatsApp:</span>
                      </span>
                      <span className="font-mono text-slate-300">{student.phone}</span>
                    </div>
                  )}

                  {student.email && (
                    <div className="flex items-center justify-between text-slate-400">
                      <span className="flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-slate-500" />
                        <span>Email:</span>
                      </span>
                      <span className="text-slate-300 truncate max-w-[150px]">{student.email}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons: Edit & Hapus & Cetak Kartu */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                {onNavigateToCardStudio && (
                  <button
                    type="button"
                    onClick={() => onNavigateToCardStudio(student)}
                    className="flex-1 py-1.5 px-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-slate-800 hover:border-cyan-500/40 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
                    title="Buka di Pencetak Kartu"
                  >
                    <CreditCard className="w-3.5 h-3.5" />
                    <span>Cetak Kartu</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => handleOpenEdit(student)}
                  className="py-1.5 px-3 rounded-lg bg-indigo-950/70 hover:bg-indigo-800/80 text-indigo-200 border border-indigo-500/40 text-xs font-bold flex items-center gap-1.5 transition-all"
                  title="Edit Data Anggota"
                >
                  <Edit3 className="w-3.5 h-3.5 text-indigo-300" />
                  <span>Edit</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleOpenDelete(student)}
                  className="py-1.5 px-2.5 rounded-lg bg-red-950/60 hover:bg-red-900/80 text-red-300 border border-red-500/40 text-xs font-bold flex items-center gap-1 transition-all"
                  title="Hapus Anggota"
                >
                  <Trash2 className="w-3.5 h-3.5 text-red-400" />
                  <span>Hapus</span>
                </button>
              </div>

            </div>
          ))}
        </div>
      ) : (
        // TABLE VIEW
        <div className="rounded-2xl bg-[#0b1120] border border-slate-800 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#080c16] text-slate-400 font-mono uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3">Siswa</th>
                  <th className="px-4 py-3">Kelas &amp; NISN</th>
                  <th className="px-4 py-3">Divisi Spesialisasi</th>
                  <th className="px-4 py-3">RFID UID</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Aksi Guru</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                {filteredStudents.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-900/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={s.avatarUrl}
                          alt={s.name}
                          className="w-9 h-9 rounded-lg object-cover border border-cyan-500/40"
                          referrerPolicy="no-referrer"
                        />
                        <div>
                          <div className="font-bold text-white text-xs">{s.name}</div>
                          <div className="text-[11px] text-teal-400">{s.position || 'Anggota'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-300">
                      <div>{s.class}</div>
                      <div className="text-[10px] text-slate-500 font-mono">NISN: {s.nisn}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-cyan-950/70 text-cyan-300 border border-cyan-800/50">
                        {s.division}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-cyan-300 text-xs">
                      {s.rfidUid}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        s.status === 'Pengurus'
                          ? 'bg-violet-950/80 text-violet-300 border border-violet-500/40'
                          : s.status === 'Aktif'
                          ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/40'
                          : 'bg-slate-800 text-slate-400 border border-slate-700'
                      }`}>
                        {s.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {onNavigateToCardStudio && (
                          <button
                            type="button"
                            onClick={() => onNavigateToCardStudio(s)}
                            className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-slate-800"
                            title="Cetak Kartu Anggota"
                          >
                            <CreditCard className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(s)}
                          className="p-1.5 rounded-lg bg-indigo-950/70 hover:bg-indigo-800/80 text-indigo-300 border border-indigo-500/40"
                          title="Edit Anggota"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenDelete(s)}
                          className="p-1.5 rounded-lg bg-red-950/60 hover:bg-red-900/80 text-red-300 border border-red-500/40"
                          title="Hapus Anggota"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-3 bg-[#080d1a] border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Menampilkan {filteredStudents.length} dari {students.length} anggota</span>
            <span className="font-mono text-cyan-400">Database Anggota IT Club Terverifikasi</span>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL EDIT ANGGOTA */}
      {/* ============================================================== */}
      {showEditModal && studentToEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-[#0b1120] border border-cyan-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-cyan-950/50 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Edit Data Anggota</h3>
                  <p className="text-xs text-slate-400">
                    Memperbarui data resmi siswa: <span className="text-cyan-300">{studentToEdit.name}</span>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-5">
              
              {/* Foto Profil Editor */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  Foto Profil Anggota:
                </label>
                
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <img
                    src={editAvatarUrl}
                    alt="Preview"
                    className="w-16 h-16 rounded-xl object-cover border-2 border-cyan-400 shadow-md shrink-0"
                    referrerPolicy="no-referrer"
                  />

                  <div className="flex-1 w-full space-y-2">
                    <div className="flex items-center gap-1.5 text-xs">
                      <button
                        type="button"
                        onClick={() => setEditAvatarTab('upload')}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                          editAvatarTab === 'upload' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        Upload Foto
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditAvatarTab('preset')}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                          editAvatarTab === 'preset' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        Preset Avatar
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditAvatarTab('url')}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                          editAvatarTab === 'url' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        URL Gambar
                      </button>
                    </div>

                    {editAvatarTab === 'upload' && (
                      <div>
                        <input
                          ref={editFileInputRef}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleEditImageUpload(file);
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => editFileInputRef.current?.click()}
                          className="w-full py-2 px-3 rounded-xl border border-dashed border-cyan-500/60 bg-cyan-950/20 hover:bg-cyan-950/40 text-cyan-300 text-xs font-semibold flex items-center justify-center gap-2"
                        >
                          <Upload className="w-4 h-4" />
                          <span>Pilih Foto dari Perangkat (JPG/PNG)</span>
                        </button>
                      </div>
                    )}

                    {editAvatarTab === 'preset' && (
                      <div className="grid grid-cols-6 gap-2">
                        {AVATAR_PRESETS.map((p) => (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => setEditAvatarUrl(p.url)}
                            className={`rounded-lg overflow-hidden border-2 transition-all ${
                              editAvatarUrl === p.url ? 'border-cyan-400 scale-105' : 'border-transparent opacity-60 hover:opacity-100'
                            }`}
                          >
                            <img src={p.url} alt={p.label} className="w-full h-9 object-cover" />
                          </button>
                        ))}
                      </div>
                    )}

                    {editAvatarTab === 'url' && (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={editCustomUrl}
                          onChange={(e) => setEditCustomUrl(e.target.value)}
                          placeholder="https://images.unsplash.com/..."
                          className="flex-1 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (editCustomUrl.trim()) {
                              setEditAvatarUrl(editCustomUrl.trim());
                              setEditCustomUrl('');
                            }
                          }}
                          className="px-3 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold rounded-lg"
                        >
                          Terapkan
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Data Identitas */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Nama Lengkap Siswa *
                  </label>
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    NISN (Nomor Induk Siswa Nasional) *
                  </label>
                  <input
                    type="text"
                    required
                    value={editNisn}
                    onChange={(e) => setEditNisn(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Kelas &amp; Jurusan
                  </label>
                  <input
                    type="text"
                    value={editClass}
                    onChange={(e) => setEditClass(e.target.value)}
                    placeholder="cth: XI RPL 1"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Divisi Spesialisasi IT Club
                  </label>
                  <select
                    value={editDivision}
                    onChange={(e) => setEditDivision(e.target.value as DivisionType)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-400"
                  >
                    {DIVISIONS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Status Keanggotaan
                  </label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-400"
                  >
                    <option value="Aktif">Aktif</option>
                    <option value="Pengurus">Pengurus</option>
                    <option value="Alumni">Alumni</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Jabatan / Posisi
                  </label>
                  <input
                    type="text"
                    value={editPosition}
                    onChange={(e) => setEditPosition(e.target.value)}
                    placeholder="cth: Ketua Divisi, Sekretaris, Anggota"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    UID Kartu RFID Siswa
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={editRfidUid}
                      onChange={(e) => setEditRfidUid(e.target.value)}
                      placeholder="E280-1170-01"
                      className="flex-1 px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-400"
                    />
                    <button
                      type="button"
                      onClick={() => setEditRfidUid(generateRandomRfid())}
                      className="px-3 py-2 bg-slate-850 hover:bg-slate-800 text-slate-300 rounded-xl text-xs font-mono"
                      title="Generate UID Acak"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Nomor Telepon / WhatsApp
                  </label>
                  <input
                    type="text"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    placeholder="0812-3456-7890"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Alamat Email Siswa
                  </label>
                  <input
                    type="email"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    placeholder="nama.siswa@student.sch.id"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-slate-950 text-xs font-bold transition-all shadow-lg shadow-cyan-500/20"
                >
                  Simpan Perubahan
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL TAMBAH ANGGOTA BARU */}
      {/* ============================================================== */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-[#0b1120] border border-cyan-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-cyan-950/50 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Tambah Anggota IT Club Baru</h3>
                  <p className="text-xs text-slate-400">Registrasi manual anggota oleh Guru Pembimbing</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAdd} className="space-y-5">
              
              {/* Foto Profil */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  Foto Profil Anggota:
                </label>
                
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <img
                    src={addAvatarUrl}
                    alt="Preview"
                    className="w-16 h-16 rounded-xl object-cover border-2 border-cyan-400 shadow-md shrink-0"
                    referrerPolicy="no-referrer"
                  />

                  <div className="flex-1 w-full space-y-2">
                    <div className="flex items-center gap-1.5 text-xs">
                      <button
                        type="button"
                        onClick={() => setAddAvatarTab('preset')}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                          addAvatarTab === 'preset' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        Pilih Preset
                      </button>
                      <button
                        type="button"
                        onClick={() => setAddAvatarTab('upload')}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                          addAvatarTab === 'upload' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        Upload Foto
                      </button>
                      <button
                        type="button"
                        onClick={() => setAddAvatarTab('url')}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                          addAvatarTab === 'url' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        URL Gambar
                      </button>
                    </div>

                    {addAvatarTab === 'upload' && (
                      <div>
                        <input
                          ref={addFileInputRef}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleAddImageUpload(file);
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => addFileInputRef.current?.click()}
                          className="w-full py-2 px-3 rounded-xl border border-dashed border-cyan-500/60 bg-cyan-950/20 hover:bg-cyan-950/40 text-cyan-300 text-xs font-semibold flex items-center justify-center gap-2"
                        >
                          <Upload className="w-4 h-4" />
                          <span>Pilih Foto dari Perangkat (JPG/PNG)</span>
                        </button>
                      </div>
                    )}

                    {addAvatarTab === 'preset' && (
                      <div className="grid grid-cols-6 gap-2">
                        {AVATAR_PRESETS.map((p) => (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => setAddAvatarUrl(p.url)}
                            className={`rounded-lg overflow-hidden border-2 transition-all ${
                              addAvatarUrl === p.url ? 'border-cyan-400 scale-105' : 'border-transparent opacity-60 hover:opacity-100'
                            }`}
                          >
                            <img src={p.url} alt={p.label} className="w-full h-9 object-cover" />
                          </button>
                        ))}
                      </div>
                    )}

                    {addAvatarTab === 'url' && (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={addCustomUrl}
                          onChange={(e) => setAddCustomUrl(e.target.value)}
                          placeholder="https://images.unsplash.com/..."
                          className="flex-1 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (addCustomUrl.trim()) {
                              setAddAvatarUrl(addCustomUrl.trim());
                              setAddCustomUrl('');
                            }
                          }}
                          className="px-3 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold rounded-lg"
                        >
                          Terapkan
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Data Form */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Nama Lengkap Siswa *
                  </label>
                  <input
                    type="text"
                    required
                    value={addName}
                    onChange={(e) => setAddName(e.target.value)}
                    placeholder="cth: Arya Pratama"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    NISN (Nomor Induk Siswa Nasional) *
                  </label>
                  <input
                    type="text"
                    required
                    value={addNisn}
                    onChange={(e) => setAddNisn(e.target.value)}
                    placeholder="0089123456"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Kelas &amp; Jurusan
                  </label>
                  <input
                    type="text"
                    value={addClass}
                    onChange={(e) => setAddClass(e.target.value)}
                    placeholder="cth: X RPL 1"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Divisi Spesialisasi IT Club
                  </label>
                  <select
                    value={addDivision}
                    onChange={(e) => setAddDivision(e.target.value as DivisionType)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-400"
                  >
                    {DIVISIONS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Status Keanggotaan
                  </label>
                  <select
                    value={addStatus}
                    onChange={(e) => setAddStatus(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-400"
                  >
                    <option value="Aktif">Aktif</option>
                    <option value="Pengurus">Pengurus</option>
                    <option value="Alumni">Alumni</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Jabatan / Posisi
                  </label>
                  <input
                    type="text"
                    value={addPosition}
                    onChange={(e) => setAddPosition(e.target.value)}
                    placeholder="cth: Anggota Divisi / Pengurus"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    UID Kartu RFID
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={addRfidUid}
                      onChange={(e) => setAddRfidUid(e.target.value)}
                      placeholder="E280-1170-01"
                      className="flex-1 px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-400"
                    />
                    <button
                      type="button"
                      onClick={() => setAddRfidUid(generateRandomRfid())}
                      className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs"
                      title="Generate Acak"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Nomor WhatsApp Siswa
                  </label>
                  <input
                    type="text"
                    value={addPhone}
                    onChange={(e) => setAddPhone(e.target.value)}
                    placeholder="0812-3456-7890"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Email Siswa
                  </label>
                  <input
                    type="email"
                    value={addEmail}
                    onChange={(e) => setAddEmail(e.target.value)}
                    placeholder="nama.siswa@student.sch.id"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-slate-950 text-xs font-bold transition-all shadow-lg shadow-cyan-500/20"
                >
                  Simpan Anggota Baru
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL KONFIRMASI HAPUS ANGGOTA */}
      {/* ============================================================== */}
      {showDeleteModal && studentToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-md bg-[#0b1120] border border-red-500/40 rounded-3xl p-6 shadow-2xl shadow-red-950/50">
            <div className="w-12 h-12 rounded-2xl bg-red-950/80 border border-red-500/50 flex items-center justify-center text-red-300 mx-auto mb-4">
              <Trash2 className="w-6 h-6 text-red-400" />
            </div>

            <h3 className="text-lg font-bold text-white text-center mb-2">
              Hapus Data Anggota Ini?
            </h3>

            <p className="text-xs text-slate-300 text-center mb-4 leading-relaxed">
              Tindakan ini akan menghapus siswa <span className="font-bold text-white">"{studentToDelete.name}"</span> (NISN: {studentToDelete.nisn}) dari seluruh basis data anggota, riwayat cetak kartu, dan RFID lab komputer.
            </p>

            <div className="p-3 rounded-xl bg-red-950/30 border border-red-500/30 text-[11px] text-red-300 mb-6 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
              <span>Peringatan: Data yang telah dihapus tidak dapat dipulihkan kembali secara otomatis.</span>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowDeleteModal(false);
                  setStudentToDelete(null);
                }}
                className="flex-1 py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold transition-all"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="flex-1 py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition-all shadow-lg shadow-red-900/50"
              >
                Ya, Hapus Anggota
              </button>
            </div>
          </div>
        </div>
      )}

    </section>
  );
};
