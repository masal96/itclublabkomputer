import React, { useState, useEffect, useMemo } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  User,
  Users,
  CheckCircle2,
  ArrowRight,
  Trophy,
  Plus,
  Edit3,
  Trash2,
  ShieldCheck,
  Lock,
  X,
  AlertCircle,
  MessageCircle,
  Mail,
  Send,
  Copy,
  Check,
  Settings,
  ClipboardList,
  ExternalLink,
  Phone,
} from 'lucide-react';
import { ActivityEvent, ActivityRegistration, AdminUser } from '../types';
import {
  CoachContactConfig,
  getCoachContactFromFirestore,
  saveCoachContactToFirestore,
  saveActivityRegistrationToFirestore,
  subscribeToActivityRegistrations,
  deleteActivityRegistrationFromFirestore,
} from '../services/firebase';
import {
  DEFAULT_COACH_EMAIL,
  DEFAULT_COACH_NAME,
  DEFAULT_COACH_WHATSAPP,
  generateActivityRegistrationWhatsAppMessage,
  getCoachEmailMailtoUrl,
  getWhatsAppConfig,
  getWhatsAppDirectUrl,
  sendActivityRegistrationToCoachWA,
} from '../utils/whatsapp';

const REGISTERED_STORAGE_KEY = 'itclub_registered_activities';
const COACH_CONTACT_STORAGE_KEY = 'itclub_coach_contact';

interface KegiatanSectionProps {
  admin?: AdminUser;
  activities: ActivityEvent[];
  onAddActivity?: (activity: ActivityEvent) => void;
  onUpdateActivity?: (activity: ActivityEvent) => void;
  onDeleteActivity?: (id: string) => void;
  onOpenAdminModal?: () => void;
  onOpenJoinModal: () => void;
}

interface RegistrationSuccessResult {
  registration: ActivityRegistration;
  activity: ActivityEvent;
  waUrl: string;
  emailUrl: string;
  messageText: string;
  statusNote: string;
  autoSentViaGateway: boolean;
}

export const KegiatanSection: React.FC<KegiatanSectionProps> = ({
  admin,
  activities,
  onAddActivity,
  onUpdateActivity,
  onDeleteActivity,
  onOpenAdminModal,
  onOpenJoinModal,
}) => {
  const [registeredIds, setRegisteredIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(REGISTERED_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [coachContact, setCoachContact] = useState<CoachContactConfig>(() => {
    try {
      const saved = localStorage.getItem(COACH_CONTACT_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          coachName: parsed.coachName || DEFAULT_COACH_NAME,
          coachWhatsapp: parsed.coachWhatsapp || DEFAULT_COACH_WHATSAPP,
          coachEmail: parsed.coachEmail || DEFAULT_COACH_EMAIL,
        };
      }
    } catch {}
    return {
      coachName: DEFAULT_COACH_NAME,
      coachWhatsapp: DEFAULT_COACH_WHATSAPP,
      coachEmail: DEFAULT_COACH_EMAIL,
    };
  });

  const [registrations, setRegistrations] = useState<ActivityRegistration[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Public Registration Modal State
  const [registerModalActivity, setRegisterModalActivity] = useState<ActivityEvent | null>(null);
  const [regName, setRegName] = useState('');
  const [regClass, setRegClass] = useState('');
  const [regWhatsapp, setRegWhatsapp] = useState('');
  const [regReason, setRegReason] = useState('');
  const [regChannel, setRegChannel] = useState<'whatsapp' | 'email'>('whatsapp');
  const [regError, setRegError] = useState<string | null>(null);
  const [regSubmitting, setRegSubmitting] = useState(false);
  const [regSuccessResult, setRegSuccessResult] = useState<RegistrationSuccessResult | null>(null);
  const [copiedSuccessMsg, setCopiedSuccessMsg] = useState(false);

  // Teacher Modals: Registrants List & Coach Contact Settings
  const [showRegistrantsModal, setShowRegistrantsModal] = useState(false);
  const [registrantFilterActivityId, setRegistrantFilterActivityId] = useState<string>('ALL');
  const [confirmDeleteRegId, setConfirmDeleteRegId] = useState<string | null>(null);

  const [showCoachContactModal, setShowCoachContactModal] = useState(false);
  const [editCoachName, setEditCoachName] = useState(coachContact.coachName);
  const [editCoachWa, setEditCoachWa] = useState(coachContact.coachWhatsapp);
  const [editCoachEmail, setEditCoachEmail] = useState(coachContact.coachEmail);
  const [savingCoachContact, setSavingCoachContact] = useState(false);

  // Modal State for Add / Edit Activity (Teacher)
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingActivity, setEditingActivity] = useState<ActivityEvent | null>(null);

  // Form Fields (Teacher Add/Edit Activity)
  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState('Workshop');
  const [formStatus, setFormStatus] = useState<ActivityEvent['status']>('Mendatang');
  const [formDate, setFormDate] = useState('');
  const [formTime, setFormTime] = useState('');
  const [formLocation, setFormLocation] = useState('Lab Komputer');
  const [formSpeaker, setFormSpeaker] = useState('');
  const [formMaxParticipants, setFormMaxParticipants] = useState(30);
  const [formRegisteredCount, setFormRegisteredCount] = useState(0);
  const [formDescription, setFormDescription] = useState('');

  // Delete Confirmation Modal State (Activity)
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deletingTitle, setDeletingTitle] = useState<string>('');

  const isTeacher = !!admin?.isAuthenticated;

  // Load coach contact from Firestore & subscribe to registrations
  useEffect(() => {
    let mounted = true;
    getCoachContactFromFirestore().then((remote) => {
      if (mounted && remote) {
        setCoachContact(remote);
        setEditCoachName(remote.coachName);
        setEditCoachWa(remote.coachWhatsapp);
        setEditCoachEmail(remote.coachEmail);
        try {
          localStorage.setItem(COACH_CONTACT_STORAGE_KEY, JSON.stringify(remote));
        } catch {}
      }
    });

    const unsub = subscribeToActivityRegistrations((list) => {
      if (mounted) {
        setRegistrations(list);
      }
    });

    return () => {
      mounted = false;
      unsub();
    };
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 5000);
  };

  const persistRegisteredIds = (ids: string[]) => {
    try {
      localStorage.setItem(REGISTERED_STORAGE_KEY, JSON.stringify(ids));
    } catch {}
  };

  const handleOpenRegisterModal = (act: ActivityEvent) => {
    setRegisterModalActivity(act);
    setRegName('');
    setRegClass('');
    setRegWhatsapp('');
    setRegReason('');
    setRegChannel('whatsapp');
    setRegError(null);
    setRegSuccessResult(null);
    setCopiedSuccessMsg(false);
  };

  const triggerSafeLinkClick = (url: string, newTab: boolean) => {
    try {
      if (newTab) {
        const win = window.open(url, '_blank', 'noopener,noreferrer');
        if (win) {
          win.focus();
          return;
        }
      }
      const anchor = document.createElement('a');
      anchor.href = url;
      if (newTab) {
        anchor.target = '_blank';
        anchor.rel = 'noopener noreferrer';
      }
      anchor.style.display = 'none';
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
    } catch {
      // Fallback button remains visible inside confirmation modal
    }
  };

  const handleSubmitRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!registerModalActivity) return;

    const cleanName = regName.trim();
    const cleanClass = regClass.trim();
    const cleanWa = regWhatsapp.trim();
    const cleanReason = regReason.trim();
    const numericDigits = cleanWa.replace(/\D/g, '');

    if (!cleanName || cleanName.length < 2) {
      setRegError('Mohon isi Nama Lengkap Anda terlebih dahulu.');
      return;
    }
    if (!cleanClass) {
      setRegError('Mohon isi Kelas Anda (contoh: VIII A atau IX C).');
      return;
    }
    if (numericDigits.length < 8) {
      setRegError('Mohon masukkan Nomor WhatsApp aktif yang valid (minimal 8 digit).');
      return;
    }
    if (cleanReason.length < 5) {
      setRegError('Mohon tuliskan alasan singkat Anda mengikuti kegiatan ini.');
      return;
    }

    setRegError(null);
    setRegSubmitting(true);

    const newReg: ActivityRegistration = {
      id: `actreg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      activityId: registerModalActivity.id,
      activityTitle: registerModalActivity.title,
      participantName: cleanName,
      participantClass: cleanClass,
      participantWhatsapp: cleanWa,
      reason: cleanReason,
      preferredChannel: regChannel,
      createdAt: new Date().toISOString(),
    };

    try {
      await saveActivityRegistrationToFirestore(newReg);

      const nextRegistered = Array.from(new Set([...registeredIds, registerModalActivity.id]));
      setRegisteredIds(nextRegistered);
      persistRegisteredIds(nextRegistered);

      // Update kuota terdaftar pada kegiatan
      const updatedActivity: ActivityEvent = {
        ...registerModalActivity,
        registeredCount: Math.min(
          registerModalActivity.maxParticipants,
          (registerModalActivity.registeredCount || 0) + 1
        ),
      };
      onUpdateActivity?.(updatedActivity);

      const messageText = generateActivityRegistrationWhatsAppMessage(newReg, registerModalActivity);
      const emailUrl = getCoachEmailMailtoUrl(coachContact.coachEmail, newReg, registerModalActivity);
      const waConfig = getWhatsAppConfig();
      const waResult = await sendActivityRegistrationToCoachWA(
        newReg,
        registerModalActivity,
        coachContact.coachWhatsapp,
        waConfig
      );

      let statusNote = '';
      if (regChannel === 'whatsapp') {
        if (waResult.method === 'gateway' && waResult.success) {
          statusNote = waResult.message;
        } else {
          statusNote = `Data tersimpan! Mengarahkan ke WhatsApp Pembina (${coachContact.coachWhatsapp}). Jika belum terbuka, klik tombol "Buka WhatsApp Pembina" di bawah.`;
          triggerSafeLinkClick(waResult.url, true);
        }
      } else {
        statusNote = `Data tersimpan! Mengarahkan ke Email Pembina (${coachContact.coachEmail}). Jika aplikasi email tidak terbuka otomatis, klik tombol "Kirim via Email Pembina" di bawah.`;
        triggerSafeLinkClick(emailUrl, false);
      }

      setRegSuccessResult({
        registration: newReg,
        activity: updatedActivity,
        waUrl: waResult.url,
        emailUrl,
        messageText,
        statusNote,
        autoSentViaGateway: waResult.method === 'gateway' && waResult.success,
      });

      showToast(
        `Pendaftaran "${registerModalActivity.title}" atas nama ${cleanName} berhasil disimpan & diteruskan ke Pembina.`
      );
    } catch (err) {
      console.error('Error submitting activity registration:', err);
      setRegError('Gagal menyimpan pendaftaran ke server. Silakan periksa koneksi internet dan coba lagi.');
    } finally {
      setRegSubmitting(false);
    }
  };

  const handleCopyRegistrationText = async () => {
    if (!regSuccessResult) return;
    try {
      await navigator.clipboard.writeText(regSuccessResult.messageText);
      setCopiedSuccessMsg(true);
      setTimeout(() => setCopiedSuccessMsg(false), 2500);
    } catch {}
  };

  const handleSaveCoachContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editCoachWa.trim() || !editCoachEmail.trim()) return;
    setSavingCoachContact(true);
    const updated: CoachContactConfig = {
      coachName: editCoachName.trim() || DEFAULT_COACH_NAME,
      coachWhatsapp: editCoachWa.trim(),
      coachEmail: editCoachEmail.trim(),
    };
    try {
      await saveCoachContactToFirestore(updated);
      setCoachContact(updated);
      try {
        localStorage.setItem(COACH_CONTACT_STORAGE_KEY, JSON.stringify(updated));
      } catch {}
      setShowCoachContactModal(false);
      showToast('Kontak WhatsApp & Email Pembina berhasil diperbarui untuk semua pendaftar.');
    } catch {
      showToast('Gagal menyimpan kontak Pembina ke server.');
    } finally {
      setSavingCoachContact(false);
    }
  };

  const handleDeleteRegistrant = async (id: string) => {
    try {
      await deleteActivityRegistrationFromFirestore(id);
      setConfirmDeleteRegId(null);
      showToast('Data pendaftar kegiatan berhasil dihapus.');
    } catch {
      showToast('Gagal menghapus data pendaftar.');
    }
  };

  const filteredRegistrations = useMemo(() => {
    if (registrantFilterActivityId === 'ALL') return registrations;
    return registrations.filter((r) => r.activityId === registrantFilterActivityId);
  }, [registrations, registrantFilterActivityId]);

  const handleOpenAdd = () => {
    setEditingActivity(null);
    setFormTitle('');
    setFormCategory('Workshop');
    setFormStatus('Mendatang');
    setFormDate('28 Oktober 2026');
    setFormTime('13:30 - 15:30 WIB');
    setFormLocation('Lab Komputer');
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
        <div className="mb-6 p-4 rounded-2xl bg-cyan-950/60 border border-cyan-500/40 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3 shadow-lg shadow-cyan-950/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold text-cyan-300 uppercase tracking-wider font-mono">
                  Mode Kelola Guru Aktif
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-400 text-slate-950 font-bold">
                  Hak Akses Penuh
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Anda masuk sebagai <strong className="text-white">{admin?.name || 'Guru Pembina'}</strong>. Kelola agenda kegiatan, pantau pendaftar masuk, serta atur WA &amp; Email tujuan pembina.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
            <button
              onClick={() => setShowRegistrantsModal(true)}
              className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-cyan-500/40 text-cyan-300 text-xs font-semibold flex items-center gap-2 transition-all"
            >
              <ClipboardList className="w-4 h-4" />
              <span>Pendaftar ({registrations.length})</span>
            </button>

            <button
              onClick={() => {
                setEditCoachName(coachContact.coachName);
                setEditCoachWa(coachContact.coachWhatsapp);
                setEditCoachEmail(coachContact.coachEmail);
                setShowCoachContactModal(true);
              }}
              className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-2 transition-all"
            >
              <Settings className="w-4 h-4 text-teal-400" />
              <span>Kontak Pembina</span>
            </button>

            <button
              onClick={handleOpenAdd}
              className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-cyan-500/20 transition-all shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Kegiatan Baru</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="mb-6 p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-slate-400">
          <div className="flex items-center gap-2.5">
            <Lock className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>
              <strong className="text-slate-200">Mode Publik:</strong> Klik{' '}
              <strong className="text-cyan-300">Ikuti Kegiatan Ini</strong> untuk mengisi formulir pendaftaran yang langsung terhubung ke WhatsApp &amp; Email Pembina IT Club.
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
            const currentCount = act.registeredCount;
            const isFull = currentCount >= act.maxParticipants;
            const activityRegistrantsCount = registrations.filter((r) => r.activityId === act.id).length;

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
                      <span
                        className={`text-[11px] font-mono font-medium ${
                          act.status === 'Sedang Berlangsung'
                            ? 'text-amber-400'
                            : act.status === 'Selesai'
                            ? 'text-slate-500'
                            : 'text-emerald-400'
                        }`}
                      >
                        ● {act.status}
                      </span>
                    </div>

                    {/* Teacher Action Buttons */}
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
                  {isRegistered ? (
                    <div className="space-y-2">
                      <div className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-emerald-950 border border-emerald-500/50 text-emerald-300 flex items-center justify-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>Sudah Terdaftar</span>
                      </div>
                      {!isFull && act.status !== 'Selesai' && (
                        <button
                          type="button"
                          onClick={() => handleOpenRegisterModal(act)}
                          className="w-full py-1.5 text-[11px] font-medium text-cyan-400 hover:text-cyan-300 underline underline-offset-2"
                        >
                          Daftarkan peserta lain / kirim ulang ke Pembina
                        </button>
                      )}
                    </div>
                  ) : (
                    <button
                      onClick={() => handleOpenRegisterModal(act)}
                      disabled={isFull || act.status === 'Selesai'}
                      className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                        isFull
                          ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                          : act.status === 'Selesai'
                          ? 'bg-slate-800/80 text-slate-500 cursor-not-allowed'
                          : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-md shadow-cyan-500/20 active:scale-[0.98]'
                      }`}
                    >
                      {isFull ? (
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
                  )}

                  {/* Quick Teacher Footer Info */}
                  {isTeacher && (
                    <div className="mt-3 flex items-center justify-between text-[10px] text-slate-500 border-t border-slate-800/60 pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          setRegistrantFilterActivityId(act.id);
                          setShowRegistrantsModal(true);
                        }}
                        className="text-teal-400 hover:underline flex items-center gap-1"
                      >
                        <Users className="w-3 h-3" /> {activityRegistrantsCount} Pendaftar Form
                      </button>
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

      {/* ================================================================= */}
      {/* MODAL FORM PENDAFTARAN KEGIATAN (NAMA, KELAS, NO WA, ALASAN)      */}
      {/* TERHUBUNG KE WHATSAPP / EMAIL PEMBINA                              */}
      {/* ================================================================= */}
      {registerModalActivity && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#0f172a] border border-cyan-500/30 rounded-2xl w-full max-w-lg max-h-[92vh] overflow-y-auto shadow-2xl p-6 text-slate-100">
            <div className="flex items-start justify-between border-b border-slate-800 pb-4 mb-5 gap-3">
              <div>
                <span className="inline-block px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 mb-1.5">
                  {regSuccessResult ? 'PENDAFTARAN TERKIRIM' : 'FORMULIR KEGIATAN'}
                </span>
                <h3 className="text-lg font-bold text-white leading-snug">
                  {registerModalActivity.title}
                </h3>
                <p className="text-xs text-slate-400 mt-1 flex items-center gap-2 flex-wrap">
                  <span>{registerModalActivity.date}</span>
                  <span>•</span>
                  <span>{registerModalActivity.time}</span>
                  <span>•</span>
                  <span>{registerModalActivity.location}</span>
                </p>
              </div>
              <button
                onClick={() => setRegisterModalActivity(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {!regSuccessResult ? (
              <form onSubmit={handleSubmitRegistration} className="space-y-4">
                {regError && (
                  <div className="p-3 rounded-xl bg-rose-950/70 border border-rose-500/40 text-rose-200 text-xs flex items-start gap-2.5">
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    <span>{regError}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Nama Lengkap <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="Contoh: Muhammad Rizky Pratama"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Kelas <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={regClass}
                      onChange={(e) => setRegClass(e.target.value)}
                      placeholder="Contoh: VIII A / IX C"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      No. WhatsApp <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      value={regWhatsapp}
                      onChange={(e) => setRegWhatsapp(e.target.value)}
                      placeholder="Contoh: 0857xxxxxxxx"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Alasan Mengikuti Kegiatan Ini <span className="text-rose-400">*</span>
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={regReason}
                    onChange={(e) => setRegReason(e.target.value)}
                    placeholder="Tuliskan motivasi atau apa yang ingin Anda pelajari di kegiatan ini..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
                  />
                </div>

                {/* Pilihan Koneksi ke Pembina */}
                <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-200">
                      Hubungkan Pendaftaran ke Pembina ({coachContact.coachName}):
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={() => setRegChannel('whatsapp')}
                      className={`p-3 rounded-xl border text-left transition-all flex items-start gap-2.5 ${
                        regChannel === 'whatsapp'
                          ? 'bg-emerald-950/60 border-emerald-500 text-emerald-100'
                          : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <MessageCircle
                        className={`w-4 h-4 mt-0.5 shrink-0 ${
                          regChannel === 'whatsapp' ? 'text-emerald-400' : 'text-slate-500'
                        }`}
                      />
                      <div className="min-w-0">
                        <div className="text-xs font-bold">WhatsApp Pembina</div>
                        <div className="text-[11px] font-mono text-slate-400 truncate">
                          {coachContact.coachWhatsapp}
                        </div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setRegChannel('email')}
                      className={`p-3 rounded-xl border text-left transition-all flex items-start gap-2.5 ${
                        regChannel === 'email'
                          ? 'bg-cyan-950/60 border-cyan-500 text-cyan-100'
                          : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <Mail
                        className={`w-4 h-4 mt-0.5 shrink-0 ${
                          regChannel === 'email' ? 'text-cyan-400' : 'text-slate-500'
                        }`}
                      />
                      <div className="min-w-0">
                        <div className="text-xs font-bold">Email Pembina</div>
                        <div className="text-[11px] font-mono text-slate-400 truncate">
                          {coachContact.coachEmail}
                        </div>
                      </div>
                    </button>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setRegisterModalActivity(null)}
                    className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={regSubmitting}
                    className={`px-5 py-2.5 rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-2 ${
                      regChannel === 'whatsapp'
                        ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/20'
                        : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-cyan-500/20'
                    } disabled:opacity-60`}
                  >
                    <Send className="w-4 h-4" />
                    <span>
                      {regSubmitting
                        ? 'Menyimpan...'
                        : regChannel === 'whatsapp'
                        ? 'Daftar & Kirim via WhatsApp'
                        : 'Daftar & Kirim via Email'}
                    </span>
                  </button>
                </div>
              </form>
            ) : (
              /* Confirmation View after submitting */
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-500/40 flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div className="text-xs text-emerald-100 leading-relaxed">
                    <div className="font-bold text-sm text-emerald-300 mb-1">
                      Pendaftaran Berhasil Disimpan!
                    </div>
                    <p>{regSuccessResult.statusNote}</p>
                  </div>
                </div>

                {/* Summary of Submitted Data */}
                <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-xs space-y-1.5">
                  <div className="flex justify-between gap-2">
                    <span className="text-slate-400">Nama:</span>
                    <span className="font-semibold text-white">{regSuccessResult.registration.participantName}</span>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span className="text-slate-400">Kelas:</span>
                    <span className="font-semibold text-white">{regSuccessResult.registration.participantClass}</span>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span className="text-slate-400">No. WhatsApp:</span>
                    <span className="font-mono text-cyan-300">{regSuccessResult.registration.participantWhatsapp}</span>
                  </div>
                  <div className="pt-1 border-t border-slate-800">
                    <span className="text-slate-400 block mb-0.5">Alasan:</span>
                    <p className="text-slate-200 italic">"{regSuccessResult.registration.reason}"</p>
                  </div>
                </div>

                {/* Direct Action Buttons to WhatsApp & Email Pembina */}
                <div className="space-y-2.5">
                  <a
                    href={regSuccessResult.waUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-emerald-500/20 transition-all"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Buka WhatsApp Pembina ({coachContact.coachWhatsapp})</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>

                  <a
                    href={regSuccessResult.emailUrl}
                    className="w-full py-2.5 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-cyan-500/20 transition-all"
                  >
                    <Mail className="w-4 h-4" />
                    <span>Kirim via Email Pembina ({coachContact.coachEmail})</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>

                  <button
                    type="button"
                    onClick={handleCopyRegistrationText}
                    className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-2 transition-all"
                  >
                    {copiedSuccessMsg ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-400" />
                        <span className="text-emerald-300">Pesan Pendaftaran Disalin!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>Salin Isi Pesan Pendaftaran</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="pt-2 border-t border-slate-800 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setRegisterModalActivity(null)}
                    className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-white"
                  >
                    Selesai &amp; Tutup
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* MODAL PENGATURAN KONTAK PEMBINA (KHUSUS GURU)                     */}
      {/* ================================================================= */}
      {showCoachContactModal && isTeacher && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#0f172a] border border-cyan-500/30 rounded-2xl w-full max-w-md shadow-2xl p-6 text-slate-100">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-400">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Kontak Tujuan Pembina</h3>
                  <p className="text-[11px] text-slate-400">
                    Tujuan WhatsApp &amp; Email saat siswa mendaftar kegiatan.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowCoachContactModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCoachContact} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Nama Pembina
                </label>
                <input
                  type="text"
                  required
                  value={editCoachName}
                  onChange={(e) => setEditCoachName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Nomor WhatsApp Pembina <span className="text-rose-400">*</span>
                </label>
                <input
                  type="tel"
                  required
                  value={editCoachWa}
                  onChange={(e) => setEditCoachWa(e.target.value)}
                  placeholder="085731731051"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white font-mono focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Email Pembina <span className="text-rose-400">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={editCoachEmail}
                  onChange={(e) => setEditCoachEmail(e.target.value)}
                  placeholder="dwiambalaziz@gmail.com"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowCoachContactModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={savingCoachContact}
                  className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold flex items-center gap-2 disabled:opacity-60"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{savingCoachContact ? 'Menyimpan...' : 'Simpan Kontak'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* MODAL DAFTAR PENDAFTAR KEGIATAN (KHUSUS GURU)                     */}
      {/* ================================================================= */}
      {showRegistrantsModal && isTeacher && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#0f172a] border border-cyan-500/30 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl text-slate-100">
            <div className="flex items-center justify-between border-b border-slate-800 p-5 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
                  <ClipboardList className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    Daftar Pendaftar Kegiatan ({filteredRegistrations.length})
                  </h3>
                  <p className="text-xs text-slate-400">
                    Data siswa atau peserta yang mengisi formulir "Ikuti Kegiatan".
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowRegistrantsModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="px-5 pt-4 pb-2 shrink-0">
              <select
                value={registrantFilterActivityId}
                onChange={(e) => setRegistrantFilterActivityId(e.target.value)}
                className="w-full sm:w-80 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-400"
              >
                <option value="ALL">Semua Kegiatan ({registrations.length})</option>
                {activities.map((act) => (
                  <option key={act.id} value={act.id}>
                    {act.title} ({registrations.filter((r) => r.activityId === act.id).length})
                  </option>
                ))}
              </select>
            </div>

            <div className="p-5 overflow-y-auto space-y-3 flex-1">
              {filteredRegistrations.length === 0 ? (
                <div className="text-center py-12 bg-slate-900/60 border border-slate-800 rounded-xl">
                  <Users className="w-10 h-10 text-slate-600 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-slate-300">Belum Ada Pendaftar</p>
                  <p className="text-xs text-slate-500 mt-1">
                    Pendaftar yang mengisi form kegiatan akan langsung muncul di sini.
                  </p>
                </div>
              ) : (
                filteredRegistrations.map((reg) => (
                  <div
                    key={reg.id}
                    className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col sm:flex-row sm:items-start justify-between gap-3"
                  >
                    <div className="space-y-1.5 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm text-white">{reg.participantName}</span>
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-cyan-300 text-[10px] font-mono">
                          Kelas {reg.participantClass}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-mono ${
                            reg.preferredChannel === 'email'
                              ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/30'
                              : 'bg-emerald-950 text-emerald-300 border border-emerald-500/30'
                          }`}
                        >
                          Via {reg.preferredChannel === 'email' ? 'Email' : 'WhatsApp'}
                        </span>
                      </div>

                      <div className="text-xs text-cyan-400 font-medium">{reg.activityTitle}</div>

                      <div className="text-xs text-slate-300 flex items-center gap-3 flex-wrap">
                        <span className="font-mono">WA: {reg.participantWhatsapp}</span>
                        <span className="text-slate-500">•</span>
                        <span className="text-slate-400">
                          {new Date(reg.createdAt).toLocaleString('id-ID', {
                            dateStyle: 'medium',
                            timeStyle: 'short',
                          })}
                        </span>
                      </div>

                      <p className="text-xs text-slate-400 bg-slate-950/70 p-2.5 rounded-lg border border-slate-800/80 italic">
                        "{reg.reason}"
                      </p>
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-end gap-2 shrink-0">
                      <a
                        href={getWhatsAppDirectUrl(
                          reg.participantWhatsapp,
                          `Halo ${reg.participantName}, terima kasih sudah mendaftar kegiatan "${reg.activityTitle}" di IT Club Lab Komputer.`
                        )}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 text-emerald-300 text-[11px] font-semibold flex items-center gap-1.5"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>Hubungi WA</span>
                      </a>

                      {confirmDeleteRegId === reg.id ? (
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleDeleteRegistrant(reg.id)}
                            className="px-2.5 py-1 rounded-lg bg-rose-600 text-white text-[10px] font-bold"
                          >
                            Hapus
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteRegId(null)}
                            className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 text-[10px]"
                          >
                            Batal
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteRegId(reg.id)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-950/50 transition-colors"
                          title="Hapus Pendaftar"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
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
                    placeholder="Contoh: Lab Komputer"
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
              Apakah Anda yakin ingin menghapus kegiatan{' '}
              <strong className="text-white">"{deletingTitle}"</strong>? Kegiatan ini akan dihapus secara permanen dari Cloud Firestore server.
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
