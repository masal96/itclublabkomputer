import React, { useState } from 'react';
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
  CreditCard
} from 'lucide-react';
import { AdminUser } from '../types';

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

  const navItems = [
    { id: 'beranda', label: 'Beranda' },
    { id: 'kegiatan', label: 'Kegiatan' },
    { id: 'pembelajaran', label: 'Pembelajaran' },
    { id: 'portofolio', label: 'Portofolio' },
    { id: 'jadwal', label: 'Jadwal' },
    { 
      id: 'absensi', 
      label: 'Absensi (QR & RFID)', 
      isProtected: true 
    },
    { 
      id: 'kartu', 
      label: 'Cetak Kartu', 
      isProtected: true 
    },
    { 
      id: 'anggota', 
      label: 'Data Anggota', 
      isProtected: true 
    },
  ];

  const handleNavClick = (id: string, isProtected?: boolean) => {
    if (isProtected && !admin.isAuthenticated) {
      onOpenAdminModal();
    } else {
      setActiveTab(id);
    }
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-cyan-900/30 bg-[#080c16]/90 backdrop-blur-md transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          
          {/* Brand Zone (Kiri) */}
          <button 
            onClick={() => setActiveTab('beranda')}
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
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id, item.isProtected)}
                  className={`relative px-3 py-2 text-sm font-medium transition-all rounded-lg whitespace-nowrap flex items-center gap-1.5 ${
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
          <div className="flex items-center gap-2 sm:gap-3">
            
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

            {/* Tombol Berpendar "Portal Admin" */}
            {admin.isAuthenticated ? (
              <div className="flex items-center gap-1.5 p-1 bg-violet-950/40 border border-violet-500/50 rounded-xl">
                <button
                  onClick={() => setActiveTab('absensi')}
                  className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-violet-200 hover:text-white transition-colors"
                >
                  <UserCheck className="w-3.5 h-3.5 text-teal-400" />
                  <span className="hidden sm:inline">Pak Al (Guru)</span>
                  <span className="sm:hidden">Guru</span>
                </button>
                <button
                  onClick={onLogoutAdmin}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-950/40 transition-colors"
                  title="Keluar Portal Guru"
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
            {navItems.map((item) => {
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
