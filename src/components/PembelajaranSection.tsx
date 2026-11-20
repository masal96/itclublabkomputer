import React, { useState } from 'react';
import {
  BookOpen,
  Code,
  Terminal,
  CheckCircle2,
  Download,
  Play,
  ChevronRight,
  Monitor,
  Cpu,
  X,
  Copy,
  Check,
  Plus,
  Edit3,
  Trash2,
  Video,
  Send,
  ExternalLink,
  ClipboardCheck,
  Award,
} from 'lucide-react';
import { AdminUser, DivisionType, LearningModule, TaskSubmission } from '../types';

interface PembelajaranSectionProps {
  admin: AdminUser;
  modules: LearningModule[];
  submissions: TaskSubmission[];
  onSaveModule: (mod: LearningModule) => Promise<void> | void;
  onDeleteModule: (id: string) => Promise<void> | void;
  onSaveSubmission: (sub: TaskSubmission) => Promise<void> | void;
  onDeleteSubmission: (id: string) => Promise<void> | void;
  onNavigateToPenilaian?: () => void;
}

const DIVISIONS: DivisionType[] = [
  'C# .NET',
  'Python Programming',
  'Scratch/Pictoblox',
  'Desain Grafis',
  'Robotika & IoT',
];

export const PembelajaranSection: React.FC<PembelajaranSectionProps> = ({
  admin,
  modules,
  submissions,
  onSaveModule,
  onDeleteModule,
  onSaveSubmission,
  onDeleteSubmission,
  onNavigateToPenilaian,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'modul' | 'tugas'>('modul');
  const [activeModule, setActiveModule] = useState<LearningModule | null>(null);
  const [copied, setCopied] = useState(false);

  // Module CRUD modal state
  const [showModuleModal, setShowModuleModal] = useState(false);
  const [editingMod, setEditingMod] = useState<LearningModule | null>(null);
  const [title, setTitle] = useState('');
  const [track, setTrack] = useState<DivisionType>('C# .NET');
  const [level, setLevel] = useState<LearningModule['level']>('Dasar');
  const [duration, setDuration] = useState('6 Minggu');
  const [lessons, setLessons] = useState(8);
  const [description, setDescription] = useState('');
  const [syllabusText, setSyllabusText] = useState('');
  const [pdfUrl, setPdfUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [starterCode, setStarterCode] = useState('');
  const [starterLanguage, setStarterLanguage] = useState('csharp');

  // Student task submission modal state
  const [submitTargetModule, setSubmitTargetModule] = useState<LearningModule | null>(null);
  const [subName, setSubName] = useState('');
  const [subNis, setSubNis] = useState('');
  const [subClass, setSubClass] = useState('');
  const [subUrl, setSubUrl] = useState('');
  const [subNotes, setSubNotes] = useState('');
  const [subSuccess, setSubSuccess] = useState<string | null>(null);
  const [subError, setSubError] = useState<string | null>(null);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const openAddModule = () => {
    setEditingMod(null);
    setTitle('');
    setTrack('C# .NET');
    setLevel('Dasar');
    setDuration('6 Minggu');
    setLessons(8);
    setDescription('');
    setSyllabusText('Pengenalan dasar & instalasi tools\nPraktik proyek mini pertama\nEvaluasi & presentasi karya');
    setPdfUrl('');
    setVideoUrl('');
    setStarterCode('');
    setStarterLanguage('csharp');
    setShowModuleModal(true);
  };

  const openEditModule = (mod: LearningModule) => {
    setEditingMod(mod);
    setTitle(mod.title);
    setTrack(mod.track);
    setLevel(mod.level);
    setDuration(mod.duration);
    setLessons(mod.lessons);
    setDescription(mod.description);
    setSyllabusText((mod.syllabus || []).join('\n'));
    setPdfUrl(mod.pdfUrl || '');
    setVideoUrl(mod.videoUrl || '');
    setStarterCode(mod.starterCode || '');
    setStarterLanguage(mod.starterLanguage || 'csharp');
    setShowModuleModal(true);
  };

  const handleSaveModuleForm = async (e: React.FormEvent) => {
    e.preventDefault();
    const syllabus = syllabusText
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);

    const payload: LearningModule = {
      id: editingMod ? editingMod.id : `mod-${Date.now()}`,
      title: title.trim(),
      track,
      level,
      duration: duration.trim() || '6 Minggu',
      lessons: Math.max(1, Number(lessons) || 6),
      description: description.trim(),
      syllabus: syllabus.length > 0 ? syllabus : ['Materi inti & praktik laboratorium'],
      pdfUrl: pdfUrl.trim() || undefined,
      videoUrl: videoUrl.trim() || undefined,
      starterCode: starterCode.trim() || undefined,
      starterLanguage: starterLanguage.trim() || undefined,
      updatedAt: new Date().toISOString(),
    };
    await onSaveModule(payload);
    setShowModuleModal(false);
  };

  const handleSubmitTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!submitTargetModule) return;
    setSubError(null);

    const trimmedUrl = subUrl.trim();
    if (!/^https?:\/\//i.test(trimmedUrl)) {
      setSubError('Tautan proyek/tugas wajib diawali https:// atau http://');
      return;
    }

    const newSub: TaskSubmission = {
      id: `sub-${Date.now()}`,
      moduleId: submitTargetModule.id,
      moduleTitle: submitTargetModule.title,
      studentName: subName.trim(),
      nisn: subNis.trim(),
      studentClass: subClass.trim(),
      division: submitTargetModule.track,
      projectUrl: trimmedUrl,
      notes: subNotes.trim(),
      status: 'Menunggu',
      submittedAt: new Date().toISOString(),
    };

    await onSaveSubmission(newSub);
    setSubSuccess(`Tugas "${submitTargetModule.title}" atas nama ${newSub.studentName} berhasil dikirim ke Pembina!`);
    setSubName('');
    setSubNis('');
    setSubClass('');
    setSubUrl('');
    setSubNotes('');
  };

  const handleReviewSubmission = async (sub: TaskSubmission, status: TaskSubmission['status']) => {
    await onSaveSubmission({
      ...sub,
      status,
    });
  };

  return (
    <section className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
        <div>
          <div className="inline-flex items-center gap-2 text-cyan-400 font-mono text-xs uppercase tracking-wider mb-2">
            <BookOpen className="w-4 h-4" />
            <span>Kurikulum, Silabus &amp; Pengumpulan Tugas</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Modul Pembelajaran Mandiri &amp; Praktikum
          </h2>
          <p className="text-sm text-slate-400 mt-1.5 max-w-2xl">
            Materi terstandar untuk membimbing siswa dari dasar hingga siap lomba, lengkap dengan link PDF/video dan pengumpulan tugas daring.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex p-1 rounded-xl bg-slate-950 border border-slate-800">
            <button
              type="button"
              onClick={() => setActiveSubTab('modul')}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                activeSubTab === 'modul'
                  ? 'bg-cyan-500 text-slate-950'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Daftar Modul ({modules.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveSubTab('tugas')}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                activeSubTab === 'tugas'
                  ? 'bg-cyan-500 text-slate-950'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <ClipboardCheck className="w-3.5 h-3.5" />
              <span>Tugas Masuk ({submissions.length})</span>
            </button>
          </div>

          {admin.isAuthenticated && activeSubTab === 'modul' && (
            <button
              type="button"
              onClick={openAddModule}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-400 text-slate-950 text-xs font-extrabold flex items-center gap-1.5 shadow-lg shadow-cyan-500/20"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Modul</span>
            </button>
          )}
        </div>
      </div>

      {/* TAB 1: MODULES GRID */}
      {activeSubTab === 'modul' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {modules.map((mod) => (
            <div
              key={mod.id}
              className="rounded-2xl bg-[#0b1120] border border-slate-800 hover:border-cyan-500/40 p-6 sm:p-7 shadow-xl transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-cyan-950/80 border border-cyan-500/30 flex items-center justify-center text-cyan-300 group-hover:scale-105 transition-transform">
                    {mod.track === 'C# .NET' && <Code className="w-6 h-6 text-cyan-400" />}
                    {mod.track === 'Python Programming' && <Terminal className="w-6 h-6 text-emerald-400" />}
                    {mod.track === 'Scratch/Pictoblox' && <Play className="w-6 h-6 text-teal-400" />}
                    {mod.track === 'Desain Grafis' && <Monitor className="w-6 h-6 text-violet-400" />}
                    {mod.track === 'Robotika & IoT' && <Cpu className="w-6 h-6 text-sky-400" />}
                  </div>

                  <div className="flex flex-wrap items-center justify-end gap-1.5">
                    <span className="px-2.5 py-0.5 rounded text-[11px] font-mono font-bold bg-slate-900 text-slate-300 border border-slate-800">
                      {mod.level}
                    </span>
                    <span className="px-2.5 py-0.5 rounded text-[11px] font-mono text-cyan-400 bg-cyan-950/50 border border-cyan-800/40">
                      {mod.lessons} Pertemuan
                    </span>
                    {admin.isAuthenticated && (
                      <>
                        <button
                          type="button"
                          onClick={() => openEditModule(mod)}
                          title="Edit modul"
                          className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        {admin.role === 'guru_admin' && (
                          <button
                            type="button"
                            onClick={() => onDeleteModule(mod.id)}
                            title="Hapus modul"
                            className="p-1.5 rounded-lg bg-rose-950/50 hover:bg-rose-900 text-rose-300 border border-rose-500/30"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>

                <h3 className="text-lg font-bold text-white group-hover:text-cyan-300 transition-colors mb-2">
                  {mod.title}
                </h3>

                <p className="text-xs text-slate-400 leading-relaxed mb-5">
                  {mod.description}
                </p>

                {/* Syllabus Preview */}
                <div className="space-y-2 mb-5">
                  <span className="text-xs font-semibold text-slate-300 block">
                    Topik Bahasan Utama:
                  </span>
                  <div className="space-y-1.5">
                    {mod.syllabus.slice(0, 3).map((syl, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs text-slate-400">
                        <CheckCircle2 className="w-3.5 h-3.5 text-teal-400 shrink-0 mt-0.5" />
                        <span>{syl}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs text-slate-500 font-mono">
                  Durasi: {mod.duration}
                </span>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSubSuccess(null);
                      setSubError(null);
                      setSubmitTargetModule(mod);
                    }}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-teal-950/80 hover:bg-teal-900 border border-teal-500/30 text-xs font-bold text-teal-300 transition-all"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Kumpul Tugas</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveModule(mod)}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/30 text-xs font-bold text-cyan-300 transition-all"
                  >
                    <span>Silabus</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 2: TASK SUBMISSIONS LIST */}
      {activeSubTab === 'tugas' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-[#0b1120] border border-cyan-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-white">Daftar Pengumpulan Tugas &amp; Proyek Siswa</h3>
              <p className="text-xs text-slate-400">
                Siswa dapat mengumpulkan tautan proyek (GitHub, Google Drive, Scratch, Canva, atau Demo Web) dari setiap modul.
              </p>
            </div>
            {onNavigateToPenilaian && (
              <button
                type="button"
                onClick={onNavigateToPenilaian}
                className="shrink-0 px-3.5 py-2 rounded-xl bg-violet-950 hover:bg-violet-900 border border-violet-500/40 text-xs font-bold text-violet-200 flex items-center gap-1.5"
              >
                <Award className="w-4 h-4 text-violet-300" />
                <span>Buka Menu Penilaian</span>
              </button>
            )}
          </div>

          {submissions.length === 0 ? (
            <div className="p-10 rounded-2xl bg-[#0b1120] border border-slate-800 text-center text-xs text-slate-400">
              Belum ada tugas yang dikumpulkan siswa. Klik tombol <strong>Kumpul Tugas</strong> pada salah satu modul untuk mengirim hasil proyek.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {submissions.map((sub) => (
                <div
                  key={sub.id}
                  className="p-5 rounded-2xl bg-[#0b1120] border border-slate-800 flex flex-col justify-between gap-3"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase">
                          {sub.division}
                        </span>
                        <h4 className="text-sm font-bold text-white">{sub.studentName}</h4>
                        <div className="text-[11px] text-slate-400 font-mono">
                          NIS: {sub.nisn} · {sub.studentClass}
                        </div>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                          sub.status === 'Dinilai'
                            ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40'
                            : sub.status === 'Perlu Revisi'
                            ? 'bg-amber-950/60 text-amber-300 border-amber-500/40'
                            : 'bg-slate-900 text-slate-300 border-slate-700'
                        }`}
                      >
                        {sub.status}
                      </span>
                    </div>

                    <div className="text-xs text-slate-300 font-medium mb-1">
                      Modul: {sub.moduleTitle}
                    </div>
                    {sub.notes && (
                      <p className="text-[11px] text-slate-400 mb-2">{sub.notes}</p>
                    )}

                    <a
                      href={sub.projectUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-cyan-300 hover:text-cyan-200 underline break-all"
                    >
                      <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                      <span>Buka Tautan Hasil Tugas</span>
                    </a>
                  </div>

                  <div className="pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2">
                    <span className="text-[10px] font-mono text-slate-500">
                      {new Date(sub.submittedAt).toLocaleString('id-ID')}
                    </span>

                    {admin.isAuthenticated && (
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleReviewSubmission(sub, 'Dinilai')}
                          className="px-2.5 py-1 rounded-lg bg-emerald-950/70 hover:bg-emerald-900 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold"
                        >
                          Tandai Dinilai
                        </button>
                        <button
                          type="button"
                          onClick={() => handleReviewSubmission(sub, 'Perlu Revisi')}
                          className="px-2.5 py-1 rounded-lg bg-amber-950/70 hover:bg-amber-900 text-amber-300 border border-amber-500/30 text-[10px] font-bold"
                        >
                          Revisi
                        </button>
                        {admin.role === 'guru_admin' && (
                          <button
                            type="button"
                            onClick={() => onDeleteSubmission(sub.id)}
                            className="p-1 rounded-lg bg-rose-950/50 hover:bg-rose-900 text-rose-300 border border-rose-500/30"
                            title="Hapus"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* DETAIL SYLLABUS & STARTER CODE MODAL */}
      {activeModule && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
          <div className="relative w-full max-w-2xl rounded-2xl bg-[#0b1120] border border-cyan-500/40 p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
            <button
              type="button"
              onClick={() => setActiveModule(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-500/40">
                Divisi {activeModule.track}
              </span>
              <span className="text-xs text-slate-400 font-mono">
                Level: {activeModule.level}
              </span>
            </div>

            <h3 className="text-2xl font-extrabold text-white mb-2">
              {activeModule.title}
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 mb-6">
              {activeModule.description}
            </p>

            {/* Complete Syllabus list */}
            <div className="mb-6">
              <h4 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider mb-3">
                Silabus Modul ({activeModule.lessons} Pertemuan)
              </h4>
              <div className="space-y-2">
                {activeModule.syllabus.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-start gap-3"
                  >
                    <span className="w-5 h-5 rounded-md bg-cyan-950 text-cyan-300 text-xs font-mono flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <span className="text-xs text-slate-200">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Starter Code Viewer if present */}
            {activeModule.starterCode && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono text-cyan-300 font-bold">
                    Starter Template Code ({activeModule.starterLanguage || activeModule.track})
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopyCode(activeModule.starterCode!)}
                    className="flex items-center gap-1 text-[11px] font-mono text-slate-400 hover:text-cyan-300"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-teal-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Tersalin' : 'Salin Kode'}</span>
                  </button>
                </div>
                <div className="p-4 rounded-xl bg-black border border-slate-800 text-xs font-mono text-slate-200 overflow-x-auto">
                  <pre>{activeModule.starterCode}</pre>
                </div>
              </div>
            )}

            <div className="flex flex-wrap items-center justify-end gap-2.5 pt-4 border-t border-slate-800">
              {activeModule.videoUrl && (
                <a
                  href={activeModule.videoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-950/70 hover:bg-rose-900 border border-rose-500/40 text-xs font-semibold text-rose-200 transition-colors"
                >
                  <Video className="w-4 h-4 text-rose-400" />
                  <span>Tonton Video</span>
                </a>
              )}
              <a
                href={activeModule.pdfUrl || 'https://sfl.gl/eXMZXIfr'}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-200 transition-colors"
              >
                <Download className="w-4 h-4 text-cyan-400" />
                <span>Buka Materi / PDF</span>
              </a>
              <button
                type="button"
                onClick={() => {
                  const target = activeModule;
                  setActiveModule(null);
                  setSubSuccess(null);
                  setSubError(null);
                  setSubmitTargetModule(target);
                }}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-extrabold transition-all"
              >
                <Send className="w-4 h-4" />
                <span>Kumpul Tugas</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STUDENT TASK SUBMISSION MODAL */}
      {submitTargetModule && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
          <div className="relative w-full max-w-lg rounded-2xl bg-[#0b1120] border border-teal-500/40 p-6 shadow-2xl">
            <button
              type="button"
              onClick={() => setSubmitTargetModule(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-extrabold text-white mb-1">Kumpulkan Tugas / Proyek</h3>
            <p className="text-xs text-teal-300 mb-4">{submitTargetModule.title}</p>

            {subSuccess && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-xs text-emerald-200">
                {subSuccess}
              </div>
            )}
            {subError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-950/60 border border-rose-500/40 text-xs text-rose-200">
                {subError}
              </div>
            )}

            <form onSubmit={handleSubmitTask} className="space-y-3.5">
              <div>
                <label className="block text-xs text-slate-300 mb-1">Nama Lengkap Siswa</label>
                <input
                  type="text"
                  required
                  maxLength={120}
                  value={subName}
                  onChange={(e) => setSubName(e.target.value)}
                  placeholder="Contoh: Kemal Alkhoiri"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:border-teal-400 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-300 mb-1">NIS</label>
                  <input
                    type="text"
                    required
                    maxLength={40}
                    value={subNis}
                    onChange={(e) => setSubNis(e.target.value)}
                    placeholder="Contoh: 24251001"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white font-mono focus:border-teal-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-300 mb-1">Kelas</label>
                  <input
                    type="text"
                    required
                    maxLength={60}
                    value={subClass}
                    onChange={(e) => setSubClass(e.target.value)}
                    placeholder="Contoh: VIII A / X RPL 1"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:border-teal-400 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-300 mb-1">
                  Link Hasil Tugas / Proyek (GitHub, Drive, Scratch, Canva, dll)
                </label>
                <input
                  type="url"
                  required
                  maxLength={500}
                  value={subUrl}
                  onChange={(e) => setSubUrl(e.target.value)}
                  placeholder="https://github.com/... atau https://drive.google.com/..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white font-mono focus:border-teal-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-300 mb-1">Catatan Singkat (Opsional)</label>
                <textarea
                  rows={2}
                  maxLength={1000}
                  value={subNotes}
                  onChange={(e) => setSubNotes(e.target.value)}
                  placeholder="Jelaskan fitur utama yang dibuat..."
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:border-teal-400 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSubmitTargetModule(null)}
                  className="px-4 py-2 rounded-xl bg-slate-900 text-slate-300 text-xs font-semibold"
                >
                  Tutup
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-extrabold flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Kirim Tugas</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD / EDIT MODULE MODAL (ADMIN & PENGURUS) */}
      {showModuleModal && admin.isAuthenticated && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
          <div className="relative w-full max-w-2xl rounded-2xl bg-[#0b1120] border border-cyan-500/40 p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <button
              type="button"
              onClick={() => setShowModuleModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-extrabold text-white mb-4">
              {editingMod ? 'Edit Modul Pembelajaran' : 'Tambah Modul Pembelajaran Baru'}
            </h3>

            <form onSubmit={handleSaveModuleForm} className="space-y-3.5">
              <div>
                <label className="block text-xs text-slate-300 mb-1">Judul Modul</label>
                <input
                  type="text"
                  required
                  maxLength={180}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Contoh: Pemrograman IoT ESP32 & RFID untuk Pemula"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs text-slate-300 mb-1">Divisi</label>
                  <select
                    value={track}
                    onChange={(e) => setTrack(e.target.value as DivisionType)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
                  >
                    {DIVISIONS.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-slate-300 mb-1">Level</label>
                  <select
                    value={level}
                    onChange={(e) => setLevel(e.target.value as LearningModule['level'])}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
                  >
                    <option value="Dasar">Dasar</option>
                    <option value="Menengah">Menengah</option>
                    <option value="Lanjutan">Lanjutan</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-slate-300 mb-1">Durasi</label>
                  <input
                    type="text"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    placeholder="6 Minggu"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-300 mb-1">Pertemuan</label>
                  <input
                    type="number"
                    min={1}
                    max={40}
                    value={lessons}
                    onChange={(e) => setLessons(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-300 mb-1">Deskripsi Modul</label>
                <textarea
                  rows={2}
                  required
                  maxLength={2000}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-300 mb-1">
                  Silabus (pisahkan tiap topik dengan baris baru / Enter)
                </label>
                <textarea
                  rows={4}
                  required
                  value={syllabusText}
                  onChange={(e) => setSyllabusText(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white font-mono"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-300 mb-1">Link PDF / Google Drive (Opsional)</label>
                  <input
                    type="url"
                    value={pdfUrl}
                    onChange={(e) => setPdfUrl(e.target.value)}
                    placeholder="https://drive.google.com/..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-300 mb-1">Link Video YouTube (Opsional)</label>
                  <input
                    type="url"
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    placeholder="https://youtube.com/watch?v=..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-300 mb-1">Starter Code / Contoh Kode (Opsional)</label>
                <textarea
                  rows={3}
                  value={starterCode}
                  onChange={(e) => setStarterCode(e.target.value)}
                  placeholder="// Tempel contoh kode pemula di sini..."
                  className="w-full px-3.5 py-2 rounded-xl bg-black border border-slate-700 text-xs text-cyan-200 font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModuleModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-900 text-slate-300 text-xs font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-extrabold"
                >
                  Simpan Modul ke Cloud
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};
