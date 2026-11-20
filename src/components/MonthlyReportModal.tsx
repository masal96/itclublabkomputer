import React, { useMemo, useState } from 'react';
import { Printer, X, FileSpreadsheet, Calendar, FileText } from 'lucide-react';
import { AttendanceRecord, PembinaCardProfile, Student } from '../types';

interface MonthlyReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: Student[];
  attendanceRecords: AttendanceRecord[];
  pembinaProfile: PembinaCardProfile;
}

export const MonthlyReportModal: React.FC<MonthlyReportModalProps> = ({
  isOpen,
  onClose,
  students,
  attendanceRecords,
  pembinaProfile,
}) => {
  const now = new Date();
  const defaultMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const [selectedMonth, setSelectedMonth] = useState(defaultMonth);
  const [divisionFilter, setDivisionFilter] = useState<string>('Semua');

  const { year, monthIdx, daysInMonth, monthLabel } = useMemo(() => {
    const [y, m] = selectedMonth.split('-').map(Number);
    const yr = y || now.getFullYear();
    const mo = (m || now.getMonth() + 1) - 1;
    const totalDays = new Date(yr, mo + 1, 0).getDate();
    const label = new Date(yr, mo, 1).toLocaleDateString('id-ID', {
      month: 'long',
      year: 'numeric',
    });
    return { year: yr, monthIdx: mo, daysInMonth: totalDays, monthLabel: label };
  }, [selectedMonth]);

  const divisions = useMemo(() => {
    const set = new Set(students.map((s) => s.division));
    return ['Semua', ...Array.from(set)];
  }, [students]);

  const filteredStudents = useMemo(
    () =>
      divisionFilter === 'Semua'
        ? students
        : students.filter((s) => s.division === divisionFilter),
    [students, divisionFilter]
  );

  const matrixRows = useMemo(() => {
    const dayNumbers = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    return filteredStudents.map((std) => {
      const cells: Record<number, 'H' | 'T' | 'I' | ''> = {};
      let hCount = 0;
      let tCount = 0;
      let iCount = 0;

      for (const rec of attendanceRecords) {
        if (!rec.timestamp) continue;
        const match = rec.studentId === std.id || rec.nisn === std.nisn;
        if (!match) continue;
        if (rec.tapType === 'Pulang') continue;

        const d = new Date(rec.timestamp);
        if (d.getFullYear() === year && d.getMonth() === monthIdx) {
          const day = d.getDate();
          const code: 'H' | 'T' | 'I' =
            rec.status === 'Terlambat' ? 'T' : rec.status === 'Izin' ? 'I' : 'H';
          if (!cells[day]) {
            cells[day] = code;
          }
        }
      }

      for (const day of dayNumbers) {
        if (cells[day] === 'H') hCount += 1;
        else if (cells[day] === 'T') tCount += 1;
        else if (cells[day] === 'I') iCount += 1;
      }

      const totalActive = hCount + tCount;
      return {
        student: std,
        cells,
        hCount,
        tCount,
        iCount,
        totalActive,
      };
    });
  }, [filteredStudents, attendanceRecords, year, monthIdx, daysInMonth]);

  const handleExportMonthlyCsv = () => {
    const dayHeaders = Array.from({ length: daysInMonth }, (_, i) => String(i + 1));
    const headers = ['No', 'Nama Siswa', 'NIS', 'Kelas', 'Divisi', ...dayHeaders, 'Hadir (H)', 'Terlambat (T)', 'Izin (I)', 'Total Hadir'];
    const rows = matrixRows.map((row, idx) => [
      idx + 1,
      `"${row.student.name}"`,
      row.student.nisn,
      `"${row.student.class}"`,
      `"${row.student.division}"`,
      ...dayHeaders.map((d) => row.cells[Number(d)] || '-'),
      row.hCount,
      row.tCount,
      row.iCount,
      row.totalActive,
    ]);
    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Rekap_Absensi_Bulanan_${selectedMonth}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePrintOfficialPdf = () => {
    const dayCols = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    const rowsHtml = matrixRows
      .map(
        (r, i) => `
      <tr>
        <td style="text-align:center">${i + 1}</td>
        <td><strong>${r.student.name}</strong><br/><span style="font-size:9px;color:#555">${r.student.class} · ${r.student.division}</span></td>
        <td style="font-family:monospace;text-align:center">${r.student.nisn}</td>
        ${dayCols
          .map((d) => {
            const val = r.cells[d] || '';
            const color = val === 'H' ? '#047857' : val === 'T' ? '#b45309' : val === 'I' ? '#1d4ed8' : '#cbd5e1';
            return `<td style="text-align:center;font-weight:bold;color:${color}">${val || '·'}</td>`;
          })
          .join('')}
        <td style="text-align:center;font-weight:bold;color:#047857">${r.hCount}</td>
        <td style="text-align:center;font-weight:bold;color:#b45309">${r.tCount}</td>
        <td style="text-align:center;font-weight:bold">${r.totalActive}</td>
      </tr>`
      )
      .join('');

    const html = `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Rekap Absensi Bulanan ${monthLabel} - Lab Komputer & IT Club</title>
  <style>
    @page { size: A4 landscape; margin: 12mm; }
    body { font-family: Arial, sans-serif; color: #0f172a; font-size: 11px; }
    .kop { border-bottom: 3px double #0f172a; padding-bottom: 10px; margin-bottom: 14px; text-align: center; }
    .kop h1 { margin: 0; font-size: 18px; letter-spacing: 0.5px; }
    .kop p { margin: 3px 0 0; font-size: 11px; color: #334155; }
    .meta { display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 11px; }
    table { width: 100%; border-collapse: collapse; font-size: 10px; }
    th, td { border: 1px solid #94a3b8; padding: 3px 4px; }
    th { background: #e2e8f0; font-weight: bold; }
    .legend { margin-top: 8px; font-size: 10px; color: #475569; }
    .sign { margin-top: 28px; display: flex; justify-content: flex-end; }
    .sign-box { width: 260px; text-align: center; }
    .sign-space { height: 64px; }
  </style>
</head>
<body>
  <div class="kop">
    <h1>LABORATORIUM KOMPUTER &amp; EKSTRAKURIKULER IT CLUB</h1>
    <p>${pembinaProfile.unit || 'Unit Lab Komputer Terpadu Sekolah'} · Rekapitulasi Presensi Resmi Bulanan</p>
  </div>
  <div class="meta">
    <div><strong>Periode:</strong> ${monthLabel}</div>
    <div><strong>Divisi:</strong> ${divisionFilter}</div>
    <div><strong>Total Anggota:</strong> ${matrixRows.length} Siswa</div>
  </div>
  <table>
    <thead>
      <tr>
        <th rowspan="2" style="width:24px">No</th>
        <th rowspan="2" style="min-width:150px">Nama Siswa</th>
        <th rowspan="2" style="width:76px">NIS</th>
        <th colspan="${daysInMonth}">Tanggal (${monthLabel})</th>
        <th rowspan="2">H</th>
        <th rowspan="2">T</th>
        <th rowspan="2">Jml</th>
      </tr>
      <tr>
        ${dayCols.map((d) => `<th style="width:17px">${d}</th>`).join('')}
      </tr>
    </thead>
    <tbody>
      ${rowsHtml}
    </tbody>
  </table>
  <div class="legend">Keterangan: <strong>H</strong> = Hadir Tepat Waktu, <strong>T</strong> = Hadir Terlambat, <strong>I</strong> = Izin, <strong>·</strong> = Tidak ada log</div>
  <div class="sign">
    <div class="sign-box">
      <div>Mengetahui,<br/>${pembinaProfile.roleTitle || 'Pembina Lab Komputer & IT Club'}</div>
      <div class="sign-space"></div>
      <div><strong>${pembinaProfile.name}</strong></div>
      <div style="font-family:monospace;font-size:10px">NIP. ${pembinaProfile.nip}</div>
    </div>
  </div>
</body>
</html>`;

    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (doc) {
      doc.open();
      doc.write(html);
      doc.close();
      setTimeout(() => {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
        setTimeout(() => {
          document.body.removeChild(iframe);
        }, 1500);
      }, 250);
    } else {
      document.body.removeChild(iframe);
      window.print();
    }
  };

  if (!isOpen) return null;

  const dayList = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
      <div className="relative w-full max-w-6xl rounded-2xl bg-[#0b1120] border border-cyan-500/40 p-6 shadow-2xl max-h-[92vh] flex flex-col">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800 pr-8">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-950 border border-cyan-500/40 text-cyan-300">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-white">
                Rekap Absensi Bulanan Resmi Sekolah (PDF / Excel)
              </h3>
              <p className="text-xs text-slate-400">
                Matriks kehadiran tanggal 1–{daysInMonth} lengkap dengan kop laboratorium dan kolom tanda tangan Pembina.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700">
              <Calendar className="w-3.5 h-3.5 text-cyan-400" />
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="bg-transparent text-xs text-white font-mono focus:outline-none"
              />
            </div>

            <select
              value={divisionFilter}
              onChange={(e) => setDivisionFilter(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
            >
              {divisions.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>

            <button
              type="button"
              onClick={handleExportMonthlyCsv}
              className="px-3.5 py-2 rounded-xl bg-emerald-950/70 hover:bg-emerald-900 border border-emerald-500/40 text-xs font-bold text-emerald-300 flex items-center gap-1.5"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>CSV Bulanan</span>
            </button>

            <button
              type="button"
              onClick={handlePrintOfficialPdf}
              className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-extrabold flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak / Simpan PDF</span>
            </button>
          </div>
        </div>

        {/* Official Preview Table */}
        <div className="flex-1 overflow-auto mt-4 rounded-xl border border-slate-800 bg-slate-950/70">
          <table className="w-full text-left border-collapse text-[11px]">
            <thead className="sticky top-0 bg-slate-900 text-slate-300 font-mono">
              <tr>
                <th className="p-2 border-b border-r border-slate-800 sticky left-0 bg-slate-900 z-10 min-w-[170px]">
                  Siswa ({monthLabel})
                </th>
                {dayList.map((d) => (
                  <th key={d} className="p-1.5 border-b border-r border-slate-800 text-center min-w-[24px]">
                    {d}
                  </th>
                ))}
                <th className="p-2 border-b border-r border-slate-800 text-center text-emerald-300">H</th>
                <th className="p-2 border-b border-r border-slate-800 text-center text-amber-300">T</th>
                <th className="p-2 border-b border-slate-800 text-center text-cyan-300">Jml</th>
              </tr>
            </thead>
            <tbody>
              {matrixRows.map((row) => (
                <tr key={row.student.id} className="hover:bg-slate-900/60">
                  <td className="p-2 border-b border-r border-slate-800/80 sticky left-0 bg-[#0b1120] z-10">
                    <div className="font-bold text-white truncate max-w-[165px]">{row.student.name}</div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      {row.student.nisn} · {row.student.class}
                    </div>
                  </td>
                  {dayList.map((d) => {
                    const c = row.cells[d];
                    return (
                      <td
                        key={d}
                        className={`p-1 border-b border-r border-slate-800/60 text-center font-mono font-bold ${
                          c === 'H'
                            ? 'text-emerald-300 bg-emerald-950/30'
                            : c === 'T'
                            ? 'text-amber-300 bg-amber-950/30'
                            : c === 'I'
                            ? 'text-sky-300 bg-sky-950/30'
                            : 'text-slate-700'
                        }`}
                      >
                        {c || '·'}
                      </td>
                    );
                  })}
                  <td className="p-2 border-b border-r border-slate-800 text-center font-mono font-bold text-emerald-300">
                    {row.hCount}
                  </td>
                  <td className="p-2 border-b border-r border-slate-800 text-center font-mono font-bold text-amber-300">
                    {row.tCount}
                  </td>
                  <td className="p-2 border-b border-slate-800 text-center font-mono font-extrabold text-cyan-300">
                    {row.totalActive}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Signature Preview Footer */}
        <div className="mt-3 pt-3 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-slate-400">
          <span>
            Keterangan: <strong className="text-emerald-300">H</strong> = Hadir Tepat Waktu ·{' '}
            <strong className="text-amber-300">T</strong> = Terlambat · <strong className="text-sky-300">I</strong> = Izin
          </span>
          <span className="font-mono text-slate-300">
            Pengesah: {pembinaProfile.name} (NIP. {pembinaProfile.nip})
          </span>
        </div>
      </div>
    </div>
  );
};
