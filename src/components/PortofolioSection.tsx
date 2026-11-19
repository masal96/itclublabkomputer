import React, { useState } from 'react';
import { 
  FolderGit2, 
  ExternalLink, 
  Github, 
  Plus, 
  Edit3, 
  Trash2, 
  Lock, 
  X, 
  Check, 
  Users, 
  Tag,
  Link2,
  Copy,
  Globe
} from 'lucide-react';
import { PortfolioItem, AdminUser } from '../types';

function normalizeExternalUrl(raw?: string): string | null {
  if (!raw) return null;
  const trimmed = raw.trim();
  if (!trimmed || trimmed === '#' || trimmed === '#demo') return null;
  if (/^(javascript|data|vbscript):/i.test(trimmed)) return null;
  const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  try {
    const parsed = new URL(withProtocol);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return null;
    return parsed.toString();
  } catch {
    return null;
  }
}

function getDomainLabel(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

interface PortofolioSectionProps {
  admin: AdminUser;
  portfolioList: PortfolioItem[];
  onAddPortfolio: (item: PortfolioItem) => void;
  onUpdatePortfolio: (item: PortfolioItem) => void;
  onDeletePortfolio: (id: string) => void;
  onOpenAdminModal: () => void;
}

export const PortofolioSection: React.FC<PortofolioSectionProps> = ({
  admin,
  portfolioList,
  onAddPortfolio,
  onUpdatePortfolio,
  onDeletePortfolio,
  onOpenAdminModal,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [activeModalItem, setActiveModalItem] = useState<PortfolioItem | null>(null);
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingItem, setEditingItem] = useState<PortfolioItem | null>(null);

  // Form states
  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState<PortfolioItem['category']>('C# Desktop');
  const [formDesc, setFormDesc] = useState('');
  const [formAuthors, setFormAuthors] = useState('');
  const [formClass, setFormClass] = useState('');
  const [formImageUrl, setFormImageUrl] = useState('');
  const [formDemoUrl, setFormDemoUrl] = useState('');
  const [formGithubUrl, setFormGithubUrl] = useState('');
  const [formTags, setFormTags] = useState('');
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  const categories = ['Semua', 'C# Desktop', 'Scratch/Pictoblox Game', 'UI/UX Design', 'Robotika & IoT', 'Web Apps'];

  const filteredItems = portfolioList.filter((item) => {
    return selectedCategory === 'Semua' || item.category === selectedCategory;
  });

  const handleCopyProjectLink = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedUrl(url);
      setTimeout(() => setCopiedUrl((prev) => (prev === url ? null : prev)), 2000);
    } catch {
      // ignore clipboard errors in restricted iframes
    }
  };

  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormTitle('');
    setFormCategory('C# Desktop');
    setFormDesc('');
    setFormAuthors('Rizky Ramadhan, Zahra Nabila');
    setFormClass('Kelas XI RPL 1');
    setFormImageUrl('/src/assets/images/csharp_game_showcase_1792487695848.jpg');
    setFormDemoUrl('');
    setFormGithubUrl('');
    setFormTags('C# .NET, MonoGame, Aseprite');
    setShowFormModal(true);
  };

  const handleOpenEdit = (item: PortfolioItem) => {
    setEditingItem(item);
    setFormTitle(item.title);
    setFormCategory(item.category);
    setFormDesc(item.description);
    setFormAuthors(item.studentAuthors.join(', '));
    setFormClass(item.gradeClass);
    setFormImageUrl(item.imageUrl);
    setFormDemoUrl(normalizeExternalUrl(item.demoUrl) || '');
    setFormGithubUrl(normalizeExternalUrl(item.githubUrl) || '');
    setFormTags(item.techTags.join(', '));
    setShowFormModal(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    const tagsArray = formTags.split(',').map((t) => t.trim()).filter(Boolean);
    const authorsArray = formAuthors.split(',').map((a) => a.trim()).filter(Boolean);
    const cleanedDemoUrl = normalizeExternalUrl(formDemoUrl) || '';
    const cleanedGithubUrl = normalizeExternalUrl(formGithubUrl) || '';

    if (editingItem) {
      onUpdatePortfolio({
        ...editingItem,
        title: formTitle,
        category: formCategory,
        description: formDesc,
        studentAuthors: authorsArray,
        gradeClass: formClass,
        imageUrl: formImageUrl.trim() || editingItem.imageUrl,
        demoUrl: cleanedDemoUrl,
        githubUrl: cleanedGithubUrl,
        techTags: tagsArray,
      });
    } else {
      const newItem: PortfolioItem = {
        id: `port-${Date.now()}`,
        title: formTitle,
        category: formCategory,
        description: formDesc,
        studentAuthors: authorsArray,
        gradeClass: formClass,
        imageUrl: formImageUrl.trim() || '/src/assets/images/csharp_game_showcase_1792487695848.jpg',
        demoUrl: cleanedDemoUrl,
        githubUrl: cleanedGithubUrl,
        featured: false,
        date: new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' }),
        techTags: tagsArray.length > 0 ? tagsArray : ['Inovasi Siswa', 'IT Club'],
      };
      onAddPortfolio(newItem);
    }

    setShowFormModal(false);
  };

  return (
    <section className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs uppercase tracking-wider mb-2">
            <FolderGit2 className="w-4 h-4" />
            <span>Karya Digital &amp; Rekayasa Siswa</span>
          </div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">
            Galeri Portofolio Proyek
          </h2>
          <p className="text-sm text-slate-400 mt-1 max-w-2xl">
            Hasil karya orisinal siswa IT Club: dari game 2D C#, animasi Scratch, arsitektur sistem jaringan, hingga desain UI/UX.
          </p>
        </div>

        {/* Action Button */}
        <div className="flex items-center gap-3">
          {admin.isAuthenticated ? (
            <button
              onClick={handleOpenAdd}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-teal-400 to-cyan-400 text-slate-950 text-xs font-bold hover:opacity-95 shadow-md shadow-cyan-500/20"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Portofolio Siswa</span>
            </button>
          ) : (
            <button
              onClick={onOpenAdminModal}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 border border-violet-500/30 text-xs font-medium text-violet-300 hover:text-white transition-all"
            >
              <Lock className="w-3.5 h-3.5 text-amber-400" />
              <span>Login Guru untuk Kelola Portofolio</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-8 border-b border-slate-800">
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                isSelected
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Project Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map((item) => {
          const validDemoUrl = normalizeExternalUrl(item.demoUrl);
          const validGithubUrl = normalizeExternalUrl(item.githubUrl);
          const primaryProjectUrl = validDemoUrl || validGithubUrl;

          return (
            <div
              key={item.id}
              className="group rounded-2xl bg-[#0b1120] border border-slate-800 hover:border-cyan-500/40 overflow-hidden shadow-xl transition-all flex flex-col justify-between"
            >
              <div>
                {/* Image Preview with overlay */}
                <div
                  className="relative aspect-video overflow-hidden cursor-pointer bg-slate-950"
                  onClick={() => setActiveModalItem(item)}
                >
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-[#0b1120] via-transparent to-black/30" />

                  {/* Category Badge */}
                  <div className="absolute top-3 left-3">
                    <span className="px-2.5 py-1 rounded-md text-[10px] font-mono font-bold bg-[#080c16]/90 text-cyan-300 border border-cyan-500/30 backdrop-blur-md">
                      {item.category}
                    </span>
                  </div>

                  {item.featured && (
                    <div className="absolute top-3 right-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                        ★ Unggulan
                      </span>
                    </div>
                  )}
                </div>

                {/* Body */}
                <div className="p-5">
                  <h3
                    onClick={() => setActiveModalItem(item)}
                    className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors line-clamp-1 cursor-pointer mb-2"
                  >
                    {item.title}
                  </h3>

                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-4">
                    {item.description}
                  </p>

                  {/* Tech Tags */}
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {item.techTags.slice(0, 3).map((tag, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-900 text-slate-300 border border-slate-800"
                      >
                        {tag}
                      </span>
                    ))}
                    {item.techTags.length > 3 && (
                      <span className="text-[10px] font-mono text-slate-500 self-center">
                        +{item.techTags.length - 3}
                      </span>
                    )}
                  </div>

                  {/* Direct clickable project URL preview line */}
                  {primaryProjectUrl && (
                    <a
                      href={primaryProjectUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center gap-1.5 text-[11px] font-mono text-emerald-300 hover:text-emerald-200 hover:underline transition-colors max-w-full"
                      title={`Buka hasil proyek: ${primaryProjectUrl}`}
                    >
                      <Link2 className="w-3.5 h-3.5 shrink-0 text-emerald-400" />
                      <span className="truncate">{getDomainLabel(primaryProjectUrl)}</span>
                      <ExternalLink className="w-3 h-3 shrink-0" />
                    </a>
                  )}
                </div>
              </div>

              {/* Footer with student creators & actions */}
              <div className="px-5 py-3.5 bg-[#080d1a] border-t border-slate-800/80 flex items-center justify-between gap-2 text-xs">
                <div className="min-w-0 pr-2">
                  <div className="text-[11px] font-medium text-slate-200 truncate">
                    {item.studentAuthors.join(', ')}
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono">
                    {item.gradeClass}
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {validDemoUrl && (
                    <a
                      href={validDemoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/40 text-[11px] font-semibold transition-colors"
                      title={`Buka hasil proyek di ${getDomainLabel(validDemoUrl)}`}
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>Lihat Proyek</span>
                    </a>
                  )}

                  {validGithubUrl && (
                    <a
                      href={validGithubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className={`inline-flex items-center gap-1 rounded-lg border text-[11px] font-semibold transition-colors ${
                        validDemoUrl
                          ? 'p-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-700'
                          : 'px-2.5 py-1 bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border-emerald-500/40'
                      }`}
                      title={`Buka repository proyek: ${validGithubUrl}`}
                    >
                      <Github className="w-3.5 h-3.5" />
                      {!validDemoUrl && <span>Lihat Proyek</span>}
                    </a>
                  )}

                  <button
                    onClick={() => setActiveModalItem(item)}
                    className="px-2.5 py-1 rounded-lg bg-cyan-950/80 hover:bg-cyan-900 text-cyan-300 border border-cyan-500/30 text-[11px] font-semibold"
                  >
                    Detail
                  </button>

                  {admin.isAuthenticated && (
                    <>
                      <button
                        onClick={() => handleOpenEdit(item)}
                        className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
                        title="Edit Portofolio"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDeletePortfolio(item.id)}
                        className="p-1 rounded-lg hover:bg-red-950 text-slate-400 hover:text-red-400"
                        title="Hapus Portofolio"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* DETAIL MODAL */}
      {activeModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-2xl rounded-2xl bg-[#0b1120] border border-cyan-500/40 p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setActiveModalItem(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="aspect-video rounded-xl overflow-hidden mb-6 border border-slate-700 bg-slate-950">
              <img
                src={activeModalItem.imageUrl}
                alt={activeModalItem.title}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>

            <div className="flex items-center gap-2 mb-3">
              <span className="px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-500/40">
                {activeModalItem.category}
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {activeModalItem.date}
              </span>
            </div>

            <h3 className="text-2xl font-extrabold text-white mb-3">
              {activeModalItem.title}
            </h3>

            <p className="text-sm text-slate-300 leading-relaxed mb-6">
              {activeModalItem.description}
            </p>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3 mb-6">
              <div className="flex items-center gap-2 text-xs">
                <Users className="w-4 h-4 text-teal-400" />
                <span className="text-slate-400">Kreator / Tim Siswa:</span>
                <span className="text-white font-semibold">
                  {activeModalItem.studentAuthors.join(', ')} ({activeModalItem.gradeClass})
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-1.5 text-xs">
                <Tag className="w-4 h-4 text-cyan-400" />
                <span className="text-slate-400 mr-1">Teknologi &amp; Tools:</span>
                {activeModalItem.techTags.map((tag, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 rounded text-[11px] font-mono bg-slate-900 text-cyan-200 border border-cyan-900/60"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Clickable Project Links */}
            {(() => {
              const modalDemoUrl = normalizeExternalUrl(activeModalItem.demoUrl);
              const modalGithubUrl = normalizeExternalUrl(activeModalItem.githubUrl);
              const shareUrl = modalDemoUrl || modalGithubUrl;

              return (
                <div className="space-y-3">
                  {(modalDemoUrl || modalGithubUrl) ? (
                    <div className="p-3.5 rounded-xl bg-[#080d1a] border border-slate-800 space-y-2.5">
                      <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                        <Link2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Tautan Hasil Karya Siswa</span>
                      </div>
                      <div className="flex flex-wrap items-center gap-2.5">
                        {modalDemoUrl && (
                          <a
                            href={modalDemoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 text-xs font-extrabold hover:opacity-95 shadow-md shadow-emerald-500/20 transition-all"
                          >
                            <Globe className="w-4 h-4" />
                            <span>Buka Hasil Proyek ({getDomainLabel(modalDemoUrl)})</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}

                        {modalGithubUrl && (
                          <a
                            href={modalGithubUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-white transition-colors"
                          >
                            <Github className="w-4 h-4" />
                            <span>Lihat Repository GitHub</span>
                            <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                          </a>
                        )}

                        {shareUrl && (
                          <button
                            type="button"
                            onClick={() => handleCopyProjectLink(shareUrl)}
                            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-medium text-slate-300 transition-colors"
                          >
                            {copiedUrl === shareUrl ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                                <span className="text-emerald-300">Link Tersalin</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5" />
                                <span>Salin Link</span>
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between gap-3">
                      <span className="text-xs text-slate-400">
                        Belum ada tautan demo atau repositori yang ditautkan pada proyek ini.
                      </span>
                      {admin.isAuthenticated && (
                        <button
                          type="button"
                          onClick={() => {
                            const target = activeModalItem;
                            setActiveModalItem(null);
                            handleOpenEdit(target);
                          }}
                          className="shrink-0 px-3 py-1.5 rounded-lg bg-cyan-950 text-cyan-300 border border-cyan-500/40 text-xs font-semibold hover:bg-cyan-900"
                        >
                          + Tambah Link Proyek
                        </button>
                      )}
                    </div>
                  )}

                  <div className="flex justify-end pt-1">
                    <button
                      onClick={() => setActiveModalItem(null)}
                      className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold transition-all"
                    >
                      Tutup Pratinjau
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* ADD / EDIT MODAL FOR TEACHER */}
      {showFormModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="relative w-full max-w-lg rounded-2xl bg-[#0b1120] border border-cyan-500/40 p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowFormModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-bold text-white mb-2">
              {editingItem ? 'Edit Portofolio Siswa' : 'Tambah Portofolio Karya Siswa'}
            </h3>
            <p className="text-xs text-slate-400 mb-6">
              Validasi &amp; publikasikan hasil karya anggota IT Club lengkap dengan link proyeknya.
            </p>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Judul Proyek / Aplikasi
                </label>
                <input
                  type="text"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="Contoh: 2D Space Shooter C# Monogame"
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Kategori
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as PortfolioItem['category'])}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-400"
                  >
                    <option value="C# Desktop">C# Desktop</option>
                    <option value="Scratch/Pictoblox Game">Scratch/Pictoblox Game</option>
                    <option value="UI/UX Design">UI/UX Design</option>
                    <option value="Robotika & IoT">Robotika &amp; IoT</option>
                    <option value="Web Apps">Web Apps</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Kelas Siswa
                  </label>
                  <input
                    type="text"
                    value={formClass}
                    onChange={(e) => setFormClass(e.target.value)}
                    placeholder="Contoh: Kelas XI RPL 1"
                    required
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Nama Kreator / Siswa (Pisahkan dengan koma)
                </label>
                <input
                  type="text"
                  value={formAuthors}
                  onChange={(e) => setFormAuthors(e.target.value)}
                  placeholder="Contoh: Muhammad Rizky, Zahra Nabila"
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Deskripsi Proyek
                </label>
                <textarea
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  rows={2}
                  placeholder="Jelaskan fitur utama dan arsitektur teknis..."
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-emerald-300 mb-1 flex items-center gap-1.5">
                  <Link2 className="w-3.5 h-3.5" />
                  <span>Link Hasil Proyek / Live Demo (URL)</span>
                </label>
                <input
                  type="text"
                  value={formDemoUrl}
                  onChange={(e) => setFormDemoUrl(e.target.value)}
                  placeholder="https://scratch.mit.edu/projects/... atau https://proyek-siswa.vercel.app"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-emerald-500/40 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-400"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Bisa berupa link Scratch, Pictoblox, Figma, Google Drive, YouTube demo, atau website siswa.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Link GitHub / Source Code (Opsional)
                  </label>
                  <input
                    type="text"
                    value={formGithubUrl}
                    onChange={(e) => setFormGithubUrl(e.target.value)}
                    placeholder="https://github.com/..."
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    URL Gambar Preview (Opsional)
                  </label>
                  <input
                    type="text"
                    value={formImageUrl}
                    onChange={(e) => setFormImageUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Tags Teknologi (Pisahkan dengan koma)
                </label>
                <input
                  type="text"
                  value={formTags}
                  onChange={(e) => setFormTags(e.target.value)}
                  placeholder="C#, Unity, Pixel Art, OOP"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowFormModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-teal-400 to-cyan-400 text-slate-950 text-xs font-bold hover:opacity-95 shadow-md shadow-cyan-500/20"
                >
                  {editingItem ? 'Simpan Perubahan' : 'Terbitkan Portofolio'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </section>
  );
};
