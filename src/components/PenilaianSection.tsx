import React, { useState, useMemo, useEffect } from 'react';
import {
  Award,
  Search,
  Printer,
  Plus,
  Edit3,
  Trash2,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  MessageCircle,
  FileSpreadsheet,
  Calculator,
  BookOpen,
  UserCheck,
  Sparkles,
  Copy,
  Check,
  ExternalLink,
  X,
  Lock,
  Calendar,
  Wrench,
  Download,
} from 'lucide-react';
import {
  AdminUser,
  Student,
  AttendanceRecord,
  StudentAssessment,
} from '../types';
import {
  getWhatsAppConfig,
  generateAssessmentWhatsAppMessage,
  sendAssessmentWhatsAppNotification,
} from '../utils/whatsapp';

interface PenilaianSectionProps {
  admin: AdminUser;
  students: Student[];
  attendanceRecords: AttendanceRecord[];
  assessments: StudentAssessment[];
  onAddAssessment: (assessment: StudentAssessment) => Promise<void> | void;
  onUpdateAssessment: (assessment: StudentAssessment) => Promise<void> | void;
  onDeleteAssessment: (id: string) => Promise<void> | void;
  onOpenAdminModal: () => void;
}

const PERIOD_OPTIONS = [
  'Semester Ganjil 2026/2027',
  'Evaluasi Tengah Semester Ganjil 2026/2027',
  'Semester Genap 2026/2027',
  'Evaluasi Proyek / Bootcamp 2026',
];

export function calculateFinalScore(
  attendanceScore: number,
  materialScore: number,
  practiceScore: number,
  creativityScore: number
): number {
  return Math.round(
    attendanceScore * 0.2 +
      materialScore * 0.25 +
      practiceScore * 0.35 +
      creativityScore * 0.2
  );
}

export function getGradeInfo(score: number): {
  grade: 'A' | 'B' | 'C' | 'D';
  predicate: string;
  label: string;
  accentClass: string;
} {
  if (score >= 88) {
    return {
      grade: 'A',
      predicate: 'Sangat Baik (Kompeten Unggul)',
      label: 'UNGGUL',
      accentClass: 'text-emerald-300 border-emerald-500/40 bg-emerald-950/50',
    };
  }
  if (score >= 75) {
    return {
      grade: 'B',
      predicate: 'Baik (Kompeten)',
      label: 'KOMPETEN',
      accentClass: 'text-cyan-300 border-cyan-500/40 bg-cyan-950/50',
    };
  }
  if (score >= 60) {
    return {
      grade: 'C',
      predicate: 'Cukup (Perlu Pembinaan)',
      label: 'CUKUP',
      accentClass: 'text-amber-300 border-amber-500/40 bg-amber-950/50',
    };
  }
  return {
    grade: 'D',
    predicate: 'Kurang (Butuh Pendampingan)',
    label: 'PERLU BIMBINGAN',
    accentClass: 'text-rose-300 border-rose-500/40 bg-rose-950/50',
  };
}

function getScoreDescriptor(score: number): { text: string; barColor: string; textColor: string } {
  if (score >= 88) {
    return { text: 'Sangat Baik', barColor: 'bg-emerald-400', textColor: 'text-emerald-300' };
  }
  if (score >= 75) {
    return { text: 'Baik', barColor: 'bg-cyan-400', textColor: 'text-cyan-300' };
  }
  if (score >= 60) {
    return { text: 'Cukup', barColor: 'bg-amber-400', textColor: 'text-amber-300' };
  }
  return { text: 'Perlu Bimbingan', barColor: 'bg-rose-400', textColor: 'text-rose-300' };
}

export const PenilaianSection: React.FC<PenilaianSectionProps> = ({
  admin,
  students,
  attendanceRecords,
  assessments,
  onAddAssessment,
  onUpdateAssessment,
  onDeleteAssessment,
  onOpenAdminModal,
}) => {
  // Active sub-mode: 'parent' (Rapor Wali Murid) or 'teacher' (Kelola Nilai Guru)
  const [viewMode, setViewMode] = useState<'parent' | 'teacher'>(
    admin.isAuthenticated ? 'teacher' : 'parent'
  );

  // Sync default mode when admin logs out
  useEffect(() => {
    if (!admin.isAuthenticated && viewMode === 'teacher') {
      setViewMode('parent');
    }
  }, [admin.isAuthenticated, viewMode]);

  // Parent portal search & selection
  const [parentSearch, setParentSearch] = useState<string>('');
  const [selectedAssessmentId, setSelectedAssessmentId] = useState<string>('');
  const [copiedSummary, setCopiedSummary] = useState<boolean>(false);

  // Teacher dashboard filters
  const [teacherSearch, setTeacherSearch] = useState<string>('');
  const [filterDivision, setFilterDivision] = useState<string>('Semua');
  const [filterPeriod, setFilterPeriod] = useState<string>('Semua');
  const [filterStatus, setFilterStatus] = useState<'all' | 'published' | 'draft'>('all');

  // Inline delete confirm state
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Toast / status banner for WhatsApp & Save feedback
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error' | 'info';
    text: string;
    waUrl?: string;
  } | null>(null);

  const [sendingWaId, setSendingWaId] = useState<string | null>(null);
  const [certificateReport, setCertificateReport] = useState<StudentAssessment | null>(null);

  const handleDownloadCertificatePng = (report: StudentAssessment) => {
    const canvas = document.createElement('canvas');
    canvas.width = 1600;
    canvas.height = 1130;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const drawRoundedRect = (
      x: number,
      y: number,
      w: number,
      h: number,
      r: number
    ) => {
      const radius = Math.min(r, w / 2, h / 2);
      ctx.beginPath();
      ctx.moveTo(x + radius, y);
      ctx.lineTo(x + w - radius, y);
      ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
      ctx.lineTo(x + w, y + h - radius);
      ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
      ctx.lineTo(x + radius, y + h);
      ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
      ctx.lineTo(x, y + radius);
      ctx.quadraticCurveTo(x, y, x + radius, y);
      ctx.closePath();
    };

    // Dark elegant tech certificate backdrop
    const grad = ctx.createLinearGradient(0, 0, 1600, 1130);
    grad.addColorStop(0, '#070b14');
    grad.addColorStop(0.5, '#0b1426');
    grad.addColorStop(1, '#091020');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1600, 1130);

    // Subtle grid lines
    ctx.strokeStyle = 'rgba(6, 182, 212, 0.06)';
    ctx.lineWidth = 1;
    for (let x = 0; x <= 1600; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 1130);
      ctx.stroke();
    }
    for (let y = 0; y <= 1130; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(1600, y);
      ctx.stroke();
    }

    // Outer & Inner Ornamental Borders
    ctx.strokeStyle = '#06b6d4';
    ctx.lineWidth = 6;
    ctx.strokeRect(42, 42, 1516, 1046);
    ctx.strokeStyle = 'rgba(20, 184, 166, 0.45)';
    ctx.lineWidth = 2;
    ctx.strokeRect(60, 60, 1480, 1010);

    // Header Badge (measured dynamically so text always fits with clean padding)
    const badgeText = 'IT CLUB & LAB KOMPUTER SEKOLAH';
    ctx.font = 'bold 20px monospace';
    ctx.textAlign = 'center';
    const badgeWidth = Math.max(520, Math.ceil(ctx.measureText(badgeText).width) + 96);
    const badgeX = 800 - badgeWidth / 2;
    drawRoundedRect(badgeX, 110, badgeWidth, 48, 8);
    ctx.fillStyle = '#0f2942';
    ctx.fill();
    ctx.strokeStyle = 'rgba(6, 182, 212, 0.6)';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.fillStyle = '#67e8f9';
    ctx.fillText(badgeText, 800, 141, badgeWidth - 40);

    // Main Title
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 64px sans-serif';
    ctx.fillText('SERTIFIKAT KOMPETENSI', 800, 245);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '24px monospace';
    ctx.fillText(`NO. REG: CERT-${report.nisn}-${report.assessmentDate.replace(/-/g, '')}`, 800, 292);

    ctx.fillStyle = '#cbd5e1';
    ctx.font = '26px sans-serif';
    ctx.fillText('Diberikan dengan bangga kepada:', 800, 380);

    // Student Name (auto-fit font size for long names)
    const upperName = report.studentName.toUpperCase();
    let nameFontSize = 58;
    ctx.font = `bold ${nameFontSize}px sans-serif`;
    while (ctx.measureText(upperName).width > 1220 && nameFontSize > 36) {
      nameFontSize -= 2;
      ctx.font = `bold ${nameFontSize}px sans-serif`;
    }
    const measuredNameWidth = ctx.measureText(upperName).width;
    ctx.fillStyle = '#22d3ee';
    ctx.fillText(upperName, 800, 460, 1280);

    // Accent underline matching name width cleanly
    const lineHalf = Math.min(580, Math.max(260, Math.ceil(measuredNameWidth / 2) + 70));
    ctx.strokeStyle = '#14b8a6';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(800 - lineHalf, 485);
    ctx.lineTo(800 + lineHalf, 485);
    ctx.stroke();

    // Student Identity
    ctx.fillStyle = '#e2e8f0';
    ctx.font = '26px sans-serif';
    ctx.fillText(`NISN: ${report.nisn}   ·   ${report.class}`, 800, 535);

    ctx.fillStyle = '#cbd5e1';
    ctx.font = '25px sans-serif';
    ctx.fillText('Telah menyelesaikan program pelatihan & praktikum IT Club pada Divisi:', 800, 610);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 38px sans-serif';
    ctx.fillText(report.division, 800, 665, 1300);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '23px sans-serif';
    ctx.fillText(
      `${report.period}  |  Karya Utama: ${report.projectTitle || '-'}`,
      800,
      718,
      1340
    );

    // Score & Grade Box (dynamically sized to prevent text overflow)
    const scoreLine = `NILAI AKHIR: ${report.finalScore}/100  ·  PREDIKAT ${report.grade}`;
    const predicateLine = report.predicate || '';

    const gradeColorMap: Record<string, { border: string; text: string; bg: string }> = {
      A: { border: '#10b981', text: '#6ee7b7', bg: '#071a18' },
      B: { border: '#06b6d4', text: '#67e8f9', bg: '#081726' },
      C: { border: '#f59e0b', text: '#fcd34d', bg: '#1c1508' },
      D: { border: '#f43f5e', text: '#fda4af', bg: '#1e0b14' },
    };
    const palette = gradeColorMap[report.grade] || gradeColorMap.A;

    ctx.font = 'bold 30px monospace';
    const scoreTextWidth = ctx.measureText(scoreLine).width;
    ctx.font = '20px sans-serif';
    const predTextWidth = ctx.measureText(predicateLine).width;

    const maxContentWidth = Math.max(scoreTextWidth, predTextWidth);
    const boxWidth = Math.min(1320, Math.max(760, Math.ceil(maxContentWidth) + 140));
    const boxHeight = 108;
    const boxX = Math.round(800 - boxWidth / 2);
    const boxY = 756;

    drawRoundedRect(boxX, boxY, boxWidth, boxHeight, 14);
    ctx.fillStyle = palette.bg;
    ctx.fill();
    ctx.strokeStyle = palette.border;
    ctx.lineWidth = 2.5;
    ctx.stroke();

    ctx.fillStyle = palette.text;
    ctx.font = 'bold 30px monospace';
    ctx.fillText(scoreLine, 800, boxY + 46, boxWidth - 64);

    ctx.fillStyle = '#cbd5e1';
    ctx.font = '20px sans-serif';
    ctx.fillText(predicateLine, 800, boxY + 82, boxWidth - 64);

    // Signatures
    ctx.textAlign = 'left';
    ctx.fillStyle = '#94a3b8';
    ctx.font = '20px sans-serif';
    ctx.fillText('Tanggal Evaluasi', 160, 935);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 24px monospace';
    ctx.fillText(report.assessmentDate, 160, 975);

    ctx.textAlign = 'right';
    ctx.fillStyle = '#94a3b8';
    ctx.font = '20px sans-serif';
    ctx.fillText('Pembina Laboratorium Komputer & IT Club', 1440, 935);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 26px sans-serif';
    ctx.fillText(report.instructorName || 'Pembina IT Club', 1440, 1008);

    const link = document.createElement('a');
    link.download = `E-Sertifikat_ITClub_${report.studentName.replace(/\s+/g, '_')}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  // Modal state for Add / Edit Assessment
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formStudentId, setFormStudentId] = useState<string>('');
  const [formPeriod, setFormPeriod] = useState<string>(PERIOD_OPTIONS[0]);
  const [formDate, setFormDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [formAttendance, setFormAttendance] = useState<number>(90);
  const [formMaterial, setFormMaterial] = useState<number>(85);
  const [formPractice, setFormPractice] = useState<number>(88);
  const [formCreativity, setFormCreativity] = useState<number>(86);
  const [formProjectTitle, setFormProjectTitle] = useState<string>('');
  const [formCoachNotes, setFormCoachNotes] = useState<string>('');
  const [formRecommendation, setFormRecommendation] = useState<string>('');
  const [formInstructor, setFormInstructor] = useState<string>(
    admin.name || 'Hendra Pratama, S.Kom'
  );
  const [formPublished, setFormPublished] = useState<boolean>(true);
  const [formSendWaOnSave, setFormSendWaOnSave] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Published assessments for parents (teachers can preview drafts too if they select directly)
  const visibleForParent = useMemo(() => {
    return admin.isAuthenticated
      ? assessments
      : assessments.filter((a) => a.published !== false);
  }, [assessments, admin.isAuthenticated]);

  const parentMatchingList = useMemo(() => {
    const q = parentSearch.trim().toLowerCase();
    if (!q) return visibleForParent;
    return visibleForParent.filter(
      (a) =>
        a.nisn.toLowerCase().includes(q) ||
        a.studentName.toLowerCase().includes(q) ||
        a.class.toLowerCase().includes(q) ||
        a.division.toLowerCase().includes(q)
    );
  }, [visibleForParent, parentSearch]);

  const activeReport: StudentAssessment | undefined = useMemo(() => {
    if (parentMatchingList.length === 0) return undefined;
    const matchedSelected = parentMatchingList.find((a) => a.id === selectedAssessmentId);
    return matchedSelected || parentMatchingList[0];
  }, [parentMatchingList, selectedAssessmentId]);

  const activeReportStudent: Student | undefined = useMemo(() => {
    if (!activeReport) return undefined;
    return students.find(
      (s) => s.id === activeReport.studentId || s.nisn === activeReport.nisn
    );
  }, [activeReport, students]);

  // Compute attendance breakdown for a student
  const getStudentAttendanceStats = (studentId: string, nisn: string) => {
    const logs = attendanceRecords.filter(
      (r) => r.studentId === studentId || r.nisn === nisn
    );
    const hadir = logs.filter((r) => r.status === 'Hadir').length;
    const terlambat = logs.filter((r) => r.status === 'Terlambat').length;
    const izin = logs.filter((r) => r.status === 'Izin').length;
    const total = logs.length;
    const computedScore =
      total === 0
        ? 85
        : Math.min(
            100,
            Math.max(60, Math.round(((hadir + izin * 0.8 + terlambat * 0.7) / total) * 100))
          );
    return { total, hadir, terlambat, izin, computedScore };
  };

  const activeAttendanceStats = useMemo(() => {
    if (!activeReport) return { total: 0, hadir: 0, terlambat: 0, izin: 0, computedScore: 85 };
    return getStudentAttendanceStats(activeReport.studentId, activeReport.nisn);
  }, [activeReport, attendanceRecords]);

  // Teacher KPIs
  const teacherStats = useMemo(() => {
    const total = assessments.length;
    const avg =
      total > 0
        ? Math.round(assessments.reduce((acc, a) => acc + a.finalScore, 0) / total)
        : 0;
    const gradeACount = assessments.filter((a) => a.grade === 'A').length;
    const publishedCount = assessments.filter((a) => a.published).length;
    return { total, avg, gradeACount, publishedCount };
  }, [assessments]);

  const filteredTeacherAssessments = useMemo(() => {
    const q = teacherSearch.trim().toLowerCase();
    return assessments.filter((a) => {
      const matchQuery =
        !q ||
        a.studentName.toLowerCase().includes(q) ||
        a.nisn.toLowerCase().includes(q) ||
        a.projectTitle.toLowerCase().includes(q);
      const matchDivision = filterDivision === 'Semua' || a.division === filterDivision;
      const matchPeriod = filterPeriod === 'Semua' || a.period === filterPeriod;
      const matchStatus =
        filterStatus === 'all' ||
        (filterStatus === 'published' && a.published) ||
        (filterStatus === 'draft' && !a.published);
      return matchQuery && matchDivision && matchPeriod && matchStatus;
    });
  }, [assessments, teacherSearch, filterDivision, filterPeriod, filterStatus]);

  // Modal Open Helpers
  const openCreateModal = () => {
    const firstStudent = students[0];
    setEditingId(null);
    setFormStudentId(firstStudent?.id || '');
    setFormPeriod(PERIOD_OPTIONS[0]);
    setFormDate(new Date().toISOString().split('T')[0]);
    if (firstStudent) {
      const stats = getStudentAttendanceStats(firstStudent.id, firstStudent.nisn);
      setFormAttendance(stats.computedScore);
    } else {
      setFormAttendance(90);
    }
    setFormMaterial(85);
    setFormPractice(88);
    setFormCreativity(86);
    setFormProjectTitle('');
    setFormCoachNotes('');
    setFormRecommendation('');
    setFormInstructor(admin.name || 'Hendra Pratama, S.Kom');
    setFormPublished(true);
    setFormSendWaOnSave(false);
    setModalOpen(true);
  };

  const openEditModal = (a: StudentAssessment) => {
    setEditingId(a.id);
    setFormStudentId(a.studentId);
    setFormPeriod(a.period);
    setFormDate(a.assessmentDate);
    setFormAttendance(a.attendanceScore);
    setFormMaterial(a.materialScore);
    setFormPractice(a.practiceScore);
    setFormCreativity(a.creativityScore);
    setFormProjectTitle(a.projectTitle);
    setFormCoachNotes(a.coachNotes);
    setFormRecommendation(a.recommendation);
    setFormInstructor(a.instructorName);
    setFormPublished(a.published);
    setFormSendWaOnSave(false);
    setModalOpen(true);
  };

  const handleAutoCalculateAttendance = () => {
    const std = students.find((s) => s.id === formStudentId);
    if (!std) return;
    const stats = getStudentAttendanceStats(std.id, std.nisn);
    setFormAttendance(stats.computedScore);
  };

  const previewFinalScore = calculateFinalScore(
    formAttendance,
    formMaterial,
    formPractice,
    formCreativity
  );
  const previewGradeInfo = getGradeInfo(previewFinalScore);

  const handleSaveForm = async (e: React.FormEvent) => {
    e.preventDefault();
    const std = students.find((s) => s.id === formStudentId);
    if (!std) {
      setFeedback({ type: 'error', text: 'Pilih siswa anggota IT Club terlebih dahulu.' });
      return;
    }

    setIsSaving(true);
    try {
      const nowIso = new Date().toISOString();
      const existing = editingId ? assessments.find((x) => x.id === editingId) : undefined;

      const payload: StudentAssessment = {
        id: editingId || `asmt-${Date.now()}`,
        studentId: std.id,
        studentName: std.name,
        nisn: std.nisn,
        class: std.class,
        division: std.division,
        period: formPeriod,
        assessmentDate: formDate,
        attendanceScore: formAttendance,
        materialScore: formMaterial,
        practiceScore: formPractice,
        creativityScore: formCreativity,
        finalScore: previewFinalScore,
        grade: previewGradeInfo.grade,
        predicate: previewGradeInfo.predicate,
        projectTitle: formProjectTitle.trim() || `Praktikum Divisi ${std.division}`,
        coachNotes:
          formCoachNotes.trim() ||
          'Ananda mengikuti kegiatan praktikum dan pembelajaran IT Club dengan baik.',
        recommendation:
          formRecommendation.trim() ||
          'Teruskan latihan proyek mandiri untuk memperkuat portofolio digital.',
        instructorName: formInstructor.trim() || 'Pembina IT Club',
        published: formPublished,
        waSent: existing?.waSent || false,
        waSentAt: existing?.waSentAt,
        updatedAt: nowIso,
      };

      if (editingId) {
        await onUpdateAssessment(payload);
      } else {
        await onAddAssessment(payload);
      }

      setModalOpen(false);
      setSelectedAssessmentId(payload.id);

      if (formSendWaOnSave) {
        await handleSendWaReport(payload);
      } else {
        setFeedback({
          type: 'success',
          text: `Penilaian untuk ${std.name} (${payload.finalScore} / Grade ${payload.grade}) berhasil disimpan ke Cloud Firestore.`,
        });
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleTogglePublish = async (a: StudentAssessment) => {
    const updated: StudentAssessment = {
      ...a,
      published: !a.published,
      updatedAt: new Date().toISOString(),
    };
    await onUpdateAssessment(updated);
    setFeedback({
      type: 'info',
      text: updated.published
        ? `Rapor ${a.studentName} sekarang DITAMPILKAN di Portal Wali Murid.`
        : `Rapor ${a.studentName} diubah menjadi DRAFT (disembunyikan dari Wali Murid).`,
    });
  };

  const handleSendWaReport = async (a: StudentAssessment) => {
    const std = students.find((s) => s.id === a.studentId || s.nisn === a.nisn);
    setSendingWaId(a.id);
    try {
      const waConfig = getWhatsAppConfig();
      const res = await sendAssessmentWhatsAppNotification(std, a, waConfig);
      if (res.success && res.method === 'gateway') {
        await onUpdateAssessment({
          ...a,
          waSent: true,
          waSentAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }
      setFeedback({
        type: res.success ? 'success' : 'error',
        text: res.message,
        waUrl: res.url,
      });
    } finally {
      setSendingWaId(null);
    }
  };

  const handleCopySummary = async () => {
    if (!activeReport) return;
    const text = generateAssessmentWhatsAppMessage(activeReportStudent, activeReport);
    try {
      await navigator.clipboard.writeText(text);
      setCopiedSummary(true);
      setTimeout(() => setCopiedSummary(false), 2500);
    } catch {
      setFeedback({
        type: 'info',
        text: 'Clipboard tidak tersedia di browser ini. Gunakan tombol Cetak / PDF.',
      });
    }
  };

  const handleExportCsv = () => {
    const headers = [
      'NISN',
      'Nama Siswa',
      'Kelas',
      'Divisi',
      'Periode',
      'Tanggal Evaluasi',
      'Kehadiran (20%)',
      'Materi (25%)',
      'Praktikum (35%)',
      'Kreativitas (20%)',
      'Nilai Akhir',
      'Grade',
      'Predikat',
      'Proyek',
      'Catatan Pembina',
      'Status Publikasi',
    ];
    const rows = filteredTeacherAssessments.map((a) => [
      a.nisn,
      `"${a.studentName.replace(/"/g, '""')}"`,
      `"${a.class.replace(/"/g, '""')}"`,
      `"${a.division}"`,
      `"${a.period}"`,
      a.assessmentDate,
      a.attendanceScore,
      a.materialScore,
      a.practiceScore,
      a.creativityScore,
      a.finalScore,
      a.grade,
      `"${a.predicate}"`,
      `"${(a.projectTitle || '').replace(/"/g, '""')}"`,
      `"${(a.coachNotes || '').replace(/"/g, '""')}"`,
      a.published ? 'Tampil ke Wali' : 'Draft',
    ]);
    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Rekap_Nilai_IT_Club_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const selectedFormStudent = students.find((s) => s.id === formStudentId);

  return (
    <section className="py-10 sm:py-14 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Header & Mode Switcher */}
      <div className="no-print flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-8">
        <div>
          <p className="text-xs font-mono uppercase tracking-widest text-cyan-400 mb-2">
            Evaluasi Kompetensi &amp; Rapor Digital
          </p>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Penilaian &amp; Laporan Hasil Belajar IT Club
          </h1>
          <p className="text-sm text-slate-400 mt-1.5 max-w-2xl">
            Transparansi perkembangan kompetensi siswa untuk orang tua/wali murid, lengkap dengan rubrik penilaian proyek, kehadiran lab, dan pengiriman laporan ke WhatsApp wali.
          </p>
        </div>

        {/* Mode Switcher */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex p-1 rounded-xl bg-[#0b1120] border border-slate-800">
            <button
              type="button"
              onClick={() => setViewMode('parent')}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 whitespace-nowrap ${
                viewMode === 'parent'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              Portal Wali Murid
            </button>

            {admin.isAuthenticated ? (
              <button
                type="button"
                onClick={() => setViewMode('teacher')}
                className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 whitespace-nowrap ${
                  viewMode === 'teacher'
                    ? 'bg-violet-500/20 text-violet-300 border border-violet-500/40'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Award className="w-3.5 h-3.5" />
                Kelola Nilai Guru ({assessments.length})
              </button>
            ) : (
              <button
                type="button"
                onClick={onOpenAdminModal}
                className="px-3.5 py-2 rounded-lg text-xs font-semibold text-amber-300 hover:text-amber-200 hover:bg-slate-800/60 transition-all flex items-center gap-1.5 whitespace-nowrap"
              >
                <Lock className="w-3.5 h-3.5" />
                Input Nilai (Login Guru)
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Feedback Banner */}
      {feedback && (
        <div
          className={`no-print mb-6 p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
            feedback.type === 'success'
              ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
              : feedback.type === 'error'
              ? 'bg-rose-950/40 border-rose-500/40 text-rose-200'
              : 'bg-cyan-950/40 border-cyan-500/40 text-cyan-200'
          }`}
        >
          <div className="flex items-start gap-2.5 text-sm">
            {feedback.type === 'error' ? (
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            ) : (
              <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
            )}
            <span>{feedback.text}</span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {feedback.waUrl && (
              <a
                href={feedback.waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500 text-slate-950 text-xs font-bold hover:bg-emerald-400 transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Buka WhatsApp
              </a>
            )}
            <button
              type="button"
              onClick={() => setFeedback(null)}
              className="p-1 text-slate-400 hover:text-white"
              aria-label="Tutup notifikasi"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ============================================================
          MODE 1: PORTAL WALI MURID (PUBLIC REPORT VIEW & PRINT)
         ============================================================ */}
      {viewMode === 'parent' && (
        <div className="space-y-6">
          {/* Pencarian NISN / Nama Siswa */}
          <div className="no-print p-5 sm:p-6 rounded-2xl bg-[#0b1120] border border-slate-800/90">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex-1">
                <label
                  htmlFor="parent-nisn-search"
                  className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-2"
                >
                  Cari Laporan Siswa (Masukkan NISN atau Nama Lengkap Anak)
                </label>
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    id="parent-nisn-search"
                    type="text"
                    value={parentSearch}
                    onChange={(e) => setParentSearch(e.target.value)}
                    placeholder="Contoh: 0078129041 atau Muhammad Rizky..."
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-[#080c16] border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                  />
                  {parentSearch && (
                    <button
                      type="button"
                      onClick={() => setParentSearch('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                      aria-label="Hapus pencarian"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Action Buttons when a report is active */}
              {activeReport && (
                <div className="flex flex-wrap items-center gap-2 pt-2 md:pt-6">
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="px-4 py-2.5 rounded-xl bg-cyan-500 text-slate-950 text-xs font-bold hover:bg-cyan-400 transition-colors flex items-center gap-2"
                  >
                    <Printer className="w-4 h-4" />
                    Cetak / Simpan PDF
                  </button>
                  <button
                    type="button"
                    onClick={() => setCertificateReport(activeReport)}
                    className="px-4 py-2.5 rounded-xl bg-violet-600 text-white text-xs font-bold hover:bg-violet-500 transition-colors flex items-center gap-2"
                  >
                    <Award className="w-4 h-4" />
                    E-Sertifikat
                  </button>
                  <button
                    type="button"
                    onClick={handleCopySummary}
                    className="px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-200 text-xs font-semibold hover:bg-slate-700 transition-colors flex items-center gap-1.5"
                  >
                    {copiedSummary ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        Tersalin
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        Salin Ringkasan
                      </>
                    )}
                  </button>
                  {admin.isAuthenticated && (
                    <button
                      type="button"
                      onClick={() => handleSendWaReport(activeReport)}
                      disabled={sendingWaId === activeReport.id}
                      className="px-3.5 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-500 transition-colors flex items-center gap-1.5 disabled:opacity-50"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      {sendingWaId === activeReport.id ? 'Mengirim...' : 'Kirim WA Wali'}
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Quick student/report selector list */}
            {parentMatchingList.length > 0 && (
              <div className="mt-4 pt-4 border-t border-slate-800/80 flex flex-wrap items-center gap-2">
                <span className="text-xs text-slate-400 mr-1">Laporan tersedia:</span>
                {parentMatchingList.slice(0, 8).map((item) => {
                  const isSelected = activeReport?.id === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setSelectedAssessmentId(item.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all flex items-center gap-2 ${
                        isSelected
                          ? 'bg-cyan-950/60 border-cyan-500/50 text-cyan-200'
                          : 'bg-[#080c16] border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                      }`}
                    >
                      <span>{item.studentName.split(' ').slice(0, 2).join(' ')}</span>
                      <span className="font-mono tabular-nums text-[11px] opacity-75">
                        {item.nisn}
                      </span>
                      {!item.published && (
                        <span className="text-[10px] font-mono text-amber-400">(Draft)</span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Empty search state */}
          {!activeReport ? (
            <div className="p-10 rounded-2xl bg-[#0b1120] border border-slate-800 text-center">
              <Search className="w-10 h-10 text-slate-500 mx-auto mb-3" />
              <h3 className="text-base font-bold text-white">Laporan Penilaian Tidak Ditemukan</h3>
              <p className="text-sm text-slate-400 mt-1 max-w-md mx-auto">
                Pastikan NISN atau nama siswa yang Anda masukkan sudah benar dan penilaian sudah dipublikasikan oleh Guru Pembina IT Club.
              </p>
            </div>
          ) : (
            /* Official Student Report Card (#printable-report-area) */
            <div
              id="printable-report-area"
              className="rounded-2xl bg-[#0b1120] border border-slate-800 overflow-hidden shadow-xl"
            >
              {/* Report Banner Header */}
              <div className="p-6 sm:p-8 border-b border-slate-800 bg-gradient-to-r from-[#0e172a] via-[#0b1120] to-[#111936]">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
                  <div className="flex items-start sm:items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl overflow-hidden bg-slate-800 border border-cyan-500/30 shrink-0 flex items-center justify-center">
                      {activeReportStudent?.avatarUrl ? (
                        <img
                          src={activeReportStudent.avatarUrl}
                          alt={activeReport.studentName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-xl font-bold text-cyan-300">
                          {activeReport.studentName.slice(0, 2).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div>
                      <div className="text-[11px] font-mono uppercase tracking-widest text-cyan-400 mb-1">
                        Laporan Hasil Belajar IT Club · {activeReport.period}
                      </div>
                      <h2 className="text-xl sm:text-2xl font-extrabold text-white">
                        {activeReport.studentName}
                      </h2>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-300 mt-1.5">
                        <span className="font-mono tabular-nums">
                          NISN: <strong className="text-white">{activeReport.nisn}</strong>
                        </span>
                        <span className="text-slate-600">·</span>
                        <span>{activeReport.class}</span>
                        <span className="text-slate-600">·</span>
                        <span className="text-cyan-300 font-semibold">{activeReport.division}</span>
                      </div>
                    </div>
                  </div>

                  {/* Period / Status Meta */}
                  <div className="flex flex-col sm:items-end gap-1 text-xs text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                      <span>
                        Tanggal Evaluasi:{' '}
                        <strong className="text-slate-200 font-mono tabular-nums">
                          {activeReport.assessmentDate}
                        </strong>
                      </span>
                    </div>
                    <div>
                      Wali Murid:{' '}
                      <strong className="text-slate-200">
                        {activeReportStudent?.parentName || 'Terdaftar'}
                      </strong>
                    </div>
                    <div>
                      Pembina: <strong className="text-slate-200">{activeReport.instructorName}</strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* Report Two-Column Content */}
              <div className="p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left Column: 4 Rubric Dimensions + Project & Notes */}
                <div className="lg:col-span-8 space-y-6">
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 mb-4">
                      Rincian Capaian Aspek Kompetensi
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {[
                        {
                          title: 'Kehadiran & Disiplin',
                          weight: 'Bobot 20%',
                          score: activeReport.attendanceScore,
                          desc: 'Ketepatan waktu presensi RFID/QR dan tata tertib lab komputer.',
                        },
                        {
                          title: 'Pemahaman Materi & Logika',
                          weight: 'Bobot 25%',
                          score: activeReport.materialScore,
                          desc: 'Penguasaan konsep teori, algoritma, dan struktur modul divisi.',
                        },
                        {
                          title: 'Praktikum & Karya Proyek',
                          weight: 'Bobot 35%',
                          score: activeReport.practiceScore,
                          desc: 'Kualitas implementasi teknis, kerapian karya, dan penyelesaian tugas.',
                        },
                        {
                          title: 'Kreativitas & Kolaborasi',
                          weight: 'Bobot 20%',
                          score: activeReport.creativityScore,
                          desc: 'Inisiatif inovasi, problem solving, dan kerjasama dalam tim club.',
                        },
                      ].map((metric) => {
                        const info = getScoreDescriptor(metric.score);
                        return (
                          <div
                            key={metric.title}
                            className="p-4 rounded-xl bg-[#080c16] border border-slate-800"
                          >
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <div>
                                <div className="text-sm font-bold text-white">{metric.title}</div>
                                <div className="text-[11px] font-mono text-slate-400">
                                  {metric.weight}
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-xl font-extrabold font-mono tabular-nums text-white">
                                  {metric.score}
                                </div>
                                <div className={`text-[11px] font-semibold ${info.textColor}`}>
                                  {info.text}
                                </div>
                              </div>
                            </div>
                            <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden mb-2.5">
                              <div
                                className={`h-full rounded-full ${info.barColor}`}
                                style={{ width: `${Math.min(100, Math.max(0, metric.score))}%` }}
                              />
                            </div>
                            <p className="text-xs text-slate-400 leading-relaxed">{metric.desc}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Project & Coach Notes */}
                  <div className="space-y-4">
                    <div className="p-4 rounded-xl bg-[#080c16] border border-slate-800">
                      <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-cyan-400 mb-1.5">
                        <Wrench className="w-3.5 h-3.5" />
                        Proyek / Praktikum Utama Periode Ini
                      </div>
                      <p className="text-sm font-semibold text-white">
                        {activeReport.projectTitle || '-'}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 rounded-xl bg-[#080c16] border border-slate-800">
                        <div className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-1.5">
                          Catatan &amp; Evaluasi Pembina
                        </div>
                        <p className="text-sm text-slate-200 leading-relaxed">
                          {activeReport.coachNotes || '-'}
                        </p>
                      </div>
                      <div className="p-4 rounded-xl bg-[#080c16] border border-slate-800">
                        <div className="text-xs font-mono uppercase tracking-wider text-teal-400 mb-1.5">
                          Rekomendasi Pengembangan
                        </div>
                        <p className="text-sm text-slate-200 leading-relaxed">
                          {activeReport.recommendation || '-'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column: Final Grade Summary + Attendance Summary */}
                <div className="lg:col-span-4 space-y-5">
                  {/* Final Score Box */}
                  <div className="p-6 rounded-2xl bg-[#080c16] border border-cyan-900/50 text-center">
                    <div className="text-xs font-mono uppercase tracking-widest text-slate-400 mb-2">
                      Nilai Akhir Kumulatif
                    </div>
                    <div className="flex items-baseline justify-center gap-1.5">
                      <span className="text-5xl font-black font-mono tabular-nums text-white">
                        {activeReport.finalScore}
                      </span>
                      <span className="text-sm font-mono text-slate-400">/ 100</span>
                    </div>

                    <div className="mt-4 flex justify-center">
                      <span
                        className={`px-4 py-1.5 rounded-xl border text-sm font-bold ${
                          getGradeInfo(activeReport.finalScore).accentClass
                        }`}
                      >
                        Predikat {activeReport.grade} · {getGradeInfo(activeReport.finalScore).label}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 mt-3">{activeReport.predicate}</p>
                  </div>

                  {/* Attendance Summary integrated from live logs */}
                  <div className="p-5 rounded-2xl bg-[#080c16] border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono uppercase tracking-wider text-slate-400">
                        Rekap Presensi Lab (Live)
                      </span>
                      <UserCheck className="w-4 h-4 text-cyan-400" />
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="p-2.5 rounded-xl bg-slate-900/70 border border-slate-800">
                        <div className="text-lg font-bold font-mono tabular-nums text-emerald-300">
                          {activeAttendanceStats.hadir}
                        </div>
                        <div className="text-[11px] text-slate-400">Hadir</div>
                      </div>
                      <div className="p-2.5 rounded-xl bg-slate-900/70 border border-slate-800">
                        <div className="text-lg font-bold font-mono tabular-nums text-amber-300">
                          {activeAttendanceStats.terlambat}
                        </div>
                        <div className="text-[11px] text-slate-400">Terlambat</div>
                      </div>
                      <div className="p-2.5 rounded-xl bg-slate-900/70 border border-slate-800">
                        <div className="text-lg font-bold font-mono tabular-nums text-cyan-300">
                          {activeAttendanceStats.izin}
                        </div>
                        <div className="text-[11px] text-slate-400">Izin</div>
                      </div>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Total {activeAttendanceStats.total} rekaman tap kartu RFID/QR tercatat untuk ananda pada sistem presensi lab komputer.
                    </p>
                  </div>

                  {/* Skala Predikat Referensi */}
                  <div className="p-4 rounded-xl bg-[#080c16] border border-slate-800 text-xs space-y-1.5">
                    <div className="font-mono uppercase tracking-wider text-slate-400 mb-2">
                      Keterangan Skala Nilai
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span>A · Sangat Baik</span>
                      <span className="font-mono tabular-nums text-emerald-300">88 – 100</span>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span>B · Baik (Kompeten)</span>
                      <span className="font-mono tabular-nums text-cyan-300">75 – 87</span>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span>C · Cukup</span>
                      <span className="font-mono tabular-nums text-amber-300">60 – 74</span>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span>D · Perlu Pendampingan</span>
                      <span className="font-mono tabular-nums text-rose-300">&lt; 60</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Print-only signature block */}
              <div className="only-print px-8 pb-8 pt-6 border-t border-slate-300">
                <div className="flex justify-between items-end text-xs">
                  <div>
                    <p>Mengetahui,</p>
                    <p className="font-bold">Orang Tua / Wali Murid</p>
                    <div className="h-14" />
                    <p className="border-t border-slate-400 pt-1 min-w-[160px]">
                      {activeReportStudent?.parentName || '( .................................... )'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p>Dicetak pada {new Date().toLocaleDateString('id-ID')}</p>
                    <p className="font-bold">Pembina IT Club Sekolah</p>
                    <div className="h-14" />
                    <p className="border-t border-slate-400 pt-1 min-w-[180px]">
                      {activeReport.instructorName}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ============================================================
          MODE 2: PANEL KELOLA NILAI GURU (ADMIN CRUD)
         ============================================================ */}
      {viewMode === 'teacher' && admin.isAuthenticated && (
        <div className="no-print space-y-6">
          {/* KPI Summary Row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-[#0b1120] border border-slate-800">
              <div className="text-xs text-slate-400">Total Siswa Dinilai</div>
              <div className="text-2xl font-extrabold font-mono tabular-nums text-white mt-1">
                {teacherStats.total}
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-[#0b1120] border border-slate-800">
              <div className="text-xs text-slate-400">Rata-rata Skor Club</div>
              <div className="text-2xl font-extrabold font-mono tabular-nums text-cyan-300 mt-1">
                {teacherStats.avg}
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-[#0b1120] border border-slate-800">
              <div className="text-xs text-slate-400">Predikat A (Unggul)</div>
              <div className="text-2xl font-extrabold font-mono tabular-nums text-emerald-300 mt-1">
                {teacherStats.gradeACount}
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-[#0b1120] border border-slate-800">
              <div className="text-xs text-slate-400">Tampil ke Wali Murid</div>
              <div className="text-2xl font-extrabold font-mono tabular-nums text-violet-300 mt-1">
                {teacherStats.publishedCount}
              </div>
            </div>
          </div>

          {/* Filter & Action Toolbar */}
          <div className="p-4 rounded-2xl bg-[#0b1120] border border-slate-800 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2.5 flex-1">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={teacherSearch}
                  onChange={(e) => setTeacherSearch(e.target.value)}
                  placeholder="Cari nama, NISN, atau proyek..."
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#080c16] border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <select
                value={filterDivision}
                onChange={(e) => setFilterDivision(e.target.value)}
                className="px-3 py-2 rounded-xl bg-[#080c16] border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
              >
                <option value="Semua">Semua Divisi</option>
                <option value="C# .NET">C# .NET</option>
                <option value="Scratch/Pictoblox">Scratch/Pictoblox</option>
                <option value="Desain Grafis">Desain Grafis</option>
                <option value="Robotika & IoT">Robotika &amp; IoT</option>
                <option value="Python Programming">Python Programming</option>
              </select>

              <select
                value={filterPeriod}
                onChange={(e) => setFilterPeriod(e.target.value)}
                className="px-3 py-2 rounded-xl bg-[#080c16] border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
              >
                <option value="Semua">Semua Periode</option>
                {PERIOD_OPTIONS.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as 'all' | 'published' | 'draft')}
                className="px-3 py-2 rounded-xl bg-[#080c16] border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
              >
                <option value="all">Semua Status</option>
                <option value="published">Tampil ke Wali</option>
                <option value="draft">Draft</option>
              </select>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleExportCsv}
                className="px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition-colors flex items-center gap-1.5"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                Export CSV
              </button>
              <button
                type="button"
                onClick={openCreateModal}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-400 text-slate-950 text-xs font-extrabold hover:opacity-95 transition-opacity flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                Input Penilaian
              </button>
            </div>
          </div>

          {/* Assessment Table */}
          <div className="rounded-2xl bg-[#0b1120] border border-slate-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-800 bg-[#080c16]/80 text-slate-400 font-mono uppercase text-[11px]">
                    <th className="py-3.5 px-4">Siswa &amp; Divisi</th>
                    <th className="py-3.5 px-4">Periode</th>
                    <th className="py-3.5 px-4 text-center">Hadir / Materi / Praktik / Kreatif</th>
                    <th className="py-3.5 px-4 text-center">Nilai Akhir</th>
                    <th className="py-3.5 px-4 text-center">Wali Murid</th>
                    <th className="py-3.5 px-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/70">
                  {filteredTeacherAssessments.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-10 text-center text-slate-400">
                        Belum ada data penilaian yang sesuai filter. Klik &ldquo;Input Penilaian&rdquo; untuk menambahkan nilai siswa.
                      </td>
                    </tr>
                  ) : (
                    filteredTeacherAssessments.map((item) => {
                      const gradeInfo = getGradeInfo(item.finalScore);
                      return (
                        <tr key={item.id} className="hover:bg-slate-900/40 transition-colors">
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-white text-sm">{item.studentName}</div>
                            <div className="text-[11px] text-slate-400 mt-0.5 flex flex-wrap items-center gap-1.5">
                              <span className="font-mono tabular-nums">{item.nisn}</span>
                              <span>·</span>
                              <span>{item.class}</span>
                              <span>·</span>
                              <span className="text-cyan-300">{item.division}</span>
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="text-slate-200 font-medium">{item.period}</div>
                            <div className="text-[11px] font-mono tabular-nums text-slate-400 mt-0.5">
                              {item.assessmentDate}
                            </div>
                          </td>
                          <td className="py-3.5 px-4 text-center font-mono tabular-nums text-slate-300">
                            {item.attendanceScore} / {item.materialScore} / {item.practiceScore} /{' '}
                            {item.creativityScore}
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border font-mono tabular-nums font-bold ${gradeInfo.accentClass}`}
                            >
                              <span>{item.finalScore}</span>
                              <span className="opacity-70">({item.grade})</span>
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <button
                              type="button"
                              onClick={() => handleTogglePublish(item)}
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-colors ${
                                item.published
                                  ? 'bg-emerald-950/50 border-emerald-500/40 text-emerald-300 hover:bg-emerald-900/50'
                                  : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-white'
                              }`}
                              title="Klik untuk ubah visibilitas di Portal Wali Murid"
                            >
                              {item.published ? (
                                <>
                                  <Eye className="w-3 h-3" /> Tampil
                                </>
                              ) : (
                                <>
                                  <EyeOff className="w-3 h-3" /> Draft
                                </>
                              )}
                            </button>
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedAssessmentId(item.id);
                                  setViewMode('parent');
                                }}
                                className="p-2 rounded-lg bg-slate-800/80 text-cyan-300 hover:bg-slate-700 transition-colors"
                                title="Lihat Tampilan Rapor Wali Murid"
                              >
                                <BookOpen className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleSendWaReport(item)}
                                disabled={sendingWaId === item.id}
                                className={`p-2 rounded-lg transition-colors ${
                                  item.waSent
                                    ? 'bg-emerald-950/60 border border-emerald-500/40 text-emerald-300'
                                    : 'bg-slate-800/80 text-emerald-300 hover:bg-emerald-900/50'
                                }`}
                                title={
                                  item.waSent
                                    ? 'Laporan sudah dikirim ke WA Wali (klik untuk kirim ulang)'
                                    : 'Kirim Ringkasan Rapor ke WA Wali'
                                }
                              >
                                <MessageCircle className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => openEditModal(item)}
                                className="p-2 rounded-lg bg-slate-800/80 text-slate-200 hover:bg-slate-700 transition-colors"
                                title="Edit Nilai & Catatan"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              {confirmDeleteId === item.id ? (
                                <div className="flex items-center gap-1 bg-rose-950/60 border border-rose-500/50 rounded-lg px-2 py-1">
                                  <button
                                    type="button"
                                    onClick={async () => {
                                      await onDeleteAssessment(item.id);
                                      setConfirmDeleteId(null);
                                    }}
                                    className="text-[11px] font-bold text-rose-300 hover:text-white"
                                  >
                                    Hapus?
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setConfirmDeleteId(null)}
                                    className="text-[11px] text-slate-400 hover:text-white ml-1"
                                  >
                                    Batal
                                  </button>
                                </div>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => setConfirmDeleteId(item.id)}
                                  className="p-2 rounded-lg bg-slate-800/80 text-rose-400 hover:bg-rose-950/60 transition-colors"
                                  title="Hapus Penilaian"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================
          MODAL TAMBAH / EDIT PENILAIAN SISWA
         ============================================================ */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-2xl rounded-2xl bg-[#0b1120] border border-cyan-900/50 shadow-2xl overflow-hidden my-8">
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-[#080c16]">
              <div>
                <h3 className="text-base font-bold text-white">
                  {editingId ? 'Edit Penilaian Siswa IT Club' : 'Input Penilaian Siswa IT Club'}
                </h3>
                <p className="text-xs text-slate-400">
                  Nilai akhir dihitung otomatis sesuai bobot rubrik (20% · 25% · 35% · 20%).
                </p>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveForm} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
              {/* Student & Period */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Pilih Anggota IT Club
                  </label>
                  <select
                    value={formStudentId}
                    onChange={(e) => {
                      const nextId = e.target.value;
                      setFormStudentId(nextId);
                      const std = students.find((s) => s.id === nextId);
                      if (std && !editingId) {
                        setFormAttendance(getStudentAttendanceStats(std.id, std.nisn).computedScore);
                      }
                    }}
                    className="w-full px-3 py-2.5 rounded-xl bg-[#080c16] border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-500"
                    required
                  >
                    {students.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} — {s.division} ({s.nisn})
                      </option>
                    ))}
                  </select>
                  {selectedFormStudent && (
                    <p className="text-[11px] text-slate-400 mt-1">
                      Wali: {selectedFormStudent.parentName || '-'} · WA:{' '}
                      <span className="font-mono">
                        {selectedFormStudent.parentPhone || 'Belum diisi'}
                      </span>
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Periode Penilaian
                  </label>
                  <select
                    value={formPeriod}
                    onChange={(e) => setFormPeriod(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-[#080c16] border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-500"
                  >
                    {PERIOD_OPTIONS.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Tanggal Evaluasi
                  </label>
                  <input
                    type="date"
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-[#080c16] border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Nama Guru Pembina
                  </label>
                  <input
                    type="text"
                    value={formInstructor}
                    onChange={(e) => setFormInstructor(e.target.value)}
                    placeholder="Contoh: Hendra Pratama, S.Kom"
                    className="w-full px-3 py-2.5 rounded-xl bg-[#080c16] border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-500"
                    required
                  />
                </div>
              </div>

              {/* 4 Score Sliders */}
              <div className="p-4 rounded-xl bg-[#080c16] border border-slate-800 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-cyan-300">
                    Skor Rubrik Penilaian (0 – 100)
                  </span>
                  <button
                    type="button"
                    onClick={handleAutoCalculateAttendance}
                    className="px-2.5 py-1 rounded-lg bg-cyan-950/60 border border-cyan-500/40 text-[11px] font-semibold text-cyan-300 hover:bg-cyan-900/60 flex items-center gap-1.5"
                  >
                    <Calculator className="w-3.5 h-3.5" />
                    Hitung Kehadiran Otomatis dari Log Presensi
                  </button>
                </div>

                {[
                  {
                    label: 'Kehadiran & Disiplin (20%)',
                    value: formAttendance,
                    setter: setFormAttendance,
                  },
                  {
                    label: 'Pemahaman Materi & Logika (25%)',
                    value: formMaterial,
                    setter: setFormMaterial,
                  },
                  {
                    label: 'Praktikum & Karya Proyek (35%)',
                    value: formPractice,
                    setter: setFormPractice,
                  },
                  {
                    label: 'Kreativitas & Kolaborasi (20%)',
                    value: formCreativity,
                    setter: setFormCreativity,
                  },
                ].map((field) => (
                  <div key={field.label} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <label className="text-slate-300 font-medium">{field.label}</label>
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={field.value}
                        onChange={(e) =>
                          field.setter(Math.min(100, Math.max(0, Number(e.target.value) || 0)))
                        }
                        className="w-16 px-2 py-1 rounded-lg bg-slate-900 border border-slate-700 text-right font-mono tabular-nums text-white text-xs"
                      />
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={field.value}
                      onChange={(e) => field.setter(Number(e.target.value))}
                      className="w-full accent-cyan-400 cursor-pointer"
                    />
                  </div>
                ))}

                {/* Live Result Preview */}
                <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                  <div className="text-xs text-slate-400">
                    Prediksi Nilai Akhir:{' '}
                    <strong className="text-white">{previewGradeInfo.predicate}</strong>
                  </div>
                  <div
                    className={`px-3 py-1 rounded-lg border font-mono tabular-nums text-sm font-bold ${previewGradeInfo.accentClass}`}
                  >
                    {previewFinalScore} · Grade {previewGradeInfo.grade}
                  </div>
                </div>
              </div>

              {/* Qualitative Feedback */}
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Judul Proyek / Praktikum Utama
                  </label>
                  <input
                    type="text"
                    value={formProjectTitle}
                    onChange={(e) => setFormProjectTitle(e.target.value)}
                    placeholder="Contoh: Aplikasi Kasir Sederhana Berbasis C# Windows Forms"
                    className="w-full px-3 py-2.5 rounded-xl bg-[#080c16] border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Catatan Perkembangan Siswa (untuk Orang Tua / Wali)
                  </label>
                  <textarea
                    rows={3}
                    value={formCoachNotes}
                    onChange={(e) => setFormCoachNotes(e.target.value)}
                    placeholder="Tuliskan apresiasi, perkembangan keterampilan, atau hal yang perlu diperhatikan orang tua..."
                    className="w-full px-3 py-2.5 rounded-xl bg-[#080c16] border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Rekomendasi Tindak Lanjut
                  </label>
                  <input
                    type="text"
                    value={formRecommendation}
                    onChange={(e) => setFormRecommendation(e.target.value)}
                    placeholder="Contoh: Siap lanjut ke materi Database SQLite atau ikut seleksi LKS..."
                    className="w-full px-3 py-2.5 rounded-xl bg-[#080c16] border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              {/* Publish & Auto WA Toggles */}
              <div className="space-y-2.5 pt-2 border-t border-slate-800">
                <label className="flex items-center gap-2.5 text-xs text-slate-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formPublished}
                    onChange={(e) => setFormPublished(e.target.checked)}
                    className="rounded border-slate-700 bg-slate-900 text-cyan-500"
                  />
                  <span>Publikasikan laporan ini agar dapat dilihat orang tua/wali di Portal Wali Murid</span>
                </label>

                <label
                  className={`flex items-center gap-2.5 text-xs ${
                    selectedFormStudent?.parentPhone
                      ? 'text-emerald-300 cursor-pointer'
                      : 'text-slate-500 cursor-not-allowed'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={formSendWaOnSave}
                    disabled={!selectedFormStudent?.parentPhone}
                    onChange={(e) => setFormSendWaOnSave(e.target.checked)}
                    className="rounded border-slate-700 bg-slate-900 text-emerald-500"
                  />
                  <span>
                    Kirim ringkasan rapor otomatis ke WhatsApp Wali Murid setelah disimpan
                    {selectedFormStudent?.parentPhone
                      ? ` (${selectedFormStudent.parentPhone})`
                      : ' (No. WA Wali belum diisi)'}
                  </span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-400 text-slate-950 text-xs font-extrabold hover:opacity-95 disabled:opacity-50 flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  {isSaving ? 'Menyimpan...' : editingId ? 'Simpan Perubahan' : 'Simpan Penilaian'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================
          MODAL E-SERTIFIKAT DIGITAL IT CLUB
         ============================================================ */}
      {certificateReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-3xl rounded-2xl bg-[#0b1120] border border-cyan-500/40 shadow-2xl overflow-hidden my-6">
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-[#080c16]">
              <div className="flex items-center gap-2.5">
                <Award className="w-5 h-5 text-cyan-400" />
                <div>
                  <h3 className="text-base font-bold text-white">
                    E-Sertifikat Kompetensi IT Club
                  </h3>
                  <p className="text-xs text-slate-400">
                    Piagam digital resmi untuk anggota &amp; orang tua/wali murid
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setCertificateReport(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              {/* Visual Certificate Preview */}
              <div className="relative p-6 sm:p-10 rounded-xl bg-gradient-to-br from-[#070b14] via-[#0d1629] to-[#080e1d] border-2 border-cyan-500/50 text-center space-y-4 overflow-hidden">
                <div className="text-[11px] font-mono uppercase tracking-[0.25em] text-cyan-300">
                  IT Club &amp; Laboratorium Komputer Sekolah
                </div>
                <h4 className="text-2xl sm:text-3xl font-black tracking-wide text-white">
                  SERTIFIKAT KOMPETENSI
                </h4>
                <div className="text-xs font-mono text-slate-400 tabular-nums">
                  NO. REG: CERT-{certificateReport.nisn}-
                  {certificateReport.assessmentDate.replace(/-/g, '')}
                </div>

                <p className="text-xs sm:text-sm text-slate-300 pt-2">
                  Diberikan dengan bangga kepada:
                </p>
                <div className="text-2xl sm:text-3xl font-extrabold text-cyan-300 border-b border-teal-500/40 pb-2 inline-block px-6">
                  {certificateReport.studentName}
                </div>
                <div className="text-xs text-slate-300 font-mono tabular-nums">
                  NISN: {certificateReport.nisn} · {certificateReport.class}
                </div>

                <p className="text-xs sm:text-sm text-slate-300 pt-2">
                  Telah menyelesaikan program pelatihan &amp; praktikum Divisi{' '}
                  <strong className="text-white">{certificateReport.division}</strong>
                </p>
                <div className="text-xs text-slate-400">
                  {certificateReport.period} | Karya Utama: {certificateReport.projectTitle || '-'}
                </div>

                <div
                  className={`inline-block px-6 py-3.5 rounded-xl border ${
                    getGradeInfo(certificateReport.finalScore).accentClass
                  }`}
                >
                  <div className="text-sm sm:text-base font-mono font-bold tabular-nums">
                    NILAI AKHIR: {certificateReport.finalScore}/100 · PREDIKAT{' '}
                    {certificateReport.grade}
                  </div>
                  <div className="text-xs text-slate-300 mt-0.5">
                    {certificateReport.predicate}
                  </div>
                </div>

                <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400 border-t border-slate-800/80">
                  <span>Evaluasi: {certificateReport.assessmentDate}</span>
                  <span>
                    Pembina: <strong className="text-slate-200">{certificateReport.instructorName}</strong>
                  </span>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setCertificateReport(null)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700"
                >
                  Tutup
                </button>
                <button
                  type="button"
                  onClick={() => handleDownloadCertificatePng(certificateReport)}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-400 text-slate-950 text-xs font-extrabold hover:opacity-95 flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Unduh E-Sertifikat (PNG HD)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
