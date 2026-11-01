import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { 
  CreditCard, 
  Printer, 
  Download, 
  Plus, 
  QrCode, 
  RotateCw, 
  CheckCircle2, 
  ShieldCheck, 
  Sparkles, 
  Radio, 
  Lock, 
  User, 
  Hash, 
  Layers,
  ArrowRight,
  Eye,
  Scissors,
  Check,
  FileText,
  AlertCircle,
  Camera,
  Upload,
  Image as ImageIcon,
  Trash2,
  Edit3,
  AlertTriangle
} from 'lucide-react';
import { Student, AdminUser, DivisionType } from '../types';
import { generateFrontCardImage, generateBackCardImage } from '../utils/cardCanvas';

interface CardStudioSectionProps {
  admin: AdminUser;
  students: Student[];
  onAddStudent: (newStudent: Student) => void;
  onUpdateStudent?: (updatedStudent: Student) => void;
  onDeleteStudent?: (studentId: string) => void;
  onOpenAdminModal: () => void;
}

export const CardStudioSection: React.FC<CardStudioSectionProps> = ({
  admin,
  students,
  onAddStudent,
  onUpdateStudent,
  onDeleteStudent,
  onOpenAdminModal,
}) => {
  const [selectedStudent, setSelectedStudent] = useState<Student>(students[0]);
  const [isFlipped, setIsFlipped] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [showNewCardModal, setShowNewCardModal] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [showEditCardModal, setShowEditCardModal] = useState(false);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);

  const [printLayout, setPrintLayout] = useState<'both' | 'front_only' | 'batch_all'>('both');
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  // New Student Form State
  const [newName, setNewName] = useState('');
  const [newNisn, setNewNisn] = useState('');
  const [newClass, setNewClass] = useState('X RPL 1');
  const [newDivision, setNewDivision] = useState<DivisionType>('Python Programming');
  const [newAvatarUrl, setNewAvatarUrl] = useState<string>(
    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=300&auto=format&fit=crop&q=80'
  );
  const [avatarTab, setAvatarTab] = useState<'upload' | 'presets' | 'url'>('upload');
  const [customUrlInput, setCustomUrlInput] = useState('');
  const newStudentFileRef = useRef<HTMLInputElement | null>(null);
  const changeCurrentStudentFileRef = useRef<HTMLInputElement | null>(null);

  // Edit Student Form State
  const [editStudentId, setEditStudentId] = useState('');
  const [editName, setEditName] = useState('');
  const [editNisn, setEditNisn] = useState('');
  const [editClass, setEditClass] = useState('');
  const [editDivision, setEditDivision] = useState<DivisionType>('Python Programming');
  const [editRfidUid, setEditRfidUid] = useState('');
  const [editStatus, setEditStatus] = useState<'Aktif' | 'Alumni' | 'Pengurus'>('Aktif');
  const [editPosition, setEditPosition] = useState('');
  const [editAvatarUrl, setEditAvatarUrl] = useState('');
  const [editAvatarTab, setEditAvatarTab] = useState<'upload' | 'presets' | 'url'>('upload');
  const [editCustomUrlInput, setEditCustomUrlInput] = useState('');
  const editStudentFileRef = useRef<HTMLInputElement | null>(null);

  // Keep selected student in sync when students prop changes
  useEffect(() => {
    if (students.length > 0) {
      if (!selectedStudent || !students.some((s) => s.id === selectedStudent.id)) {
        setSelectedStudent(students[0]);
      }
    } else {
      setSelectedStudent(null as unknown as Student);
    }
  }, [students]);

  const AVATAR_PRESETS = [
    { id: 'av-1', label: 'Siswa 1', url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=300&auto=format&fit=crop&q=80' },
    { id: 'av-2', label: 'Siswi 1', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80' },
    { id: 'av-3', label: 'Siswa 2', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80' },
    { id: 'av-4', label: 'Siswi 2', url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&auto=format&fit=crop&q=80' },
    { id: 'av-5', label: 'Siswa 3', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80' },
    { id: 'av-6', label: 'Siswi 3', url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&auto=format&fit=crop&q=80' },
  ];

  const handleImageFile = (file: File, target: 'selected' | 'new' | 'edit') => {
    if (!file.type.startsWith('image/')) {
      alert('Pilih file format gambar (JPG, PNG, WebP).');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('Ukuran gambar maksimal 5MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      if (target === 'selected' && selectedStudent) {
        const updated = { ...selectedStudent, avatarUrl: dataUrl };
        setSelectedStudent(updated);
        onUpdateStudent?.(updated);
        setDownloadSuccess(`Foto profil ${selectedStudent.name} berhasil diperbarui.`);
        setTimeout(() => setDownloadSuccess(null), 3500);
      } else if (target === 'edit') {
        setEditAvatarUrl(dataUrl);
      } else {
        setNewAvatarUrl(dataUrl);
      }
    };
    reader.readAsDataURL(file);
  };

  // Open Edit Card Modal
  const handleOpenEditModal = (student: Student) => {
    if (!admin.isAuthenticated) {
      onOpenAdminModal();
      return;
    }
    setEditStudentId(student.id);
    setEditName(student.name);
    setEditNisn(student.nisn);
    setEditClass(student.class);
    setEditDivision(student.division);
    setEditRfidUid(student.rfidUid);
    setEditStatus(student.status || 'Aktif');
    setEditPosition(student.position || '');
    setEditAvatarUrl(student.avatarUrl);
    setEditAvatarTab('upload');
    setEditCustomUrlInput('');
    setShowEditCardModal(true);
  };

  // Save Card Edits
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName || !editNisn || !editStudentId) return;

    const existingStudent = students.find((s) => s.id === editStudentId);
    if (!existingStudent) return;

    const updated: Student = {
      ...existingStudent,
      name: editName.trim(),
      nisn: editNisn.trim(),
      class: editClass.trim(),
      division: editDivision,
      rfidUid: editRfidUid.trim() || existingStudent.rfidUid,
      qrCodeData: `ITCLUB:${editNisn.trim()}:${editName.trim()}:${editClass.trim()}`,
      avatarUrl: editAvatarUrl || existingStudent.avatarUrl,
      status: editStatus,
      position: editPosition.trim() || undefined,
    };

    onUpdateStudent?.(updated);
    if (selectedStudent?.id === updated.id) {
      setSelectedStudent(updated);
    }
    setShowEditCardModal(false);
    setDownloadSuccess(`Data kartu anggota ${updated.name} berhasil diperbarui.`);
    setTimeout(() => setDownloadSuccess(null), 3500);
  };

  // Open Delete Confirmation Modal
  const handleOpenDeleteModal = (student: Student) => {
    if (!admin.isAuthenticated) {
      onOpenAdminModal();
      return;
    }
    setStudentToDelete(student);
    setShowDeleteConfirmModal(true);
  };

  // Execute Delete
  const handleConfirmDelete = () => {
    if (!studentToDelete) return;
    const deletedName = studentToDelete.name;
    const deletedId = studentToDelete.id;

    onDeleteStudent?.(deletedId);
    setShowDeleteConfirmModal(false);

    const remaining = students.filter((s) => s.id !== deletedId);
    if (remaining.length > 0) {
      setSelectedStudent(remaining[0]);
    } else {
      setSelectedStudent(null as unknown as Student);
    }

    setStudentToDelete(null);
    setDownloadSuccess(`Kartu anggota ${deletedName} berhasil dihapus.`);
    setTimeout(() => setDownloadSuccess(null), 3500);
  };

  // Generate QR Code when selected student changes
  useEffect(() => {
    if (selectedStudent) {
      QRCode.toDataURL(selectedStudent.qrCodeData, {
        width: 180,
        margin: 1,
        color: {
          dark: '#080c16',
          light: '#ffffff',
        },
      })
        .then((url) => setQrDataUrl(url))
        .catch((err) => console.error(err));
    }
  }, [selectedStudent]);

  // Robust Print Handler
  const handleTriggerPrint = (layout: 'both' | 'front_only' | 'batch_all' = 'both') => {
    setPrintLayout(layout);
    setShowPrintModal(true);
  };

  const executeBrowserPrint = () => {
    try {
      window.print();
    } catch (e) {
      console.warn('Iframe print restriction caught, providing alternative:', e);
      // Fallback: download PNG automatically
      handleDownloadCard('front');
    }
  };

  // Download High-Res PNG
  const handleDownloadCard = async (side: 'front' | 'back' | 'both') => {
    setIsDownloading(true);
    setDownloadSuccess(null);

    try {
      if (side === 'front' || side === 'both') {
        const frontUrl = await generateFrontCardImage(selectedStudent);
        const link = document.createElement('a');
        link.download = `Kartu_Depan_${selectedStudent.name.replace(/\s+/g, '_')}_${selectedStudent.nisn}.png`;
        link.href = frontUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }

      if (side === 'back' || side === 'both') {
        setTimeout(async () => {
          const backUrl = await generateBackCardImage(selectedStudent);
          const link = document.createElement('a');
          link.download = `Kartu_Belakang_${selectedStudent.name.replace(/\s+/g, '_')}_${selectedStudent.nisn}.png`;
          link.href = backUrl;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }, 300);
      }

      setDownloadSuccess(`Kartu digital ${selectedStudent.name} berhasil diunduh dalam format PNG beresolusi tinggi.`);
      setTimeout(() => setDownloadSuccess(null), 4000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleCreateStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newNisn) return;

    const randomUid = `${Math.floor(1000 + Math.random() * 9000).toString(16).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}-${(students.length + 1).toString().padStart(2, '0')}`;
    const newStudent: Student = {
      id: `std-${Date.now()}`,
      nisn: newNisn,
      name: newName,
      class: newClass,
      division: newDivision,
      rfidUid: randomUid,
      qrCodeData: `ITCLUB:${newNisn}:${newName}:${newClass}`,
      avatarUrl: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80`,
      email: `${newName.toLowerCase().replace(/\s+/g, '.')}@student.sch.id`,
      phone: '0812-3456-7890',
      joinedDate: new Date().toISOString().split('T')[0],
      status: 'Aktif',
    };

    onAddStudent(newStudent);
    setSelectedStudent(newStudent);
    setShowNewCardModal(false);
    setNewName('');
    setNewNisn('');
  };

  return (
    <section className="py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      
      {/* Notice if guest: Quick 1-click teacher login or demo mode */}
      {!admin.isAuthenticated && (
        <div className="mb-8 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-violet-950/70 via-slate-900 to-cyan-950/70 border border-violet-500/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-violet-900/60 border border-violet-500/40 text-violet-300">
              <Lock className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">
                Mode Pratinjau Guru (Portal Cetak Kartu)
              </h4>
              <p className="text-xs text-slate-300">
                Kamu dapat melihat pratinjau kartu dan mengunduh PNG. Masuk sebagai guru untuk menerbitkan, mengedit, atau menghapus kartu anggota.
              </p>
            </div>
          </div>

          <button
            onClick={onOpenAdminModal}
            className="self-start sm:self-auto px-4 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-600 text-white text-xs font-bold hover:opacity-95 shadow-lg shadow-violet-900/40 flex items-center gap-2 whitespace-nowrap"
          >
            <ShieldCheck className="w-4 h-4 text-cyan-300" />
            <span>Login Guru (Pak Dwi Ambal Aziz)</span>
          </button>
        </div>
      )}

      {/* Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-cyan-950/40 via-[#0b1120] to-violet-950/40 border border-cyan-500/30">
        <div>
          <div className="flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-cyan-400" />
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Studio Pembuat QR Code &amp; Cetak Kartu Anggota
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Format Standar Kartu Pintar Siswa CR80 (RFID 13.56MHz + Dynamic QR Code Sekolah)
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {admin.isAuthenticated && (
            <button
              onClick={() => setShowNewCardModal(true)}
              className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 text-slate-950 text-xs font-bold hover:opacity-90 transition-all shadow-md shadow-cyan-500/20"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Siswa Baru</span>
            </button>
          )}

          <button
            onClick={() => handleTriggerPrint('both')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold transition-all shadow-md shadow-cyan-500/30"
          >
            <Printer className="w-4 h-4" />
            <span>Lembar Cetak (Print Sheet)</span>
          </button>

          <button
            onClick={() => handleTriggerPrint('batch_all')}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-semibold transition-all"
          >
            <FileText className="w-4 h-4 text-teal-400" />
            <span>Cetak Masal (Semua)</span>
          </button>
        </div>
      </div>

      {/* Download Alert Toast */}
      {downloadSuccess && (
        <div className="mb-6 p-4 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-200 text-xs flex items-center gap-3 animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{downloadSuccess}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left: Student Selector List */}
        <div className="lg:col-span-4 space-y-4">
          <div className="rounded-2xl bg-[#0b1120] border border-slate-800 p-4">
            <h3 className="text-sm font-bold text-white mb-3 flex items-center justify-between">
              <span>Pilih Anggota IT Club ({students.length})</span>
              <span className="text-xs font-mono text-cyan-400">Siap Cetak</span>
            </h3>

            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
              {students.map((student) => {
                const isSelected = selectedStudent?.id === student.id;
                return (
                  <div
                    key={student.id}
                    className={`group/student relative w-full p-2.5 sm:p-3 rounded-xl border transition-all flex items-center justify-between gap-2 ${
                      isSelected
                        ? 'bg-cyan-950/60 border-cyan-500 text-white shadow-md shadow-cyan-950/50'
                        : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-800/60 hover:text-white'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedStudent(student);
                        setIsFlipped(false);
                      }}
                      className="flex items-center gap-3 min-w-0 flex-1 text-left cursor-pointer"
                    >
                      <img
                        src={student.avatarUrl}
                        alt={student.name}
                        className="w-10 h-10 rounded-lg object-cover border border-cyan-500/40 shrink-0"
                        referrerPolicy="no-referrer"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-bold truncate">{student.name}</div>
                        <div className="text-[11px] text-slate-400 font-mono truncate">
                          NISN: {student.nisn} · {student.division}
                        </div>
                        <div className="text-[10px] text-cyan-400 font-mono mt-0.5">
                          RFID: {student.rfidUid}
                        </div>
                      </div>
                    </button>

                    {/* Quick action buttons per card in list */}
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenEditModal(student);
                        }}
                        className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-amber-500/20 text-slate-400 hover:text-amber-300 border border-slate-700 hover:border-amber-500/40 transition-colors"
                        title="Edit data kartu siswa ini"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenDeleteModal(student);
                        }}
                        className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-red-500/20 text-slate-400 hover:text-red-300 border border-slate-700 hover:border-red-500/40 transition-colors"
                        title="Hapus kartu siswa ini"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}

              {students.length === 0 && (
                <div className="text-center py-8 px-4 rounded-xl border border-dashed border-slate-800 text-xs text-slate-500">
                  Belum ada data kartu. Klik tombol <span className="text-cyan-400 font-semibold">Tambah Siswa Baru</span> untuk mencetak kartu pertama.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right: Live Interactive Card Canvas & Controls */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Card Viewer Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsFlipped(!isFlipped)}
                disabled={!selectedStudent}
                className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-medium text-slate-200 transition-colors disabled:opacity-50"
              >
                <RotateCw className="w-3.5 h-3.5 text-cyan-400" />
                <span>Balik Kartu: {isFlipped ? 'Sisi Belakang' : 'Sisi Depan'}</span>
              </button>
            </div>

            {selectedStudent && (
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => handleOpenEditModal(selectedStudent)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-950/40 hover:bg-amber-900/60 border border-amber-500/40 text-xs font-medium text-amber-300 hover:text-white transition-colors"
                  title="Edit data kartu ini"
                >
                  <Edit3 className="w-3.5 h-3.5 text-amber-400" />
                  <span>Edit Kartu</span>
                </button>

                <button
                  onClick={() => handleOpenDeleteModal(selectedStudent)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/60 border border-red-500/40 text-xs font-medium text-red-300 hover:text-white transition-colors"
                  title="Hapus kartu ini"
                >
                  <Trash2 className="w-3.5 h-3.5 text-red-400" />
                  <span>Hapus</span>
                </button>

                <button
                  onClick={() => handleDownloadCard('front')}
                  disabled={isDownloading}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-cyan-500/40 text-xs font-medium text-cyan-300 hover:text-white transition-colors"
                  title="Unduh file PNG sisi depan"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Unduh Depan</span>
                </button>

                <button
                  onClick={() => handleDownloadCard('back')}
                  disabled={isDownloading}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-medium text-slate-300 hover:text-white transition-colors"
                  title="Unduh file PNG sisi belakang"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Unduh Belakang</span>
                </button>
              </div>
            )}
          </div>

          {/* MAIN INTERACTIVE CARD PREVIEW BOX */}
          <div className="flex flex-col items-center justify-center p-6 sm:p-10 rounded-3xl bg-slate-950/80 border border-slate-800/80">
            
            {/* PHYSICAL ID CARD MOCKUP */}
            <div className="relative w-full max-w-[480px] aspect-[1.586/1] rounded-2xl p-6 shadow-2xl transition-all duration-500 select-none overflow-hidden border border-cyan-500/40 bg-gradient-to-br from-[#0c1322] via-[#080d19] to-[#120e24]">
              
              {/* Card Holographic Watermark / Circuit Lines */}
              <div className="absolute -right-10 -bottom-10 w-60 h-60 bg-gradient-to-tl from-cyan-500/10 via-teal-500/5 to-transparent rounded-full blur-2xl pointer-events-none" />
              <div className="absolute top-0 right-0 w-32 h-32 bg-violet-600/10 blur-xl pointer-events-none" />

              {!isFlipped ? (
                /* ================= FRONT SIDE ================= */
                <div className="h-full flex flex-col justify-between relative z-10 text-white">
                  
                  {/* Card Header */}
                  <div className="flex items-start justify-between border-b border-cyan-500/30 pb-2.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-violet-600 p-[1px]">
                        <div className="w-full h-full bg-[#080c16] rounded-[7px] flex items-center justify-center">
                          <span className="font-mono font-bold text-xs text-cyan-300">&lt;/&gt;</span>
                        </div>
                      </div>
                      <div>
                        <h4 className="text-xs font-extrabold tracking-wider text-white uppercase">
                          KARTU ANGGOTA IT CLUB &amp; LAB
                        </h4>
                        <p className="text-[9px] font-mono text-cyan-300">
                         SMP LAB KOMPUTER TERPADU
                        </p>
                      </div>
                    </div>

                    {/* Hologram Badge */}
                    <div className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-gradient-to-r from-cyan-500/20 to-teal-500/20 text-teal-300 border border-cyan-400/40 shadow-sm">
                      TA 2026/2027
                    </div>
                  </div>

                  {/* Card Middle: Photo + Info + Smart Chip */}
                  <div className="flex items-center gap-4 my-auto">
                    
                    {/* Student Photo with Direct Upload */}
                    <div 
                      className="relative shrink-0 group/photo cursor-pointer"
                      onClick={() => changeCurrentStudentFileRef.current?.click()}
                      title="Klik untuk mengganti foto profil siswa ini"
                    >
                      <img
                        src={selectedStudent?.avatarUrl}
                        alt={selectedStudent?.name}
                        className="w-20 h-24 rounded-xl object-cover border-2 border-cyan-400/80 shadow-md transition-opacity group-hover/photo:opacity-75"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 rounded-xl bg-slate-950/70 opacity-0 group-hover/photo:opacity-100 flex flex-col items-center justify-center transition-opacity text-[9px] font-mono text-cyan-300">
                        <Camera className="w-4 h-4 mb-0.5 text-cyan-300" />
                        <span>Ganti Foto</span>
                      </div>
                      <div className="absolute -bottom-1.5 -right-1.5 w-6 h-6 rounded-md bg-slate-900 border border-teal-400 flex items-center justify-center">
                        <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" />
                      </div>
                    </div>

                    {/* Student Details */}
                    <div className="min-w-0 flex-1 space-y-1">
                      <h3 className="text-sm sm:text-base font-extrabold text-white truncate leading-tight">
                        {selectedStudent?.name}
                      </h3>
                      <div className="text-[11px] font-mono text-slate-300">
                        NISN: <span className="text-white font-bold">{selectedStudent?.nisn}</span>
                      </div>
                      <div className="text-[11px] text-slate-300">
                        Kelas: <span className="text-cyan-300">{selectedStudent?.class}</span>
                      </div>
                      
                      <div className="pt-1 flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-violet-950/80 text-violet-300 border border-violet-500/40">
                          {selectedStudent?.division}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {selectedStudent?.position || 'Anggota'}
                        </span>
                      </div>
                    </div>

                    {/* Embedded QR Code Canvas */}
                    <div className="shrink-0 flex flex-col items-center">
                      <div className="p-1.5 bg-white rounded-lg shadow-md border border-slate-300">
                        {qrDataUrl ? (
                          <img
                            src={qrDataUrl}
                            alt="QR Presensi"
                            className="w-16 h-16 sm:w-20 sm:h-20"
                          />
                        ) : (
                          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-slate-100 flex items-center justify-center">
                            <QrCode className="w-8 h-8 text-slate-400" />
                          </div>
                        )}
                      </div>
                      <span className="text-[8px] font-mono text-cyan-300 mt-1 uppercase">
                        Scan Presensi
                      </span>
                    </div>

                  </div>

                  {/* Card Bottom: RFID Chip Representation + UID */}
                  <div className="flex items-center justify-between border-t border-slate-800/80 pt-2 text-[10px] font-mono">
                    <div className="flex items-center gap-2">
                      {/* Metallic smart chip icon */}
                      <div className="w-6 h-4.5 rounded bg-amber-400/20 border border-amber-400/60 flex items-center justify-center">
                        <div className="w-4 h-2.5 border border-amber-300/60 grid grid-cols-2 gap-0.5 p-0.5">
                          <span className="bg-amber-400/40 rounded-[1px]" />
                          <span className="bg-amber-400/40 rounded-[1px]" />
                        </div>
                      </div>
                      <span className="text-slate-400">RFID:</span>
                      <span className="text-cyan-300 font-bold tracking-wider">{selectedStudent?.rfidUid}</span>
                    </div>

                    <div className="text-slate-400">
                      ID: #{selectedStudent?.id.toUpperCase()}
                    </div>
                  </div>

                </div>
              ) : (
                /* ================= BACK SIDE ================= */
                <div className="h-full flex flex-col justify-between relative z-10 text-white text-xs">
                  
                  <div>
                    <div className="flex items-center justify-between border-b border-cyan-500/20 pb-2 mb-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-300">
                        Tata Tertib Penggunaan Laboratorium Komputer
                      </span>
                      <Radio className="w-3.5 h-3.5 text-cyan-400" />
                    </div>

                    <ol className="text-[9px] sm:text-[10px] text-slate-300 space-y-1.5 list-decimal pl-4 leading-snug">
                      <li>Wajib melakukan tap kartu RFID / scan QR Code saat masuk dan keluar lab.</li>
                      <li>Dilarang keras membawa makanan, minuman, dan merubah kabel instalasi.</li>
                      <li>Gunakan workstation PC sesuai dengan penugasan instruktur guru.</li>
                      <li>Simpan file proyek di cloud/GitHub IT Club; dilarang memasang software bajakan.</li>
                    </ol>
                  </div>

                  {/* Barcode representation */}
                  <div className="bg-white p-2 rounded-lg flex flex-col items-center">
                    <div className="w-full h-7 flex items-center justify-between gap-[2px] overflow-hidden">
                      {Array.from({ length: 44 }).map((_, i) => (
                        <div
                          key={i}
                          className="bg-black h-full"
                          style={{
                            width: `${(i % 3 === 0 ? 3 : i % 2 === 0 ? 1 : 2)}px`,
                          }}
                        />
                      ))}
                    </div>
                    <span className="text-[8px] font-mono text-black font-bold tracking-widest mt-0.5">
                      {selectedStudent?.rfidUid} - {selectedStudent?.nisn}
                    </span>
                  </div>

                  {/* Signature Section */}
                  <div className="flex items-end justify-between border-t border-slate-800 pt-1.5 text-[9px]">
                    <div className="text-slate-400">
                      <div>Laboratorium Komputer Sekolah</div>
                      <div className="text-[8px] text-teal-400">Terdaftar Sistem Resmi 2026</div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-white">
                        {admin.isAuthenticated && admin.name ? admin.name : 'Dwi Ambal Aziz, S.Kom'}
                      </div>
                      <div className="text-[8px] text-slate-400">Pembina Lab &amp; IT Club</div>
                    </div>
                  </div>

                </div>
              )}

            </div>

            {/* Quick Action Buttons for currently selected card */}
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3 no-print">
              {/* Hidden file input for changing current student photo */}
              <input
                ref={changeCurrentStudentFileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleImageFile(file, 'selected');
                }}
              />

              {selectedStudent && (
                <>
                  <button
                    onClick={() => handleOpenEditModal(selectedStudent)}
                    className="px-4 py-2.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/50 text-amber-300 hover:text-amber-100 text-xs font-bold transition-all flex items-center gap-2 shadow-md shadow-amber-950/30"
                    title="Edit seluruh identitas dan data kartu siswa ini"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-amber-400" />
                    <span>Edit Data Kartu</span>
                  </button>

                  <button
                    onClick={() => handleOpenDeleteModal(selectedStudent)}
                    className="px-4 py-2.5 rounded-xl bg-red-500/15 hover:bg-red-500/25 border border-red-500/50 text-red-300 hover:text-red-100 text-xs font-bold transition-all flex items-center gap-2 shadow-md shadow-red-950/30"
                    title="Hapus kartu anggota ini dari sistem"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-red-400" />
                    <span>Hapus Kartu</span>
                  </button>

                  <button
                    onClick={() => changeCurrentStudentFileRef.current?.click()}
                    className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-cyan-500/40 text-xs font-semibold text-cyan-300 hover:text-white transition-all flex items-center gap-2"
                    title="Ganti foto profil siswa ini dari galeri / kamera"
                  >
                    <Camera className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Ganti Foto</span>
                  </button>
                </>
              )}

              <button
                onClick={() => setIsFlipped(!isFlipped)}
                disabled={!selectedStudent}
                className="px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs font-semibold text-slate-200 hover:text-white transition-all flex items-center gap-2 disabled:opacity-50"
              >
                <RotateCw className="w-3.5 h-3.5 text-cyan-400" />
                <span>Balik Kartu ({isFlipped ? 'Sisi Depan' : 'Sisi Belakang'})</span>
              </button>

              <button
                onClick={() => handleTriggerPrint('both')}
                disabled={!selectedStudent}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 to-teal-400 text-slate-950 text-xs font-bold hover:opacity-95 transition-all shadow-md shadow-cyan-500/20 flex items-center gap-2 disabled:opacity-50"
              >
                <Printer className="w-3.5 h-3.5 text-slate-950" />
                <span>Buka Lembar Cetak</span>
              </button>

              <button
                onClick={() => handleDownloadCard('both')}
                disabled={isDownloading || !selectedStudent}
                className="px-4 py-2.5 rounded-xl bg-slate-900 border border-cyan-500/40 text-cyan-300 hover:text-white text-xs font-semibold transition-all flex items-center gap-2 disabled:opacity-50"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Unduh Sisi Depan &amp; Belakang (PNG)</span>
              </button>
            </div>

          </div>

        </div>

      </div>

      {/* FULL PRINT PREVIEW & SHEET MODAL */}
      {showPrintModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/90 backdrop-blur-md animate-fadeIn overflow-y-auto">
          <div className="relative w-full max-w-4xl rounded-2xl bg-[#0b1120] border border-cyan-500/40 p-4 sm:p-6 shadow-2xl my-auto">
            
            {/* Modal Header Controls (Hidden when printed via .no-print) */}
            <div className="no-print flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-slate-800 gap-3">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Printer className="w-5 h-5 text-cyan-400" />
                  <span>Pratinjau Lembar Siap Cetak (A4 Standard)</span>
                </h3>
                <p className="text-xs text-slate-400">
                  {printLayout === 'batch_all' 
                    ? `Mencetak seluruh anggota (${students.length} Siswa)` 
                    : `Mencetak Kartu Siswa: ${selectedStudent.name}`}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={executeBrowserPrint}
                  className="px-5 py-2.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 text-xs font-bold flex items-center gap-2 shadow-lg shadow-cyan-400/20"
                >
                  <Printer className="w-4 h-4 text-slate-950" />
                  <span>Cetak Dokumen Sekarang (Ctrl+P)</span>
                </button>

                <button
                  onClick={() => handleDownloadCard('both')}
                  className="px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 hover:text-white text-xs font-semibold flex items-center gap-2"
                >
                  <Download className="w-4 h-4 text-cyan-400" />
                  <span>Unduh PNG</span>
                </button>

                <button
                  onClick={() => setShowPrintModal(false)}
                  className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  Tutup
                </button>
              </div>
            </div>

            {/* Print Tips info banner */}
            <div className="no-print mb-4 p-3 rounded-xl bg-cyan-950/40 border border-cyan-500/30 text-xs text-cyan-200 flex items-start gap-2">
              <Scissors className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <span>
                <strong>Petunjuk Cetak:</strong> Di jendela print printer, aktifkan centang <strong>"Background graphics / Grafis latar belakang"</strong> dan atur skala ke <strong>100%</strong> agar warna kartu navy dan chip RFID tercetak presisi.
              </span>
            </div>

            {/* THE PRINTABLE SHEET CANVAS */}
            <div id="printable-card-area" className="bg-slate-100 dark:bg-slate-950 p-4 sm:p-8 rounded-xl border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white">
              
              {/* LAYOUT: SINGLE STUDENT BOTH SIDES (FRONT + BACK) */}
              {printLayout === 'both' && (
                <div>
                  <div className="text-center mb-4 text-xs font-mono text-slate-500 uppercase tracking-widest no-print">
                    ✂ Garis Potong Standard ID Card CR80 (85.6mm × 53.98mm)
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center justify-center">
                    
                    {/* SISI DEPAN */}
                    <div className="space-y-1.5">
                      <span className="text-[11px] font-mono font-bold text-slate-400 block text-center no-print">
                        [SISI DEPAN]
                      </span>
                      <div className="print-card-box relative w-full aspect-[1.586/1] rounded-2xl p-5 shadow-lg border border-cyan-500/40 bg-gradient-to-br from-[#0c1322] via-[#080d19] to-[#120e24] text-white flex flex-col justify-between overflow-hidden">
                        
                        {/* Header */}
                        <div className="flex items-start justify-between border-b border-cyan-500/30 pb-2">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-md bg-[#080c16] border border-cyan-400 flex items-center justify-center font-mono font-bold text-xs text-cyan-300">
                              &lt;/&gt;
                            </div>
                            <div>
                              <h4 className="text-[11px] font-extrabold tracking-wider uppercase">
                                KARTU ANGGOTA IT CLUB
                              </h4>
                              <p className="text-[8px] font-mono text-cyan-300">
                                LAB KOMPUTER SEKOLAH
                              </p>
                            </div>
                          </div>
                          <span className="text-[8px] font-mono px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/30">
                            2026/2027
                          </span>
                        </div>

                        {/* Middle */}
                        <div className="flex items-center gap-3 my-auto">
                          <img
                            src={selectedStudent.avatarUrl}
                            alt={selectedStudent.name}
                            className="w-16 h-20 rounded-lg object-cover border border-cyan-400 shadow-sm"
                            referrerPolicy="no-referrer"
                          />
                          <div className="min-w-0 flex-1 space-y-0.5">
                            <h3 className="text-xs font-extrabold text-white truncate">
                              {selectedStudent.name}
                            </h3>
                            <div className="text-[10px] font-mono text-slate-300">
                              NISN: {selectedStudent.nisn}
                            </div>
                            <div className="text-[10px] text-slate-300">
                              Kelas: {selectedStudent.class}
                            </div>
                            <div className="text-[9px] text-cyan-300 font-semibold pt-0.5">
                              Divisi: {selectedStudent.division}
                            </div>
                          </div>

                          {/* QR */}
                          <div className="p-1 bg-white rounded-md shrink-0">
                            {qrDataUrl && (
                              <img src={qrDataUrl} alt="QR" className="w-14 h-14" />
                            )}
                          </div>
                        </div>

                        {/* Footer */}
                        <div className="flex items-center justify-between border-t border-slate-800 pt-1.5 text-[9px] font-mono">
                          <span className="text-cyan-300 font-bold">RFID: {selectedStudent.rfidUid}</span>
                          <span className="text-slate-400">ID: #{selectedStudent.id.toUpperCase()}</span>
                        </div>

                      </div>
                    </div>

                    {/* SISI BELAKANG */}
                    <div className="space-y-1.5">
                      <span className="text-[11px] font-mono font-bold text-slate-400 block text-center no-print">
                        [SISI BELAKANG]
                      </span>
                      <div className="print-card-box relative w-full aspect-[1.586/1] rounded-2xl p-5 shadow-lg border border-cyan-500/40 bg-gradient-to-br from-[#0c1322] via-[#080d19] to-[#120e24] text-white flex flex-col justify-between overflow-hidden">
                        
                        <div>
                          <div className="text-[9px] font-bold text-cyan-300 uppercase border-b border-cyan-500/30 pb-1 mb-1.5">
                            TATA TERTIB LAB KOMPUTER
                          </div>
                          <ol className="text-[8px] text-slate-300 space-y-1 list-decimal pl-3.5">
                            <li>Wajib tap RFID / scan QR Code saat masuk dan keluar.</li>
                            <li>Dilarang membawa makanan &amp; minuman ke dalam lab.</li>
                            <li>Menjaga kebersihan meja dan merapikan workstation.</li>
                            <li>Dilarang merubah konfigurasi sistem tanpa izin guru.</li>
                          </ol>
                        </div>

                        {/* Barcode line representation */}
                        <div className="bg-white p-1 rounded flex flex-col items-center">
                          <div className="w-full h-5 flex items-center justify-between gap-[2px]">
                            {Array.from({ length: 36 }).map((_, i) => (
                              <div
                                key={i}
                                className="bg-black h-full"
                                style={{ width: `${(i % 3 === 0 ? 3 : 1)}px` }}
                              />
                            ))}
                          </div>
                          <span className="text-[7px] font-mono text-black font-bold tracking-widest">
                            {selectedStudent.rfidUid} - {selectedStudent.nisn}
                          </span>
                        </div>

                        <div className="flex items-end justify-between border-t border-slate-800 pt-1 text-[8px]">
                          <span className="text-slate-400">Laboratorium Komputer Sekolah</span>
                          <div className="text-right">
                            <div className="font-semibold text-white">
                              {admin.isAuthenticated && admin.name ? admin.name : 'Dwi Ambal Aziz, S.Kom'}
                            </div>
                            <div className="text-slate-400">Pembina Lab</div>
                          </div>
                        </div>

                      </div>
                    </div>

                  </div>
                </div>
              )}

              {/* LAYOUT: BATCH PRINT ALL STUDENTS */}
              {printLayout === 'batch_all' && (
                <div className="space-y-4">
                  <div className="text-center text-xs font-mono text-slate-500 mb-2 no-print">
                    Lembar Cetak Masal Kartu Anggota IT Club (Grid 2 Kolom)
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {students.map((std) => (
                      <div
                        key={std.id}
                        className="print-card-box rounded-xl p-4 border border-cyan-500/40 bg-[#080d1a] text-white flex items-center gap-3"
                      >
                        <img
                          src={std.avatarUrl}
                          alt={std.name}
                          className="w-14 h-18 rounded-lg object-cover border border-cyan-400 shrink-0"
                          referrerPolicy="no-referrer"
                        />
                        <div className="min-w-0 flex-1 space-y-0.5">
                          <div className="text-xs font-bold text-white truncate">{std.name}</div>
                          <div className="text-[10px] font-mono text-slate-300">NISN: {std.nisn}</div>
                          <div className="text-[10px] text-cyan-300">{std.class} · {std.division}</div>
                          <div className="text-[9px] font-mono text-teal-400 pt-1">RFID: {std.rfidUid}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>

          </div>
        </div>
      )}

      {/* MODAL: DAFTAR & BUAT KARTU SISWA BARU */}
      {showNewCardModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="relative w-full max-w-lg rounded-2xl bg-[#0b1120] border border-cyan-500/40 p-6 sm:p-8 shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-2">
              Daftarkan Anggota Baru &amp; Cetak Kartu
            </h3>
            <p className="text-xs text-slate-400 mb-6">
              Sistem akan membuat UID RFID dan QR Code presensi secara otomatis.
            </p>

            <form onSubmit={handleCreateStudent} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Nama Lengkap Siswa
                </label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Contoh: Raditya Gilang Perkasa"
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              {/* Foto Profil Kartu Siswa */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Camera className="w-3.5 h-3.5 text-cyan-400" />
                    Foto Profil Siswa
                  </span>
                  <span className="text-[10px] text-cyan-400 font-mono">Standar Kartu CR80 (3:4)</span>
                </label>

                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                  <div className="flex items-start gap-3.5">
                    {/* Thumbnail preview */}
                    <div className="relative w-16 h-20 rounded-xl overflow-hidden border-2 border-cyan-400/80 bg-slate-900 shrink-0 shadow-md">
                      <img
                        src={newAvatarUrl}
                        alt="Pratinjau Foto"
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Controls */}
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-1 p-0.5 bg-slate-900 rounded-lg border border-slate-800 text-[11px]">
                        <button
                          type="button"
                          onClick={() => setAvatarTab('upload')}
                          className={`flex-1 py-1 px-2 rounded-md font-medium transition-all flex items-center justify-center gap-1 ${
                            avatarTab === 'upload' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          <Upload className="w-3 h-3" />
                          Unggah File
                        </button>
                        <button
                          type="button"
                          onClick={() => setAvatarTab('presets')}
                          className={`flex-1 py-1 px-2 rounded-md font-medium transition-all flex items-center justify-center gap-1 ${
                            avatarTab === 'presets' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          <User className="w-3 h-3" />
                          Avatar Siap
                        </button>
                        <button
                          type="button"
                          onClick={() => setAvatarTab('url')}
                          className={`flex-1 py-1 px-2 rounded-md font-medium transition-all flex items-center justify-center gap-1 ${
                            avatarTab === 'url' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          <ImageIcon className="w-3 h-3" />
                          Link URL
                        </button>
                      </div>

                      {avatarTab === 'upload' && (
                        <div>
                          <input
                            ref={newStudentFileRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleImageFile(file, 'new');
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => newStudentFileRef.current?.click()}
                            className="w-full py-2 px-3 rounded-xl border border-dashed border-cyan-500/60 hover:border-cyan-400 bg-cyan-950/20 hover:bg-cyan-950/40 text-cyan-300 hover:text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all"
                          >
                            <Upload className="w-4 h-4 text-cyan-400" />
                            <span>Pilih File Foto (PNG, JPG, WebP)</span>
                          </button>
                        </div>
                      )}

                      {avatarTab === 'presets' && (
                        <div className="flex items-center gap-2 overflow-x-auto pb-1">
                          {AVATAR_PRESETS.map((p) => (
                            <button
                              key={p.id}
                              type="button"
                              onClick={() => setNewAvatarUrl(p.url)}
                              className={`relative w-9 h-9 rounded-lg overflow-hidden border-2 shrink-0 transition-transform ${
                                newAvatarUrl === p.url ? 'border-cyan-400 scale-105 shadow-md' : 'border-slate-800 opacity-60 hover:opacity-100'
                              }`}
                              title={p.label}
                            >
                              <img src={p.url} alt={p.label} className="w-full h-full object-cover" />
                            </button>
                          ))}
                        </div>
                      )}

                      {avatarTab === 'url' && (
                        <div className="flex gap-2">
                          <input
                            type="url"
                            value={customUrlInput}
                            onChange={(e) => setCustomUrlInput(e.target.value)}
                            placeholder="https://domain.com/foto-siswa.jpg"
                            className="flex-1 px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-400 font-mono"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              if (customUrlInput.trim()) {
                                setNewAvatarUrl(customUrlInput.trim());
                              }
                            }}
                            className="px-3 py-1.5 rounded-lg bg-cyan-500 text-slate-950 font-bold text-xs hover:bg-cyan-400"
                          >
                            Terapkan
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    NISN (Nomor Induk)
                  </label>
                  <input
                    type="text"
                    value={newNisn}
                    onChange={(e) => setNewNisn(e.target.value)}
                    placeholder="Contoh: 0092837162"
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
                    value={newClass}
                    onChange={(e) => setNewClass(e.target.value)}
                    placeholder="Contoh: X RPL 2"
                    required
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Divisi Spesialisasi IT Club
                </label>
                <select
                  value={newDivision}
                  onChange={(e) => setNewDivision(e.target.value as DivisionType)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-400"
                >
                  <option value="Python Programming">Python Programming (AI, Data &amp; Otomasi)</option>
                  <option value="C# .NET">C# .NET (Software Engineering)</option>
                  <option value="Scratch">Scratch (Game &amp; Logic)</option>
                  <option value="Desain Grafis">Desain Grafis &amp; UI/UX</option>
                  <option value="Jaringan Komputer">Jaringan Komputer &amp; Server</option>
                </select>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowNewCardModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-teal-400 to-cyan-400 text-slate-950 text-xs font-bold hover:opacity-95 shadow-md shadow-cyan-500/20"
                >
                  Simpan &amp; Generate Kartu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT DATA KARTU SISWA */}
      {showEditCardModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-fadeIn">
          <div className="relative w-full max-w-lg rounded-2xl bg-[#0b1120] border border-amber-500/40 p-6 sm:p-8 shadow-2xl my-auto">
            
            {/* Ambient Glow */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-amber-500/10 blur-3xl pointer-events-none rounded-full" />
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-cyan-500/10 blur-3xl pointer-events-none rounded-full" />

            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-amber-950/80 border border-amber-500/40 text-amber-300">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white tracking-tight">
                    Edit Data Kartu Anggota
                  </h3>
                  <p className="text-xs text-slate-400">
                    Perbarui identitas, nomor RFID, atau foto profil kartu siswa
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Nama Lengkap Siswa
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Nama Lengkap Siswa"
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              {/* Foto Profil Kartu Siswa */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Camera className="w-3.5 h-3.5 text-cyan-400" />
                    Foto Profil Siswa
                  </span>
                  <span className="text-[10px] text-cyan-400 font-mono">Standar Kartu CR80 (3:4)</span>
                </label>

                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                  <div className="flex items-start gap-3.5">
                    {/* Thumbnail preview */}
                    <div className="relative w-16 h-20 rounded-xl overflow-hidden border-2 border-cyan-400/80 bg-slate-900 shrink-0 shadow-md">
                      <img
                        src={editAvatarUrl}
                        alt="Pratinjau Foto"
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Controls */}
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-1 p-0.5 bg-slate-900 rounded-lg border border-slate-800 text-[11px]">
                        <button
                          type="button"
                          onClick={() => setEditAvatarTab('upload')}
                          className={`flex-1 py-1 px-2 rounded-md font-medium transition-all flex items-center justify-center gap-1 ${
                            editAvatarTab === 'upload' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          <Upload className="w-3 h-3" />
                          Unggah
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditAvatarTab('presets')}
                          className={`flex-1 py-1 px-2 rounded-md font-medium transition-all flex items-center justify-center gap-1 ${
                            editAvatarTab === 'presets' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          <User className="w-3 h-3" />
                          Avatar Siap
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditAvatarTab('url')}
                          className={`flex-1 py-1 px-2 rounded-md font-medium transition-all flex items-center justify-center gap-1 ${
                            editAvatarTab === 'url' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          <ImageIcon className="w-3 h-3" />
                          Link URL
                        </button>
                      </div>

                      {editAvatarTab === 'upload' && (
                        <div>
                          <input
                            ref={editStudentFileRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleImageFile(file, 'edit');
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => editStudentFileRef.current?.click()}
                            className="w-full py-2 px-3 rounded-xl border border-dashed border-cyan-500/60 hover:border-cyan-400 bg-cyan-950/20 hover:bg-cyan-950/40 text-cyan-300 hover:text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all"
                          >
                            <Upload className="w-4 h-4 text-cyan-400" />
                            <span>Pilih File Foto Baru</span>
                          </button>
                        </div>
                      )}

                      {editAvatarTab === 'presets' && (
                        <div className="flex items-center gap-2 overflow-x-auto pb-1">
                          {AVATAR_PRESETS.map((p) => (
                            <button
                              key={p.id}
                              type="button"
                              onClick={() => setEditAvatarUrl(p.url)}
                              className={`relative w-9 h-9 rounded-lg overflow-hidden border-2 shrink-0 transition-transform ${
                                editAvatarUrl === p.url ? 'border-cyan-400 scale-105 shadow-md' : 'border-slate-800 opacity-60 hover:opacity-100'
                              }`}
                              title={p.label}
                            >
                              <img src={p.url} alt={p.label} className="w-full h-full object-cover" />
                            </button>
                          ))}
                        </div>
                      )}

                      {editAvatarTab === 'url' && (
                        <div className="flex gap-2">
                          <input
                            type="url"
                            value={editCustomUrlInput}
                            onChange={(e) => setEditCustomUrlInput(e.target.value)}
                            placeholder="https://domain.com/foto.jpg"
                            className="flex-1 px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-400 font-mono"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              if (editCustomUrlInput.trim()) {
                                setEditAvatarUrl(editCustomUrlInput.trim());
                              }
                            }}
                            className="px-3 py-1.5 rounded-lg bg-cyan-500 text-slate-950 font-bold text-xs hover:bg-cyan-400"
                          >
                            Terapkan
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    NISN (Nomor Induk)
                  </label>
                  <input
                    type="text"
                    value={editNisn}
                    onChange={(e) => setEditNisn(e.target.value)}
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
                    value={editClass}
                    onChange={(e) => setEditClass(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Divisi Spesialisasi IT Club
                  </label>
                  <select
                    value={editDivision}
                    onChange={(e) => setEditDivision(e.target.value as DivisionType)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-400"
                  >
                    <option value="Python Programming">Python Programming (AI, Data &amp; Otomasi)</option>
                    <option value="C# .NET">C# .NET (Software Engineering)</option>
                    <option value="Scratch">Scratch (Game &amp; Logic)</option>
                    <option value="Desain Grafis">Desain Grafis &amp; UI/UX</option>
                    <option value="Jaringan Komputer">Jaringan Komputer &amp; Server</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Status Keanggotaan
                  </label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as 'Aktif' | 'Alumni' | 'Pengurus')}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-400"
                  >
                    <option value="Aktif">Aktif</option>
                    <option value="Pengurus">Pengurus</option>
                    <option value="Alumni">Alumni</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Jabatan / Posisi
                  </label>
                  <input
                    type="text"
                    value={editPosition}
                    onChange={(e) => setEditPosition(e.target.value)}
                    placeholder="Contoh: Anggota, Ketua, dll."
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center justify-between">
                    <span>UID Kartu RFID</span>
                    <button
                      type="button"
                      onClick={() => {
                        const newUid = `${Math.floor(1000 + Math.random() * 9000).toString(16).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(10 + Math.random() * 89)}`;
                        setEditRfidUid(newUid);
                      }}
                      className="text-[10px] text-cyan-400 hover:text-cyan-300 underline font-mono"
                      title="Generate UID Kartu Baru"
                    >
                      Acak UID
                    </button>
                  </label>
                  <input
                    type="text"
                    value={editRfidUid}
                    onChange={(e) => setEditRfidUid(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm font-mono text-cyan-300 focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowEditCardModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-teal-400 to-cyan-400 text-slate-950 text-xs font-bold hover:opacity-95 shadow-md shadow-amber-500/20 flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4 text-slate-950" />
                  <span>Simpan Perubahan</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: KONFIRMASI HAPUS KARTU SISWA */}
      {showDeleteConfirmModal && studentToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-md rounded-2xl bg-[#0b1120] border border-red-500/50 p-6 sm:p-7 shadow-2xl shadow-red-950/50 overflow-hidden">
            
            {/* Ambient Red Glow */}
            <div className="absolute top-0 right-0 w-36 h-36 bg-red-600/15 blur-3xl pointer-events-none rounded-full" />

            <div className="flex items-start gap-3.5 mb-5">
              <div className="p-3 rounded-xl bg-red-950/80 border border-red-500/50 text-red-400 shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white tracking-tight">
                  Hapus Kartu Anggota?
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Tindakan ini akan menghapus kartu dari daftar sistem
                </p>
              </div>
            </div>

            {/* Student Preview Box */}
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-3.5 mb-5">
              <img
                src={studentToDelete.avatarUrl}
                alt={studentToDelete.name}
                className="w-12 h-14 rounded-lg object-cover border border-slate-700 shrink-0"
              />
              <div className="min-w-0 flex-1">
                <div className="text-sm font-bold text-white truncate">
                  {studentToDelete.name}
                </div>
                <div className="text-xs font-mono text-slate-400 truncate">
                  NISN: {studentToDelete.nisn} · {studentToDelete.class}
                </div>
                <div className="text-[11px] font-mono text-cyan-400 mt-0.5">
                  UID RFID: {studentToDelete.rfidUid}
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed mb-6 bg-red-950/30 p-3 rounded-xl border border-red-900/40">
              Apakah Anda yakin ingin menghapus kartu anggota atas nama <strong className="text-white">{studentToDelete.name}</strong>? Kartu fisik RFID dan kode QR terkait tidak akan dapat lagi digunakan untuk absensi kehadiran di Lab Komputer.
            </p>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowDeleteConfirmModal(false);
                  setStudentToDelete(null);
                }}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-slate-900 border border-slate-800"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition-all shadow-lg shadow-red-950/60 flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                <span>Ya, Hapus Kartu</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </section>
  );
};
