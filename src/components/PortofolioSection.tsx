import React, { useState } from 'react';
import { 
  FolderGit2, 
  ExternalLink, 
  Github, 
  Plus, 
  Edit3, 
  Trash2, 
  Sparkles, 
  Lock, 
  X, 
  Check, 
  Layers, 
  Users, 
  Calendar,
  Tag
} from 'lucide-react';
import { PortfolioItem, AdminUser } from '../types';

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
  const [formTags, setFormTags] = useState('');

  const categories = ['Semua', 'C# Desktop', 'Scratch Game', 'UI/UX Design', 'Jaringan & IoT', 'Web Apps'];

  const filteredItems = portfolioList.filter((item) => {
    return selectedCategory === 'Semua' || item.category === selectedCategory;
  });

  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormTitle('');
    setFormCategory('C# Desktop');
    setFormDesc('');
    setFormAuthors('Rizky Ramadhan, Zahra Nabila');
    setFormClass('Kelas XI RPL 1');
    setFormImageUrl('/src/assets/images/csharp_game_showcase_1792487695848.jpg');
    setFormDemoUrl('#demo');
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
    setFormDemoUrl(item.demoUrl || '');
    setFormTags(item.techTags.join(', '));
    setShowFormModal(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    const tagsArray = formTags.split(',').map((t) => t.trim()).filter(Boolean);
    const authorsArray = formAuthors.split(',').map((a) => a.trim()).filter(Boolean);

    if (editingItem) {
      onUpdatePortfolio({
        ...editingItem,
        title: formTitle,
        category: formCategory,
        description: formDesc,
        studentAuthors: authorsArray,
        gradeClass: formClass,
        imageUrl: formImageUrl || editingItem.imageUrl,
        demoUrl: formDemoUrl,
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
        imageUrl: formImageUrl || '/src/assets/images/csharp_game_showcase_1792487695848.jpg',
        demoUrl: formDemoUrl,
        featured: false,
        date: 'Maret 2026',
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
        {filteredItems.map((item) => (
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
                    // Fallback to high tech gradient if broken
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
                <div className="flex flex-wrap gap-1.5 mb-4">
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
              </div>
            </div>

            {/* Footer with student creators & actions */}
            <div className="px-5 py-3.5 bg-[#080d1a] border-t border-slate-800/80 flex items-center justify-between text-xs">
              <div className="min-w-0 pr-2">
                <div className="text-[11px] font-medium text-slate-200 truncate">
                  {item.studentAuthors.join(', ')}
                </div>
                <div className="text-[10px] text-slate-500 font-mono">
                  {item.gradeClass}
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
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
        ))}
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

            {/* Links */}
            <div className="flex items-center gap-3">
              {activeModalItem.githubUrl && (
                <a
                  href={activeModalItem.githubUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-white transition-colors"
                >
                  <Github className="w-4 h-4" />
                  <span>Lihat Repository GitHub</span>
                </a>
              )}
              <button
                onClick={() => setActiveModalItem(null)}
                className="ml-auto px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold transition-all"
              >
                Tutup Pratinjau
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD / EDIT MODAL FOR TEACHER */}
      {showFormModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="relative w-full max-w-lg rounded-2xl bg-[#0b1120] border border-cyan-500/40 p-6 sm:p-8 shadow-2xl">
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
              Validasi &amp; publikasikan hasil karya anggota IT Club ke portal sekolah.
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
                    <option value="Scratch Game">Scratch Game</option>
                    <option value="UI/UX Design">UI/UX Design</option>
                    <option value="Jaringan & IoT">Jaringan &amp; IoT</option>
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
