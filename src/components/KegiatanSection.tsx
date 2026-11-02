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
  Trophy,
  Plus,
  Edit3,
  Trash2,
  ShieldCheck,
  Lock,
  X,
  AlertCircle
} from 'lucide-react';
import { ActivityEvent, AdminUser } from '../types';

interface KegiatanSectionProps {
  admin?: AdminUser;
  activities: ActivityEvent[];
  onAddActivity?: (activity: ActivityEvent) => void;
  onUpdateActivity?: (activity: ActivityEvent) => void;
  onDeleteActivity?: (id: string) => void;
  onOpenAdminModal?: () => void;
  onOpenJoinModal: () => void;
}

export const KegiatanSection: React.FC<KegiatanSectionProps> = ({ 
  admin,
  activities, 
  onAddActivity,
  onUpdateActivity,
  onDeleteActivity,
  onOpenAdminModal,
  onOpenJoinModal 
}) => {
  const [registeredIds, setRegisteredIds] = useState<string[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modal State for Add / Edit
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingActivity, setEditingActivity] = useState<ActivityEvent | null>(null);

  // Form Fields
  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState('Workshop');
  const [formStatus, setFormStatus] = useState<ActivityEvent['status']>('Mendatang');
  const [formDate, setFormDate] = useState('');
  const [formTime, setFormTime] = useState('');
  const [formLocation, setFormLocation] = useState('Lab Komputer 1 (Utama)');
  const [formSpeaker, setFormSpeaker] = useState('');
  const [formMaxParticipants, setFormMaxParticipants] = useState(30);
  const [formRegisteredCount, setFormRegisteredCount] = useState(0);
  const [formDescription, setFormDescription] = useState('');

  // Delete Confirmation Modal State
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deletingTitle, setDeletingTitle] = useState<string>('');

  const isTeacher = !!admin?.isAuthenticated;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleRegister = (id: string, title: string) => {
    if (registeredIds.includes(id)) return;
    setRegisteredIds((prev) => [...prev, id]);
    showToast(`Berhasil mendaftar ke kegiatan: "${title}". Notifikasi telah dikirim ke WA pembimbing.`);
  };

  const handleOpenAdd = () => {
    setEditingActivity(null);
    setFormTitle('');
    setFormCategory('Workshop');
    setFormStatus('Mendatang');
    setFormDate('28 Oktober 2026');
    setFormTime('13:30 - 15:30 WIB');
    setFormLocation('Lab Komputer 1 (Utama)');
    setFormSpeaker(admin?.name ? `${admin.name} (Pembina IT Club)` : 'Tim Pembina IT Club');
    setFormMaxParticipants(32);
    setFormRegisteredCount(0);
    setFormDescription('');
    setShowFormModal(true);
  };

  const handleOpenEdit = (act: ActivityEvent) => {
    setEditingActivity(act);
    setFormTitle(act.title);
    setFormCategory(act.category);
    setFormStatus(act.status);
    setFormDate(act.date);
    setFormTime(act.time);
    setFormLocation(act.location);
    setFormSpeaker(act.speaker);
    setFormMaxParticipants(act.maxParticipants);
    setFormRegisteredCount(act.registeredCount);
    setFormDescription(act.description);
    setShowFormModal(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    if (editingActivity) {
      const updated: ActivityEvent = {
        ...editingActivity,
        title: formTitle.trim(),
        category: formCategory.trim(),
        status: formStatus,
        date: formDate.trim(),
        time: formTime.trim(),
        location: formLocation.trim(),
        speaker: formSpeaker.trim(),
        maxParticipants: Number(formMaxParticipants) || 30,
        registeredCount: Number(formRegisteredCount) || 0,
        description: formDescription.trim(),
      };
      onUpdateActivity?.(updated);
      showToast(`Kegiatan "${updated.title}" berhasil diperbarui.`);
    } else {
      const newAct: ActivityEvent = {
        id: `act-${Date.now()}`,
        title: formTitle.trim(),
        category: formCategory.trim(),
        status: formStatus,
        date: formDate.trim(),
        time: formTime.trim(),
        location: formLocation.trim(),
        speaker: formSpeaker.trim(),
        maxParticipants: Number(formMaxParticipants) || 30,
        registeredCount: Number(formRegisteredCount) || 0,
        description: formDescription.trim(),
      };
      onAddActivity?.(newAct);
      showToast(`Kegiatan baru "${newAct.title}" berhasil ditambahkan.`);
    }

    setShowFormModal(false);
  };

  const handleConfirmDelete = () => {
    if (deletingId) {
      onDeleteActivity?.(deletingId);
      showToast(`Kegiatan "${deletingTitle}" berhasil dihapus.`);
      setDeletingId(null);
      setDeletingTitle('');
    }
  };

  return (
    <section className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      
      {/* Teacher vs Public Status Banner */}
      {isTeacher ? (
        <div className="mb-6 p-4 rounded-2xl bg-cyan-950/60 border border-cyan-500/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg shadow-cyan-950/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-cyan-300 uppercase tracking-wider font-mono">
                  Mode Kelola Guru Aktif
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-400 text-slate-950 font-bold">
                  Hak Akses Penuh
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Anda masuk sebagai <strong className="text-white">{admin?.name || 'Guru Pembina'}</strong>. Anda dapat menambah, mengedit, dan menghapus agenda kegiatan yang tersimpan di database server.
              </p>
            </div>
          </div>
          <button
            onClick={handleOpenAdd}
            className="w-full sm:w-auto px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-cyan-500/20 transition-all shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Kegiatan Baru</span>
          </button>
        </div>
      ) : (
        <div className="mb-6 p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-slate-400">
          <div className="flex items-center gap-2.5">
            <Lock className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>
              <strong className="text-slate-200">Mode Publik:</strong> Agenda kegiatan terbuka untuk seluruh siswa &amp; publik. Fitur tambah, edit, dan hapus kegiatan hanya dapat diakses oleh Guru / Pembimbing Lab.
            </span>
          </div>
          {onOpenAdminModal && (
            <button
              onClick={onOpenAdminModal}
              className="text-cyan-400 hover:text-cyan-300 font-semibold underline underline-offset-2 shrink-0 text-xs"
            >
              Masuk sebagai Guru
            </button>
          )}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs uppercase tracking-wider mb-2">
            <Trophy className="w-4 h-4" />
            <span>Agenda, Workshop &amp; Kompetisi Siswa</span>
          </div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">
            Kegiatan &amp; Workshop IT Club
          </h2>
          <p className="text-sm text-slate-400 mt-1 max-w-xl">
            Ikuti sesi coding maraton, workshop pictoblox, dan kompetisi internal laboratorium sekolah.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {isTeacher && (
            <button
              onClick={handleOpenAdd}
              className="px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold flex items-center gap-2 shadow-md shadow-cyan-500/20 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Kegiatan</span>
            </button>
          )}

          <button
            onClick={onOpenJoinModal}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-teal-400 to-cyan-400 text-slate-950 text-xs font-bold hover:opacity-95 shadow-md shadow-cyan-500/20"
          >
            Gabung Member IT Club
          </button>
        </div>
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="mb-6 p-4 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-200 text-xs flex items-center gap-3 animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Activities Grid */}
      {activities.length === 0 ? (
        <div className="text-center py-16 bg-[#0b1120] border border-slate-800 rounded-2xl p-8">
          <Trophy className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-300">Belum Ada Agenda Kegiatan</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
            Belum ada kegiatan yang terdaftar. Guru pembina dapat menambahkan agenda kegiatan baru kapan saja.
          </p>
          {isTeacher && (
            <button
              onClick={handleOpenAdd}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Kegiatan Sekarang</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {activities.map((act) => {
            const isRegistered = registeredIds.includes(act.id);
            const currentCount = act.registeredCount + (isRegistered ? 1 : 0);
            const isFull = currentCount >= act.maxParticipants;

            return (
              <div
                key={act.id}
                className="group rounded-2xl bg-[#0b1120] border border-slate-800 hover:border-cyan-500/40 p-6 shadow-xl transition-all flex flex-col justify-between relative overflow-hidden"
              >
                {/* Status indicator bar top border */}
                <div 
                  className={`absolute top-0 left-0 right-0 h-1 ${
                    act.status === 'Sedang Berlangsung'
                      ? 'bg-amber-400'
                      : act.status === 'Selesai'
                      ? 'bg-slate-600'
                      : 'bg-gradient-to-r from-cyan-400 to-teal-400'
                  }`}
                />

                <div>
                  {/* Category, Status & Teacher Action Buttons */}
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2.5 py-0.5 rounded text-[11px] font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-500/30">
                        {act.category}
                      </span>
                      <span className={`text-[11px] font-mono font-medium ${
                        act.status === 'Sedang Berlangsung'
                          ? 'text-amber-400'
                          : act.status === 'Selesai'
                          ? 'text-slate-500'
                          : 'text-emerald-400'
                      }`}>
                        ● {act.status}
                      </span>
                    </div>

                    {/* Teacher Action Buttons (Only visible if isTeacher) */}
                    {isTeacher && (
                      <div className="flex items-center gap-1.5 shrink-0 bg-slate-950/70 p-1 rounded-lg border border-slate-800">
                        <button
                          onClick={() => handleOpenEdit(act)}
                          title="Edit Kegiatan"
                          className="p-1.5 rounded-md text-slate-400 hover:text-cyan-400 hover:bg-cyan-950/50 transition-colors"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            setDeletingId(act.id);
                            setDeletingTitle(act.title);
                          }}
                          title="Hapus Kegiatan"
                          className="p-1.5 rounded-md text-slate-400 hover:text-rose-400 hover:bg-rose-950/50 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>

                  <h3 className="text-lg font-bold text-white mb-2 leading-snug group-hover:text-cyan-300 transition-colors">
                    {act.title}
                  </h3>

                  <p className="text-xs text-slate-400 leading-relaxed mb-5 line-clamp-3">
                    {act.description}
                  </p>

                  <div className="space-y-2 text-xs text-slate-300 mb-6 bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                      <span className="font-medium">{act.date}</span>
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
                        className="h-full bg-gradient-to-r from-cyan-400 to-teal-400 rounded-full transition-all duration-300"
                        style={{
                          width: `${Math.min(100, (currentCount / act.maxParticipants) * 100)}%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Public Registration Action */}
                  <button
                    onClick={() => handleRegister(act.id, act.title)}
                    disabled={isRegistered || isFull || act.status === 'Selesai'}
                    className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                      isRegistered
                        ? 'bg-emerald-950 border border-emerald-500/50 text-emerald-300'
                        : isFull
                        ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                        : act.status === 'Selesai'
                        ? 'bg-slate-800/80 text-slate-500 cursor-not-allowed'
                        : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-md shadow-cyan-500/20 active:scale-[0.98]'
                    }`}
                  >
                    {isRegistered ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>Sudah Terdaftar</span>
                      </>
                    ) : isFull ? (
                      <span>Kuota Penuh</span>
                    ) : act.status === 'Selesai' ? (
                      <span>Kegiatan Telah Berakhir</span>
                    ) : (
                      <>
                        <span>Ikuti Kegiatan Ini</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  {/* Quick Teacher Edit Hint */}
                  {isTeacher && (
                    <div className="mt-3 flex items-center justify-between text-[10px] text-slate-500 border-t border-slate-800/60 pt-2">
                      <span>ID: {act.id}</span>
                      <button 
                        onClick={() => handleOpenEdit(act)} 
                        className="text-cyan-400 hover:underline flex items-center gap-1"
                      >
                        <Edit3 className="w-3 h-3" /> Edit Detail
                      </button>
                    </div>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL FORM: TAMBAH / EDIT KEGIATAN (HANYA UNTUK GURU)   */}
      {/* ======================================================== */}
      {showFormModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#0f172a] border border-cyan-500/30 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 text-slate-100">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
                  {editingActivity ? <Edit3 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">
                    {editingActivity ? 'Edit Agenda Kegiatan' : 'Tambah Agenda Kegiatan Baru'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Perubahan akan langsung tersimpan di Cloud Firestore dan terlihat oleh publik.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowFormModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              {/* Judul Kegiatan */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Judul Kegiatan / Workshop <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="Contoh: Workshop Pemrograman C# & Game Development 2026"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
                />
              </div>

              {/* Kategori & Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Kategori Kegiatan
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white focus:outline-none focus:border-cyan-400"
                  >
                    <option value="Workshop">Workshop</option>
                    <option value="Kompetisi Internal">Kompetisi Internal</option>
                    <option value="Game Jam">Game Jam</option>
                    <option value="Bootcamp">Bootcamp</option>
                    <option value="Seminar IT">Seminar IT</option>
                    <option value="Sertifikasi">Sertifikasi</option>
                    <option value="Latihan LKS">Latihan LKS</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Status Kegiatan
                  </label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as ActivityEvent['status'])}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white focus:outline-none focus:border-cyan-400"
                  >
                    <option value="Mendatang">Mendatang</option>
                    <option value="Sedang Berlangsung">Sedang Berlangsung</option>
                    <option value="Selesai">Selesai</option>
                  </select>
                </div>
              </div>

              {/* Tanggal & Waktu */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Tanggal Pelaksanaan
                  </label>
                  <input
                    type="text"
                    required
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    placeholder="Contoh: 28 Oktober 2026"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Waktu / Jam
                  </label>
                  <input
                    type="text"
                    required
                    value={formTime}
                    onChange={(e) => setFormTime(e.target.value)}
                    placeholder="Contoh: 13:00 - 16:30 WIB"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white focus:outline-none focus:border-cyan-400 font-mono"
                  />
                </div>
              </div>

              {/* Lokasi & Pemateri */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Lokasi / Ruang Lab
                  </label>
                  <input
                    type="text"
                    required
                    value={formLocation}
                    onChange={(e) => setFormLocation(e.target.value)}
                    placeholder="Contoh: Lab Komputer 1 (Utama)"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Pemateri / Penanggung Jawab
                  </label>
                  <input
                    type="text"
                    required
                    value={formSpeaker}
                    onChange={(e) => setFormSpeaker(e.target.value)}
                    placeholder="Contoh: Dwi Ambal Aziz, S.Kom / Kak Arya"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              {/* Kuota & Terdaftar */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Kuota Maksimal Peserta (Kursi)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    required
                    value={formMaxParticipants}
                    onChange={(e) => setFormMaxParticipants(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white focus:outline-none focus:border-cyan-400 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Jumlah Peserta Terdaftar
                  </label>
                  <input
                    type="number"
                    min="0"
                    max={formMaxParticipants}
                    value={formRegisteredCount}
                    onChange={(e) => setFormRegisteredCount(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white focus:outline-none focus:border-cyan-400 font-mono"
                  />
                </div>
              </div>

              {/* Deskripsi */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Deskripsi Kegiatan
                </label>
                <textarea
                  rows={3}
                  required
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Jelaskan tujuan, materi yang akan dipelajari, dan persiapan yang dibutuhkan siswa..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowFormModal(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold shadow-md shadow-cyan-500/20 transition-all flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{editingActivity ? 'Simpan Perubahan' : 'Terbitkan Kegiatan'}</span>
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL KONFIRMASI HAPUS KEGIATAN                          */}
      {/* ======================================================== */}
      {deletingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#0f172a] border border-rose-500/30 rounded-2xl w-full max-w-md shadow-2xl p-6 text-slate-100">
            <div className="w-12 h-12 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 mx-auto mb-4">
              <AlertCircle className="w-6 h-6" />
            </div>
            
            <h3 className="text-lg font-bold text-white text-center mb-2">
              Hapus Agenda Kegiatan?
            </h3>
            
            <p className="text-xs text-slate-400 text-center mb-6 leading-relaxed">
              Apakah Anda yakin ingin menghapus kegiatan <strong className="text-white">"{deletingTitle}"</strong>? Kegiatan ini akan dihapus secara permanen dari Cloud Firestore server.
            </p>

            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setDeletingId(null);
                  setDeletingTitle('');
                }}
                className="w-1/2 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="w-1/2 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md shadow-rose-600/30 transition-all flex items-center justify-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                <span>Ya, Hapus</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </section>
  );
};
