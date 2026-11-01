import React, { useState } from 'react';
import { 
  Play, 
  Terminal, 
  Sparkles, 
  ArrowRight, 
  BookOpen, 
  FolderGit2, 
  Cpu, 
  Layers, 
  CheckCircle2, 
  Copy, 
  Check, 
  RotateCw,
  QrCode,
  Radio
} from 'lucide-react';

interface HeroSectionProps {
  onExplorePortfolio: () => void;
  onExploreModules: () => void;
  onOpenJoinModal: () => void;
  onOpenRfidDemo: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onExplorePortfolio,
  onExploreModules,
  onOpenJoinModal,
  onOpenRfidDemo,
}) => {
  const [isRunningCode, setIsRunningCode] = useState(false);
  const [outputLines, setOutputLines] = useState<string[]>([
    '[INIT] Memuat runtime .NET 8.0 & Lab System...',
    '[READY] Klik tombol ▶ Jalankan untuk eksekusi kode C#',
  ]);
  const [copied, setCopied] = useState(false);

  const codeSnippet = `using System;
using System.Collections.Generic;

namespace ITClubSekolah
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var club = new ITClubLab("Lab Komputer");
            
            // Inisialisasi Divisi & Fasilitas 2026/2027
            club.DaftarkanDivisi("C# .NET Software Dev");
            club.DaftarkanDivisi("Scratch Creative Logic");
            club.DaftarkanDivisi("Python Programming");
            club.DaftarkanDivisi("UI/UX & Desain Grafis");
            club.DaftarkanDivisi("Jaringan MikroTik & IoT");
            
            
            club.MulaiSesiBelajar();
        }
    }
}`;

  const handleRunCode = () => {
    setIsRunningCode(true);
    setOutputLines(['[COMPILING] dotnet build ITClub_Welcome.csproj -c Release...']);

    setTimeout(() => {
      setOutputLines((prev) => [
        ...prev,
        '[BUILD] Build Berhasil! 0 Warning(s), 0 Error(s).',
        '[EXEC] Executing ITClub_Welcome.exe in Lab Komputer 1...',
      ]);
    }, 450);

    setTimeout(() => {
      setOutputLines((prev) => [
        ...prev,
        '-------------------------------------------------------',
        '🚀 SELAMAT DATANG DI IT CLUB & LAB KOMPUTER SEKOLAH',
        '   Status Lab: ONLINE | Switch GigaBit: 1000 Mbps OK',
        '   Presensi: RFID Card & Dynamic QR Code Terhubung',
        '   Divisi Aktif: 5 Kelas (C#, Scratch, Python, Desain, Jaringan)',
        '-------------------------------------------------------',
        '✨ Siswa Siap Berinovasi Digital Menghadapi Masa Depan!',
      ]);
      setIsRunningCode(false);
    }, 950);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(codeSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="relative overflow-hidden pt-10 pb-20 lg:pt-16 lg:pb-28 tech-grid-pattern">
      {/* Ambient background glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-cyan-600/15 via-teal-500/10 to-violet-600/15 blur-[120px] pointer-events-none rounded-full" />
      <div className="absolute top-10 right-10 w-72 h-72 bg-violet-600/10 blur-[100px] pointer-events-none rounded-full" />
      <div className="absolute bottom-10 left-10 w-72 h-72 bg-cyan-600/10 blur-[100px] pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Main Hero Header */}
        <div className="text-center max-w-4xl mx-auto mb-14">
          
          {/* Badge Pengumuman */}
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-slate-900/80 border border-cyan-500/30 text-cyan-200 text-xs sm:text-sm font-medium mb-8 backdrop-blur-md shadow-lg shadow-cyan-950/40">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>Penerimaan Anggota IT Club 2026/2027 Dibuka!</span>
            <button 
              onClick={onOpenJoinModal} 
              className="ml-1 text-teal-300 hover:text-white font-semibold underline underline-offset-2 flex items-center gap-1 transition-colors"
            >
              Daftar Sekarang <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {/* Judul Utama (Headline) */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white mb-6 leading-[1.15]" style={{ textWrap: 'balance' }}>
            Wadah Kreativitas &{' '}
            <span className="bg-gradient-to-r from-cyan-400 via-teal-300 to-violet-400 bg-clip-text text-transparent drop-shadow-sm">
              Inovasi Digital
            </span>{' '}
            Siswa.
          </h1>

          {/* Deskripsi */}
          <p className="text-base sm:text-lg lg:text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed mb-10">
            Pusat pengembangan bakat teknologi sekolah: mulai dari rekayasa perangkat lunak{' '}
            <span className="text-cyan-300 font-semibold">C# .NET</span> &amp;{' '}
            <span className="text-emerald-300 font-semibold">Python Programming</span>, logika komputasi kreatif{' '}
            <span className="text-teal-300 font-semibold">Scratch</span>, estetika{' '}
            <span className="text-violet-300 font-semibold">desain grafis & UI/UX</span>, hingga arsitektur{' '}
            <span className="text-sky-300 font-semibold">jaringan komputer & server</span> sekolah.
          </p>

          {/* Call to Action (CTA) */}
          <div className="flex flex-wrap items-center justify-center gap-4">
            
            {/* Tombol Solid Bercahaya (Jelajahi Karya) */}
            <button
              onClick={onExplorePortfolio}
              className="flex items-center gap-2.5 px-7 py-3.5 rounded-xl font-bold text-sm text-slate-950 bg-gradient-to-r from-cyan-400 via-teal-300 to-cyan-400 hover:from-cyan-300 hover:to-teal-200 transition-all shadow-lg neon-glow-cyan transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <FolderGit2 className="w-4 h-4 text-slate-950" />
              <span>Jelajahi Karya</span>
            </button>

            {/* Tombol Bergaris Luar (Akses Modul) */}
            <button
              onClick={onExploreModules}
              className="flex items-center gap-2.5 px-7 py-3.5 rounded-xl font-semibold text-sm text-cyan-200 border border-cyan-500/40 bg-cyan-950/30 hover:bg-cyan-900/40 hover:border-cyan-400 transition-all backdrop-blur-sm transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <BookOpen className="w-4 h-4 text-cyan-400" />
              <span>Akses Modul</span>
            </button>

            {/* Tombol Cepat Uji Absensi RFID */}
            <button
              onClick={onOpenRfidDemo}
              className="flex items-center gap-2 px-5 py-3.5 rounded-xl font-medium text-xs text-violet-300 border border-violet-500/30 bg-violet-950/20 hover:bg-violet-900/40 hover:border-violet-400 transition-all"
            >
              <Radio className="w-3.5 h-3.5 text-violet-400 animate-pulse" />
              <span>Simulasi Absensi RFID / QR</span>
            </button>
          </div>
        </div>

        {/* Preview Editor / Kontainer Kode IDE */}
        <div className="max-w-4xl mx-auto rounded-2xl border border-cyan-500/30 bg-[#0b1120]/90 backdrop-blur-xl shadow-2xl shadow-cyan-950/60 overflow-hidden">
          
          {/* Header Editor / Tab Bar dengan Tombol Kontrol Jendela (Merah, Kuning, Hijau) */}
          <div className="flex items-center justify-between px-4 py-3 bg-[#080d1a] border-b border-slate-800/80">
            
            {/* Window control dots: Merah, Kuning, Hijau */}
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#ef4444] shadow-sm shadow-red-500/40" title="Close" />
              <span className="w-3 h-3 rounded-full bg-[#eab308] shadow-sm shadow-yellow-500/40" title="Minimize" />
              <span className="w-3 h-3 rounded-full bg-[#22c55e] shadow-sm shadow-green-500/40" title="Maximize" />
              
              {/* Nama Berkas Code Editor */}
              <div className="ml-3 flex items-center gap-2 px-3 py-1 rounded-md bg-[#0f172a] border border-cyan-500/20 text-xs font-mono text-cyan-300">
                <span className="font-bold text-teal-400">#C</span>
                <span>ITClub_Welcome.cs</span>
              </div>
            </div>

            {/* Editor Action Controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyCode}
                className="p-1.5 rounded-md text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors text-xs flex items-center gap-1 font-mono"
                title="Salin Kode"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-teal-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span className="hidden sm:inline">{copied ? 'Tersalin' : 'Salin'}</span>
              </button>

              <button
                onClick={handleRunCode}
                disabled={isRunningCode}
                className="flex items-center gap-1.5 px-3 py-1 text-xs font-mono font-bold text-slate-950 bg-gradient-to-r from-teal-400 to-cyan-400 rounded-md hover:from-teal-300 hover:to-cyan-300 transition-all shadow-md shadow-cyan-500/20 disabled:opacity-50"
              >
                {isRunningCode ? (
                  <RotateCw className="w-3 h-3 animate-spin text-slate-900" />
                ) : (
                  <Play className="w-3 h-3 fill-slate-900 text-slate-900" />
                )}
                <span>{isRunningCode ? 'Kompilasi...' : 'Jalankan'}</span>
              </button>
            </div>
          </div>

          {/* Code Content Area with Line Numbers */}
          <div className="p-4 sm:p-5 font-mono text-xs sm:text-sm overflow-x-auto text-slate-200 leading-relaxed bg-[#0a0f1d]/70">
            <div className="space-y-1">
              <div><span className="text-slate-500 select-none mr-4">01</span><span className="text-violet-400 font-semibold">using</span> System;</div>
              <div><span className="text-slate-500 select-none mr-4">02</span><span className="text-violet-400 font-semibold">using</span> System.Collections.Generic;</div>
              <div><span className="text-slate-500 select-none mr-4">03</span></div>
              <div><span className="text-slate-500 select-none mr-4">04</span><span className="text-violet-400 font-semibold">namespace</span> <span className="text-cyan-300">ITClubSekolah</span></div>
              <div><span className="text-slate-500 select-none mr-4">05</span>&#123;</div>
              <div><span className="text-slate-500 select-none mr-4">06</span>    <span className="text-violet-400 font-semibold">public class</span> <span className="text-teal-300">Program</span></div>
              <div><span className="text-slate-500 select-none mr-4">07</span>    &#123;</div>
              <div><span className="text-slate-500 select-none mr-4">08</span>        <span className="text-violet-400 font-semibold">public static void</span> <span className="text-amber-300">Main</span>(<span className="text-violet-400">string</span>[] args)</div>
              <div><span className="text-slate-500 select-none mr-4">09</span>        &#123;</div>
              <div><span className="text-slate-500 select-none mr-4">10</span>            <span className="text-slate-400">// Inisialisasi Ekosistem Lab & Absensi Terintegrasi</span></div>
              <div><span className="text-slate-500 select-none mr-4">11</span>            <span className="text-violet-400">var</span> lab = <span className="text-violet-400">new</span> <span className="text-teal-300">LabKomputer</span>(<span className="text-emerald-300">"Lab Utama & Multimedia"</span>);</div>
              <div><span className="text-slate-500 select-none mr-4">12</span>            lab.<span className="text-cyan-300">AktifkanAbsensi</span>(<span className="text-amber-200">Metode.RFID_Dan_QRCode</span>);</div>
              <div><span className="text-slate-500 select-none mr-4">13</span></div>
              <div><span className="text-slate-500 select-none mr-4">14</span>            Console.<span className="text-cyan-300">WriteLine</span>(<span className="text-emerald-300">"Wadah Kreativitas &amp; Inovasi Digital Siswa Siap!"</span>);</div>
              <div><span className="text-slate-500 select-none mr-4">15</span>        &#125;</div>
              <div><span className="text-slate-500 select-none mr-4">16</span>    &#125;</div>
              <div><span className="text-slate-500 select-none mr-4">17</span>&#125;</div>
            </div>
          </div>

          {/* Interactive Console Terminal Output */}
          <div className="bg-[#050811] border-t border-slate-800/80 p-4 font-mono text-xs">
            <div className="flex items-center gap-2 text-slate-400 mb-2 text-[11px]">
              <Terminal className="w-3.5 h-3.5 text-cyan-400" />
              <span>TERMINAL OUTPUT / CONSOLE LOG</span>
              <span className="ml-auto text-[10px] text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live Engine
              </span>
            </div>
            <div className="space-y-1 text-slate-300 bg-slate-950/60 p-3 rounded-lg border border-slate-800/60 max-h-36 overflow-y-auto">
              {outputLines.map((line, idx) => (
                <div 
                  key={idx} 
                  className={
                    line.includes('[COMPILING]') ? 'text-amber-400' :
                    line.includes('🚀') || line.includes('✨') ? 'text-cyan-300 font-bold' :
                    line.includes('[BUILD]') ? 'text-emerald-400' :
                    line.includes('Status Lab') ? 'text-teal-300' : 'text-slate-300'
                  }
                >
                  {line}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Feature Highlights Strip below Hero */}
        <div className="mt-14 grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-xl bg-cyan-950/80 border border-cyan-800/60 text-cyan-400">
                <Radio className="w-5 h-5" />
              </div>
              <span className="text-2xl font-mono font-bold text-white tabular-nums">100%</span>
            </div>
            <h4 className="text-sm font-semibold text-slate-200">Absensi RFID &amp; QR</h4>
            <p className="text-xs text-slate-400 mt-1">Sistem presensi nirsentuh terhubung ke portal guru</p>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-xl bg-violet-950/80 border border-violet-800/60 text-violet-400">
                <Cpu className="w-5 h-5" />
              </div>
              <span className="text-2xl font-mono font-bold text-white tabular-nums">18 Unit</span>
            </div>
            <h4 className="text-sm font-semibold text-slate-200">PC High-Spec</h4>
            <p className="text-xs text-slate-400 mt-1">Fasilitas lab komputer ynag lengkap</p>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-xl bg-teal-950/80 border border-teal-800/60 text-teal-400">
                <Layers className="w-5 h-5" />
              </div>
              <span className="text-2xl font-mono font-bold text-white tabular-nums">5 Divisi</span>
            </div>
            <h4 className="text-sm font-semibold text-slate-200">Spesialisasi Club</h4>
            <p className="text-xs text-slate-400 mt-1">Python, C# .NET, Scratch, Desain UI/UX &amp; Jaringan</p>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-xl bg-emerald-950/80 border border-emerald-800/60 text-emerald-400">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <span className="text-2xl font-mono font-bold text-emerald-300 tabular-nums">Aktif</span>
            </div>
            <h4 className="text-sm font-semibold text-slate-200">Kartu Pintar Siswa</h4>
            <p className="text-xs text-slate-400 mt-1">Cetak kartu identitas ber-chip RFID &amp; QR resmi</p>
          </div>
        </div>

      </div>
    </section>
  );
};
