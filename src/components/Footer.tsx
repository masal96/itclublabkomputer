import React from 'react';
import { Code2, ShieldCheck, Mail, MapPin, Phone, Github, Terminal, Radio } from 'lucide-react';

interface FooterProps {
  setActiveTab: (tab: string) => void;
  onOpenAdminModal: () => void;
  onOpenJoinModal: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  setActiveTab,
  onOpenAdminModal,
  onOpenJoinModal,
}) => {
  return (
    <footer className="border-t border-cyan-900/40 bg-[#060911] text-slate-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
          
          {/* Brand & Mission */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 via-teal-500 to-violet-600 p-[1.5px]">
                <div className="w-full h-full bg-[#080c16] rounded-[9px] flex items-center justify-center">
                  <Code2 className="w-5 h-5 text-cyan-400" />
                </div>
              </div>
              <div>
                <span className="text-lg font-bold text-white tracking-tight">IT CLUB</span>
                <span className="block text-xs font-mono text-cyan-400">&lt;LabKomputer/&gt;</span>
              </div>
            </div>

            <p className="text-slate-400 leading-relaxed max-w-sm">
              Laboratorium Komputer &amp; Ekstrakurikuler IT Club Sekolah. Wadah pengembangan kompetensi digital: C# .NET, Scratch, Desain UI/UX, dan Jaringan Komputer.
            </p>

            <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400">
              <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
              <span>Sistem Presensi RFID 13.56 MHz &amp; Dynamic QR Aktif</span>
            </div>
          </div>

          {/* Navigasi Cepat */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3 font-mono">
              Navigasi Halaman
            </h4>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => setActiveTab('beranda')}
                  className="hover:text-cyan-300 transition-colors"
                >
                  Beranda Utama
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('kegiatan')}
                  className="hover:text-cyan-300 transition-colors"
                >
                  Kegiatan &amp; Event
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('pembelajaran')}
                  className="hover:text-cyan-300 transition-colors"
                >
                  Modul Pembelajaran
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('portofolio')}
                  className="hover:text-cyan-300 transition-colors"
                >
                  Galeri Portofolio
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('jadwal')}
                  className="hover:text-cyan-300 transition-colors"
                >
                  Jadwal Laboratorium
                </button>
              </li>
            </ul>
          </div>

          {/* Fasilitas & Portal */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3 font-mono">
              Layanan Khusus
            </h4>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => setActiveTab('absensi')}
                  className="hover:text-cyan-300 transition-colors flex items-center gap-1.5"
                >
                  <span>Absensi RFID &amp; QR</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('kartu')}
                  className="hover:text-cyan-300 transition-colors"
                >
                  Cetak Kartu Siswa
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('anggota')}
                  className="hover:text-cyan-300 transition-colors flex items-center gap-1.5"
                >
                  <span>Data Anggota (Guru)</span>
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenAdminModal}
                  className="hover:text-violet-300 transition-colors text-violet-400 flex items-center gap-1.5"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Portal Login Guru</span>
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenJoinModal}
                  className="text-teal-300 hover:text-teal-200 transition-colors font-semibold"
                >
                  Pendaftaran Anggota
                </button>
              </li>
            </ul>
          </div>

          {/* Alamat & Kontak Lab */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3 font-mono">
              Lokasi &amp; Kontak
            </h4>
            <div className="space-y-2.5 text-slate-400">
              <div className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                <span>Gedung Multimedia &amp; TI, Lantai 2, Ruang Lab Komputer</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                <span>itclub@labkomputer.sch.id</span>
              </div>
              <div className="flex items-center gap-2 font-mono">
                <Phone className="w-3.5 h-3.5 text-violet-400 shrink-0" />
                <span>(+62) 0857 3173 1051 / ext. 204</span>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <div>
            &copy; 2026 Laboratorium Komputer &amp; IT Club Sekolah. Seluruh hak cipta dilindungi.
          </div>
          <div className="flex items-center gap-4">
            <span className="font-mono text-cyan-400">Teknologi: C# .NET · RFID · React · IoT</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
