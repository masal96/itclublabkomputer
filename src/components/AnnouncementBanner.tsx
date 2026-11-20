import React, { useState } from 'react';
import {
  Megaphone,
  Plus,
  Trash2,
  X,
  Eye,
  EyeOff,
  AlertTriangle,
  Trophy,
  Info,
  CalendarOff,
  CheckCircle2,
} from 'lucide-react';
import { AdminUser, LabAnnouncement } from '../types';

interface AnnouncementBannerProps {
  admin: AdminUser;
  announcements: LabAnnouncement[];
  onSaveAnnouncement: (ann: LabAnnouncement) => Promise<void> | void;
  onDeleteAnnouncement: (id: string) => Promise<void> | void;
}

export const AnnouncementBanner: React.FC<AnnouncementBannerProps> = ({
  admin,
  announcements,
  onSaveAnnouncement,
  onDeleteAnnouncement,
}) => {
  const [showManageModal, setShowManageModal] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [priority, setPriority] = useState<LabAnnouncement['priority']>('Info');
  const [saving, setSaving] = useState(false);

  const activeAnnouncements = announcements.filter((a) => a.active);

  const priorityStyle = (p: LabAnnouncement['priority']) => {
    switch (p) {
      case 'Penting':
        return {
          wrap: 'bg-rose-950/45 border-rose-500/40 text-rose-100',
          badge: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
          icon: AlertTriangle,
        };
      case 'Lomba':
        return {
          wrap: 'bg-amber-950/35 border-amber-500/40 text-amber-100',
          badge: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
          icon: Trophy,
        };
      case 'Libur':
        return {
          wrap: 'bg-violet-950/40 border-violet-500/40 text-violet-100',
          badge: 'bg-violet-500/20 text-violet-300 border-violet-500/40',
          icon: CalendarOff,
        };
      default:
        return {
          wrap: 'bg-cyan-950/35 border-cyan-500/35 text-cyan-100',
          badge: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
          icon: Info,
        };
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    setSaving(true);
    try {
      await onSaveAnnouncement({
        id: `ann-${Date.now()}`,
        title: title.trim(),
        content: content.trim(),
        priority,
        active: true,
        authorName: admin.name || 'Pembina IT Club',
        createdAt: new Date().toISOString(),
      });
      setTitle('');
      setContent('');
      setPriority('Info');
    } finally {
      setSaving(false);
    }
  };

  if (activeAnnouncements.length === 0 && !admin.isAuthenticated) {
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-5">
      <div className="space-y-2.5">
        {activeAnnouncements.map((ann) => {
          const style = priorityStyle(ann.priority);
          const IconComp = style.icon;
          return (
            <div
              key={ann.id}
              className={`rounded-2xl border px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 backdrop-blur-md ${style.wrap}`}
            >
              <div className="flex items-start gap-3 min-w-0">
                <div className="p-2 rounded-xl bg-slate-950/60 border border-white/10 shrink-0 mt-0.5">
                  <IconComp className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase border ${style.badge}`}>
                      {ann.priority}
                    </span>
                    <h4 className="text-xs sm:text-sm font-bold text-white">{ann.title}</h4>
                  </div>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">{ann.content}</p>
                </div>
              </div>

              {admin.isAuthenticated && (
                <button
                  type="button"
                  onClick={() => setShowManageModal(true)}
                  className="shrink-0 self-start sm:self-center px-3 py-1.5 rounded-xl bg-slate-950/70 hover:bg-slate-900 border border-slate-700 text-[11px] font-semibold text-cyan-300 flex items-center gap-1.5"
                >
                  <Megaphone className="w-3.5 h-3.5" />
                  <span>Kelola Pengumuman</span>
                </button>
              )}
            </div>
          );
        })}

        {activeAnnouncements.length === 0 && admin.isAuthenticated && (
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => setShowManageModal(true)}
              className="px-3.5 py-1.5 rounded-xl bg-cyan-950/60 hover:bg-cyan-900/70 border border-cyan-500/40 text-xs font-bold text-cyan-300 flex items-center gap-1.5"
            >
              <Megaphone className="w-3.5 h-3.5" />
              <span>Buat Pengumuman Beranda</span>
            </button>
          </div>
        )}
      </div>

      {/* Manage Announcements Modal */}
      {showManageModal && admin.isAuthenticated && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
          <div className="relative w-full max-w-2xl rounded-2xl bg-[#0b1120] border border-cyan-500/40 p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <button
              type="button"
              onClick={() => setShowManageModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5 mb-5">
              <div className="p-2.5 rounded-xl bg-cyan-950 border border-cyan-500/40 text-cyan-300">
                <Megaphone className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Papan Pengumuman Lab &amp; IT Club</h3>
                <p className="text-xs text-slate-400">
                  Pengumuman aktif langsung tampil di bagian atas Beranda untuk seluruh siswa &amp; wali.
                </p>
              </div>
            </div>

            <form onSubmit={handleAdd} className="space-y-3 p-4 rounded-xl bg-slate-950/80 border border-slate-800 mb-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Judul Pengumuman
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={160}
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Contoh: Jadwal Seleksi LKS Web & Robotika"
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:border-cyan-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Kategori
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as LabAnnouncement['priority'])}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:border-cyan-400 focus:outline-none"
                  >
                    <option value="Info">Info</option>
                    <option value="Penting">Penting</option>
                    <option value="Lomba">Lomba</option>
                    <option value="Libur">Libur</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Isi Pengumuman
                </label>
                <textarea
                  rows={2}
                  required
                  maxLength={800}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Tulis informasi singkat dan jelas untuk siswa..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:border-cyan-400 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 disabled:opacity-50"
              >
                <Plus className="w-4 h-4" />
                <span>{saving ? 'Menyimpan...' : 'Terbitkan Pengumuman'}</span>
              </button>
            </form>

            {/* List Existing */}
            <div className="space-y-2.5">
              <h4 className="text-xs font-mono font-bold text-slate-400 uppercase">
                Daftar Pengumuman ({announcements.length})
              </h4>
              {announcements.map((ann) => (
                <div
                  key={ann.id}
                  className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-start justify-between gap-3"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-cyan-300">
                        {ann.priority}
                      </span>
                      <span className="text-xs font-bold text-white">{ann.title}</span>
                      {ann.active ? (
                        <span className="text-[10px] text-emerald-400 flex items-center gap-0.5">
                          <CheckCircle2 className="w-3 h-3" /> Tayang
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-500">Disembunyikan</span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">{ann.content}</p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => onSaveAnnouncement({ ...ann, active: !ann.active })}
                      title={ann.active ? 'Sembunyikan' : 'Tampilkan'}
                      className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700"
                    >
                      {ann.active ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteAnnouncement(ann.id)}
                      title="Hapus pengumuman"
                      className="p-1.5 rounded-lg bg-rose-950/50 hover:bg-rose-900/70 text-rose-300 border border-rose-500/30"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
