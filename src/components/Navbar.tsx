import React, { useState, useRef, useEffect } from 'react';
import {
  Code2,
  Moon,
  Sun,
  ShieldCheck,
  UserCheck,
  Menu,
  X,
  Sparkles,
  Lock,
  LogOut,
  ChevronDown,
  Trophy,
  BookOpen,
  FolderGit2,
  Users,
} from 'lucide-react';
import { AdminUser } from '../types';
import { PWAInstallButton } from './PWAControls';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  admin: AdminUser;
  onOpenAdminModal: () => void;
  onLogoutAdmin: () => void;
  onOpenJoinModal: () => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
}

interface SubMenuItem {
  id: 'kegiatan' | 'pembelajaran' | 'portofolio';
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

const KEGIATAN_SUBMENUS: SubMenuItem[] = [
  {
    id: 'kegiatan',
    label: 'Agenda Kegiatan',
    description: 'Workshop, lomba & pendaftaran kegiatan',
    icon: Trophy,
  },
  {
    id: 'pembelajaran',
    label: 'Pembelajaran & Tugas',
    description: 'Modul materi, PDF/video & kumpul tugas',
    icon: BookOpen,
  },
  {
    id: 'portofolio',
    label: 'Portofolio',
    description: 'Galeri karya & link proyek siswa',
    icon: FolderGit2,
  },
];

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  admin,
  onOpenAdminModal,
  onLogoutAdmin,
  onOpenJoinModal,
  isDarkMode,
  onToggleTheme,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [kegiatanDropdownOpen, setKegiatanDropdownOpen] = useState(false);
  const [mobileKegiatanOpen, setMobileKegiatanOpen] = useState(true);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const isKegiatanGroupActive =
    activeTab === 'kegiatan' ||
    activeTab === 'pembelajaran' ||
    activeTab === 'portofolio';

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setKegiatanDropdownOpen(false);
      }
    };
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setKegiatanDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEsc);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEsc);
    };
  }, []);

  const navItemsAfterKegiatan = [
    { id: 'jadwal', label: 'Jadwal' },
    { id: 'penilaian', label: 'Penilaian' },
    {
      id: 'absensi',
      label: 'Absensi (QR & RFID)',
      isProtected: true,
    },
    {
      id: 'kartu',
      label: 'Cetak Kartu',
      isProtected: true,
    },
    {
      id: 'anggota',
      label: 'Data Anggota',
      isProtected: true,
    },
  ];

  const handleNavClick = (id: string, isProtected?: boolean) => {
    if (isProtected && !admin.isAuthenticated) {
      onOpenAdminModal();
    } else {
      setActiveTab(id);
    }
    setKegiatanDropdownOpen(false);
    setMobileMenuOpen(false);
  };

  const activeSubLabel =
    KEGIATAN_SUBMENUS.find((s) => s.id === activeTab)?.label || 'Kegiatan';

  return (
    <header className="sticky top-0 z-40 w-full border-b border-cyan-900/30 bg-[#080c16]/90 backdrop-blur-md transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          {/* Brand Zone (Kiri) */}
          <button
            onClick={() => handleNavClick('beranda')}
            className="flex items-center gap-3 group text-left focus:outline-none"
          >
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-cyan-500 via-teal-500 to-violet-600 p-[1.5px] transition-transform group-hover:scale-105 shadow-lg shadow-cyan-500/20">
              <div className="w-full h-full bg-[#0b1120] rounded-[10px] flex items-center justify-center">
                <Code2 className="w-6 h-6 text-cyan-400 group-hover:text-cyan-300 transition-colors" />
              </div>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-extrabold tracking-tight text-white group-hover:text-cyan-300 transition-colors">
                  IT CLUB
                </span>
                <span className="px-1.5 py-0.5 text-[10px] font-mono font-bold bg-cyan-950/80 text-cyan-300 border border-cyan-800/60 rounded">
                  2026
                </span>
              </div>
              <span className="text-xs font-mono font-medium text-slate-400 group-hover:text-slate-300 transition-colors">
                &lt;LabKomputer/&gt;
              </span>
            </div>
          </button>

          {/* Desktop Nav Links (Tengah) */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-1.5">
            {/* Beranda */}
            <button
              onClick={() => handleNavClick('beranda')}
              className={`relative px-3 py-2 text-sm font-medium transition-all rounded-lg whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                activeTab === 'beranda'
                  ? 'text-cyan-300 bg-cyan-950/40 shadow-inner border border-cyan-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/40'
              }`}
            >
              <span>Beranda</span>
              {activeTab === 'beranda' && (
                <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-gradient-to-r from-cyan-400 to-teal-400 rounded-full" />
              )}
            </button>

            {/* Menu Kegiatan (Dropdown List: Kegiatan, Pembelajaran, Portofolio) */}
            <div
              ref={dropdownRef}
              className="relative"
              onMouseEnter={() => setKegiatanDropdownOpen(true)}
              onMouseLeave={() => setKegiatanDropdownOpen(false)}
            >
              <button
                type="button"
                onClick={() => setKegiatanDropdownOpen((prev) => !prev)}
                aria-expanded={kegiatanDropdownOpen}
                className={`relative px-3 py-2 text-sm font-medium transition-all rounded-lg whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                  isKegiatanGroupActive
                    ? 'text-cyan-300 bg-cyan-950/40 shadow-inner border border-cyan-500/30'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/40'
                }`}
              >
                <span>{isKegiatanGroupActive ? activeSubLabel : 'Kegiatan'}</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${
                    kegiatanDropdownOpen ? 'rotate-180 text-cyan-400' : ''
                  }`}
                />
                {isKegiatanGroupActive && (
                  <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-gradient-to-r from-cyan-400 to-teal-400 rounded-full" />
                )}
              </button>

              {/* Dropdown Panel */}
              {kegiatanDropdownOpen && (
                <div className="absolute left-0 top-full pt-2 w-72 z-50 animate-fadeIn">
                  <div className="rounded-2xl bg-[#0b1120] border border-cyan-500/35 shadow-2xl shadow-slate-950/80 p-2 space-y-1 backdrop-blur-xl">
                    <div className="px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider text-slate-400 border-b border-slate-800/80 mb-1">
                      Program &amp; Aktivitas IT Club
                    </div>
                    {KEGIATAN_SUBMENUS.map((sub) => {
                      const IconComp = sub.icon;
                      const isSubActive = activeTab === sub.id;
                      return (
                        <button
                          key={sub.id}
                          type="button"
                          onClick={() => handleNavClick(sub.id)}
                          className={`w-full flex items-start gap-3 p-2.5 rounded-xl text-left transition-all ${
                            isSubActive
                              ? 'bg-cyan-950/70 border border-cyan-500/40 text-cyan-200'
                              : 'hover:bg-slate-800/70 text-slate-300 hover:text-white border border-transparent'
                          }`}
                        >
                          <div
                            className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                              isSubActive
                                ? 'bg-cyan-500 text-slate-950'
                                : 'bg-slate-900 border border-slate-700 text-cyan-400'
                            }`}
                          >
                            <IconComp className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <div className="text-xs font-bold flex items-center gap-1.5">
                              <span>{sub.label}</span>
                              {isSubActive && (
                                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                              )}
                            </div>
                            <p className="text-[11px] text-slate-400 leading-snug mt-0.5">
                              {sub.description}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Sisa Menu Lainnya */}
            {navItemsAfterKegiatan.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id, item.isProtected)}
                  className={`relative px-3 py-2 text-sm font-medium transition-all rounded-lg whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                    isActive
                      ? 'text-cyan-300 bg-cyan-950/40 shadow-inner border border-cyan-500/30'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/40'
                  }`}
                >
                  {item.label}
                  {item.isProtected && !admin.isAuthenticated && (
                    <Lock className="w-3.5 h-3.5 text-amber-400/80" />
                  )}
                  {isActive && (
                    <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-gradient-to-r from-cyan-400 to-teal-400 rounded-full" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Actions Zone (Kanan) */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Tombol Install Aplikasi PWA */}
            <PWAInstallButton />

            {/* Toggle Mode Gelap/Terang */}
            <button
              onClick={onToggleTheme}
              className="p-2.5 rounded-xl border border-slate-800 bg-slate-900/80 text-slate-300 hover:text-cyan-300 hover:border-cyan-500/40 transition-all focus:outline-none"
              title={isDarkMode ? 'Beralih ke Mode Kontras Terang' : 'Beralih ke Mode Gelap'}
              aria-label="Toggle Mode"
            >
              {isDarkMode ? (
                <Moon className="w-4 h-4 text-cyan-300" />
              ) : (
                <Sun className="w-4 h-4 text-amber-400" />
              )}
            </button>

            {/* Tombol Portal Admin */}
            {admin.isAuthenticated ? (
              <div className="flex items-center gap-1 p-1 bg-violet-950/40 border border-violet-500/50 rounded-xl">
                <button
                  onClick={() => handleNavClick('absensi')}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-violet-200 hover:text-white transition-colors"
                  title={`${admin.name} (${admin.role === 'guru_admin' ? 'Pembina Utama' : 'Pengurus IT Club'})`}
                >
                  <UserCheck className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                  <span className="hidden sm:inline max-w-[120px] truncate">
                    {(admin.name || 'Pembina').split(',')[0].split(' ').slice(0, 2).join(' ')}
                  </span>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-mono uppercase bg-violet-500/25 text-violet-200 border border-violet-400/30">
                    {admin.role === 'guru_admin' ? 'Pembina' : 'Pengurus'}
                  </span>
                </button>
                {admin.role === 'guru_admin' && (
                  <button
                    onClick={onOpenAdminModal}
                    className="p-1.5 rounded-lg text-cyan-300 hover:text-white hover:bg-cyan-500/20 transition-colors"
                    title="Kelola Akses Multi-Role (Pembina & Pengurus)"
                  >
                    <Users className="w-3.5 h-3.5" />
                  </button>
                )}
                <button
                  onClick={onLogoutAdmin}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-950/40 transition-colors"
                  title="Keluar Portal Admin"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAdminModal}
                className="relative group px-3.5 py-2 text-xs font-bold text-white rounded-xl border transition-all duration-300 overflow-hidden neon-border-violet bg-gradient-to-r from-violet-950/70 via-slate-900/90 to-violet-950/70 hover:from-violet-900 hover:to-indigo-900 focus:outline-none"
              >
                <div className="flex items-center gap-1.5 relative z-10">
                  <ShieldCheck className="w-3.5 h-3.5 text-violet-400 group-hover:text-cyan-300 transition-colors" />
                  <span className="tracking-wide">Portal Admin</span>
                </div>
              </button>
            )}

            {/* Tombol Aksi Utama "Gabung Club" */}
            <button
              onClick={onOpenJoinModal}
              className="hidden sm:flex items-center gap-1.5 px-4 py-2 text-xs font-extrabold uppercase tracking-wider text-slate-950 bg-gradient-to-r from-cyan-400 via-teal-300 to-cyan-400 rounded-xl hover:opacity-95 transition-all shadow-lg shadow-cyan-500/25 hover:shadow-cyan-400/40 active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5 text-slate-900 fill-slate-900" />
              <span>Gabung Club</span>
            </button>

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2.5 rounded-xl border border-slate-800 bg-slate-900/80 text-slate-300 hover:text-cyan-300 focus:outline-none"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-cyan-900/30 bg-[#0b1120]/95 px-4 pt-3 pb-6 space-y-2 backdrop-blur-xl">
          <div className="grid grid-cols-1 gap-1">
            {/* Beranda */}
            <button
              onClick={() => handleNavClick('beranda')}
              className={`w-full flex items-center justify-between px-4 py-2.5 text-sm font-medium rounded-xl transition-all ${
                activeTab === 'beranda'
                  ? 'bg-cyan-950/60 text-cyan-300 border border-cyan-500/40'
                  : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
              }`}
            >
              <span>Beranda</span>
            </button>

            {/* Group Kegiatan List on Mobile */}
            <div className="rounded-xl border border-slate-800/80 bg-slate-950/50 overflow-hidden">
              <button
                type="button"
                onClick={() => setMobileKegiatanOpen((prev) => !prev)}
                className={`w-full flex items-center justify-between px-4 py-2.5 text-sm font-medium transition-all ${
                  isKegiatanGroupActive
                    ? 'text-cyan-300 bg-cyan-950/40'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <span>Kegiatan &amp; Program</span>
                <ChevronDown
                  className={`w-4 h-4 transition-transform ${
                    mobileKegiatanOpen ? 'rotate-180 text-cyan-400' : ''
                  }`}
                />
              </button>

              {mobileKegiatanOpen && (
                <div className="px-2 pb-2 space-y-1 border-t border-slate-800/60 pt-1.5">
                  {KEGIATAN_SUBMENUS.map((sub) => {
                    const IconComp = sub.icon;
                    const isSubActive = activeTab === sub.id;
                    return (
                      <button
                        key={sub.id}
                        type="button"
                        onClick={() => handleNavClick(sub.id)}
                        className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-medium rounded-lg transition-all ${
                          isSubActive
                            ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                            : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                        }`}
                      >
                        <IconComp className="w-4 h-4 text-cyan-400 shrink-0" />
                        <div className="text-left">
                          <div className="font-bold">{sub.label}</div>
                          <div className="text-[10px] text-slate-400">{sub.description}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Other menu items */}
            {navItemsAfterKegiatan.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id, item.isProtected)}
                  className={`w-full flex items-center justify-between px-4 py-2.5 text-sm font-medium rounded-xl transition-all ${
                    isActive
                      ? 'bg-cyan-950/60 text-cyan-300 border border-cyan-500/40'
                      : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                  }`}
                >
                  <span>{item.label}</span>
                  {item.isProtected && !admin.isAuthenticated && (
                    <span className="flex items-center gap-1 text-[11px] font-mono text-amber-400">
                      <Lock className="w-3 h-3" /> Guru Only
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="pt-2 border-t border-slate-800/80">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenJoinModal();
              }}
              className="w-full flex items-center justify-center gap-2 py-3 text-sm font-bold text-slate-950 bg-gradient-to-r from-cyan-400 to-teal-300 rounded-xl shadow-lg shadow-cyan-500/20"
            >
              <Sparkles className="w-4 h-4" />
              Gabung IT Club 2026/2027
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
