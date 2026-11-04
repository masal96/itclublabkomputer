import React, { useState } from 'react';
import { 
  BookOpen, 
  Code, 
  Terminal, 
  FileText, 
  CheckCircle2, 
  Download, 
  Play, 
  ChevronRight, 
  Layers, 
  Monitor, 
  Cpu, 
  Sparkles,
  X,
  Copy,
  Check
} from 'lucide-react';
import { LearningModule } from '../types';

interface PembelajaranSectionProps {
  modules: LearningModule[];
}

export const PembelajaranSection: React.FC<PembelajaranSectionProps> = ({ modules }) => {
  const [activeModule, setActiveModule] = useState<LearningModule | null>(null);
  const [copied, setCopied] = useState(false);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-12">
        <div className="inline-flex items-center gap-2 text-cyan-400 font-mono text-xs uppercase tracking-wider mb-2">
          <BookOpen className="w-4 h-4" />
          <span>Kurikulum &amp; Silabus Laboratorium</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Modul Pembelajaran Mandiri &amp; Praktikum
        </h2>
        <p className="text-sm sm:text-base text-slate-400 mt-2">
          Struktur materi terstandar untuk membimbing siswa dari nol hingga siap bersaing di kompetisi LKS dan industri teknologi.
        </p>
      </div>

      {/* Modules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
        {modules.map((mod) => (
          <div
            key={mod.id}
            className="rounded-2xl bg-[#0b1120] border border-slate-800 hover:border-cyan-500/40 p-6 sm:p-7 shadow-xl transition-all flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-cyan-950/80 border border-cyan-500/30 flex items-center justify-center text-cyan-300 group-hover:scale-110 transition-transform">
                  {mod.track === 'C# .NET' && <Code className="w-6 h-6 text-cyan-400" />}
                  {mod.track === 'Python Programming' && <Terminal className="w-6 h-6 text-emerald-400" />}
                  {mod.track === 'Scratch' && <Play className="w-6 h-6 text-teal-400" />}
                  {mod.track === 'Desain Grafis' && <Monitor className="w-6 h-6 text-violet-400" />}
                  {mod.track === 'Jaringan Komputer' && <Cpu className="w-6 h-6 text-sky-400" />}
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded text-[11px] font-mono font-bold bg-slate-900 text-slate-300 border border-slate-800">
                    {mod.level}
                  </span>
                  <span className="px-2.5 py-0.5 rounded text-[11px] font-mono text-cyan-400 bg-cyan-950/50 border border-cyan-800/40">
                    {mod.lessons} Pertemuan
                  </span>
                </div>
              </div>

              <h3 className="text-lg font-bold text-white group-hover:text-cyan-300 transition-colors mb-2">
                {mod.title}
              </h3>

              <p className="text-xs text-slate-400 leading-relaxed mb-6">
                {mod.description}
              </p>

              {/* Syllabus Preview */}
              <div className="space-y-2 mb-6">
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

            <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between">
              <span className="text-xs text-slate-500 font-mono">
                Durasi: {mod.duration}
              </span>

              <button
                onClick={() => setActiveModule(mod)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/30 text-xs font-bold text-cyan-300 transition-all group-hover:border-cyan-400"
              >
                <span>Buka Silabus Lengkap</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* DETAIL SYLLABUS & STARTER CODE MODAL */}
      {activeModule && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-2xl rounded-2xl bg-[#0b1120] border border-cyan-500/40 p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
            <button
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
                Silabus Modul (6 - 12 Sesi)
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
                    Starter Template Code (C# .NET)
                  </span>
                  <button
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

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
              <a
                href="https://sfl.gl/eXMZXIfr"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-200 transition-colors"
              >
                <Download className="w-4 h-4 text-cyan-400" />
                <span>Unduh Modul PDF</span>
              </a>
              <button
                onClick={() => setActiveModule(null)}
                className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold transition-all"
              >
                Tutup
              </button>
            </div>

          </div>
        </div>
      )}

    </section>
  );
};
