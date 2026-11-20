import React, { useEffect, useState } from 'react';
import {
  ShieldCheck,
  Search,
  X,
  CheckCircle2,
  XCircle,
  Award,
  Calendar,
  User,
  Code2,
} from 'lucide-react';
import { StudentAssessment } from '../types';

interface CertificateVerifyModalProps {
  isOpen: boolean;
  initialCode?: string;
  assessments: StudentAssessment[];
  onClose: () => void;
}

export const CertificateVerifyModal: React.FC<CertificateVerifyModalProps> = ({
  isOpen,
  initialCode = '',
  assessments,
  onClose,
}) => {
  const [codeInput, setCodeInput] = useState(initialCode);
  const [checked, setChecked] = useState(false);
  const [matchedReport, setMatchedReport] = useState<StudentAssessment | null>(null);
  const [loadingApi, setLoadingApi] = useState(false);

  const runVerification = async (rawCode: string) => {
    const clean = rawCode.trim().toUpperCase();
    if (!clean) return;
    setChecked(false);
    setLoadingApi(true);

    // 1. Check live local assessments first
    const localHit = assessments.find((a) => {
      const expected = `CERT-${a.nisn}-${a.assessmentDate.replace(/-/g, '')}`.toUpperCase();
      return expected === clean || a.id.toUpperCase() === clean;
    });

    if (localHit) {
      setMatchedReport(localHit);
      setChecked(true);
      setLoadingApi(false);
      return;
    }

    // 2. Fall back to server API lookup
    try {
      const res = await fetch(`/api/certificate/verify/${encodeURIComponent(clean)}`);
      if (res.ok) {
        const json = await res.json();
        if (json.verified && json.data) {
          setMatchedReport(json.data as StudentAssessment);
          setChecked(true);
          setLoadingApi(false);
          return;
        }
      }
    } catch {
      // ignore network error
    }

    setMatchedReport(null);
    setChecked(true);
    setLoadingApi(false);
  };

  useEffect(() => {
    if (isOpen && initialCode) {
      setCodeInput(initialCode);
      runVerification(initialCode);
    }
  }, [isOpen, initialCode, assessments]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
      <div className="relative w-full max-w-lg rounded-2xl bg-[#0b1120] border border-cyan-500/40 p-6 sm:p-7 shadow-2xl max-h-[90vh] overflow-y-auto">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-extrabold text-white">Verifikasi Keaslian E-Sertifikat</h3>
            <p className="text-xs text-slate-400">
              Validasi kode registrasi QR dari E-Sertifikat resmi Lab Komputer &amp; IT Club.
            </p>
          </div>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            runVerification(codeInput);
          }}
          className="flex gap-2 mb-5"
        >
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={codeInput}
              onChange={(e) => setCodeInput(e.target.value)}
              placeholder="Contoh: CERT-24251001-20260220"
              className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white font-mono focus:border-cyan-400 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={loadingApi}
            className="px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-extrabold disabled:opacity-50"
          >
            {loadingApi ? 'Mengecek...' : 'Cek'}
          </button>
        </form>

        {checked && matchedReport && (
          <div className="rounded-2xl bg-emerald-950/30 border border-emerald-500/50 p-5 space-y-4">
            <div className="flex items-center gap-2.5 text-emerald-300">
              <CheckCircle2 className="w-6 h-6 shrink-0" />
              <div>
                <div className="text-sm font-extrabold">SERTIFIKAT RESMI TERVERIFIKASI</div>
                <div className="text-[11px] font-mono text-emerald-200/80">
                  NO. REG: CERT-{matchedReport.nisn}-{matchedReport.assessmentDate.replace(/-/g, '')}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-3 border-t border-emerald-500/20">
              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                <div className="text-[10px] text-slate-400 flex items-center gap-1 mb-0.5">
                  <User className="w-3 h-3" /> Nama Penerima
                </div>
                <div className="font-bold text-white">{matchedReport.studentName}</div>
                <div className="text-[11px] text-slate-400 font-mono">
                  NIS: {matchedReport.nisn} · {matchedReport.class}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                <div className="text-[10px] text-slate-400 flex items-center gap-1 mb-0.5">
                  <Code2 className="w-3 h-3" /> Divisi &amp; Periode
                </div>
                <div className="font-bold text-cyan-300">{matchedReport.division}</div>
                <div className="text-[11px] text-slate-400">{matchedReport.period}</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                <div className="text-[10px] text-slate-400 flex items-center gap-1 mb-0.5">
                  <Award className="w-3 h-3" /> Nilai Akhir &amp; Predikat
                </div>
                <div className="font-extrabold text-emerald-300 font-mono">
                  {matchedReport.finalScore}/100 · Predikat {matchedReport.grade}
                </div>
                <div className="text-[11px] text-slate-300">{matchedReport.predicate}</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                <div className="text-[10px] text-slate-400 flex items-center gap-1 mb-0.5">
                  <Calendar className="w-3 h-3" /> Tanggal &amp; Pengesah
                </div>
                <div className="font-bold text-white">{matchedReport.assessmentDate}</div>
                <div className="text-[11px] text-slate-400">{matchedReport.instructorName}</div>
              </div>
            </div>
          </div>
        )}

        {checked && !matchedReport && (
          <div className="rounded-2xl bg-rose-950/35 border border-rose-500/40 p-5 flex items-start gap-3 text-rose-200">
            <XCircle className="w-6 h-6 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <div className="text-sm font-bold">Kode Sertifikat Tidak Ditemukan</div>
              <p className="text-xs text-rose-200/80 mt-1">
                Pastikan nomor registrasi yang dimasukkan sama persis seperti yang tertera pada E-Sertifikat (contoh: <code className="font-mono">CERT-24251001-20260220</code>).
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
