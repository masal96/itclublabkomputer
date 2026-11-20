import React, { useMemo } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import {
  BarChart3,
  TrendingUp,
  Award,
  Users,
  CheckCircle2,
  Clock,
  Trophy,
} from 'lucide-react';
import { AttendanceRecord, Student } from '../types';

interface AnalyticsSectionProps {
  students: Student[];
  attendanceRecords: AttendanceRecord[];
  compact?: boolean;
}

export const AnalyticsSection: React.FC<AnalyticsSectionProps> = ({
  students,
  attendanceRecords,
  compact = false,
}) => {
  // Filter to student Masuk records for clean attendance stats
  const studentMasukLogs = useMemo(
    () =>
      attendanceRecords.filter(
        (r) =>
          !r.isPembina &&
          r.studentId !== 'pembina_card' &&
          (r.tapType === 'Masuk' || !r.tapType)
      ),
    [attendanceRecords]
  );

  // 14-day attendance trend
  const dailyTrend = useMemo(() => {
    const days: { dateKey: string; label: string; Hadir: number; Terlambat: number; Total: number }[] = [];
    const now = new Date();
    for (let i = 13; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const dateKey = d.toISOString().slice(0, 10);
      const label = d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' });
      days.push({ dateKey, label, Hadir: 0, Terlambat: 0, Total: 0 });
    }

    const map = new Map(days.map((d) => [d.dateKey, d]));
    for (const rec of studentMasukLogs) {
      if (!rec.timestamp) continue;
      const key = new Date(rec.timestamp).toISOString().slice(0, 10);
      const bucket = map.get(key);
      if (bucket) {
        if (rec.status === 'Terlambat') {
          bucket.Terlambat += 1;
        } else {
          bucket.Hadir += 1;
        }
        bucket.Total += 1;
      }
    }
    return days;
  }, [studentMasukLogs]);

  // Division stats
  const divisionStats = useMemo(() => {
    const map = new Map<string, { division: string; Anggota: number; Kehadiran: number }>();
    for (const s of students) {
      const existing = map.get(s.division) || { division: s.division, Anggota: 0, Kehadiran: 0 };
      existing.Anggota += 1;
      map.set(s.division, existing);
    }
    for (const rec of studentMasukLogs) {
      const key = String(rec.division || 'Lainnya');
      const existing = map.get(key) || { division: key, Anggota: 0, Kehadiran: 0 };
      existing.Kehadiran += 1;
      map.set(key, existing);
    }
    return Array.from(map.values()).map((item) => ({
      ...item,
      shortName: item.division.length > 14 ? `${item.division.slice(0, 12)}..` : item.division,
    }));
  }, [students, studentMasukLogs]);

  // Top 5 most diligent & punctual students
  const leaderboard = useMemo(() => {
    const counts = new Map<
      string,
      { student: Student; hadir: number; tepatWaktu: number; terlambat: number; score: number }
    >();
    for (const s of students) {
      counts.set(s.id, { student: s, hadir: 0, tepatWaktu: 0, terlambat: 0, score: 0 });
    }
    for (const rec of studentMasukLogs) {
      const entry =
        counts.get(rec.studentId) ||
        Array.from(counts.values()).find((e) => e.student.nisn === rec.nisn);
      if (entry) {
        entry.hadir += 1;
        if (rec.status === 'Terlambat') {
          entry.terlambat += 1;
          entry.score += 5;
        } else {
          entry.tepatWaktu += 1;
          entry.score += 10;
        }
      }
    }
    return Array.from(counts.values())
      .sort((a, b) => b.score - a.score || b.tepatWaktu - a.tepatWaktu)
      .slice(0, 5);
  }, [students, studentMasukLogs]);

  const totalMasuk = studentMasukLogs.length;
  const onTimeCount = studentMasukLogs.filter((r) => r.status === 'Hadir').length;
  const lateCount = studentMasukLogs.filter((r) => r.status === 'Terlambat').length;
  const punctualityPct = totalMasuk > 0 ? Math.round((onTimeCount / totalMasuk) * 100) : 100;

  return (
    <div className="space-y-6">
      {/* KPI Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-[#0b1120] border border-cyan-500/25 shadow-lg">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Total Anggota Aktif</span>
            <Users className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-extrabold text-white font-mono">{students.length}</div>
          <p className="text-[11px] text-slate-400 mt-1">Tersebar di {divisionStats.length} divisi</p>
        </div>

        <div className="p-4 rounded-2xl bg-[#0b1120] border border-teal-500/25 shadow-lg">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Total Kehadiran Tercatat</span>
            <CheckCircle2 className="w-4 h-4 text-teal-400" />
          </div>
          <div className="text-2xl font-extrabold text-teal-300 font-mono">{totalMasuk}</div>
          <p className="text-[11px] text-slate-400 mt-1">Log Tap Masuk siswa</p>
        </div>

        <div className="p-4 rounded-2xl bg-[#0b1120] border border-emerald-500/25 shadow-lg">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Tingkat Tepat Waktu</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-300 font-mono">{punctualityPct}%</div>
          <p className="text-[11px] text-slate-400 mt-1">{onTimeCount} tepat waktu · {lateCount} terlambat</p>
        </div>

        <div className="p-4 rounded-2xl bg-[#0b1120] border border-violet-500/25 shadow-lg">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Total Tap (Masuk + Pulang)</span>
            <Clock className="w-4 h-4 text-violet-400" />
          </div>
          <div className="text-2xl font-extrabold text-violet-300 font-mono">{attendanceRecords.length}</div>
          <p className="text-[11px] text-slate-400 mt-1">Termasuk presensi Pembina</p>
        </div>
      </div>

      {/* Charts Row */}
      <div className={`grid grid-cols-1 ${compact ? 'lg:grid-cols-2' : 'lg:grid-cols-12'} gap-6`}>
        {/* 14-Day Attendance Trend */}
        <div
          className={`${
            compact ? '' : 'lg:col-span-7'
          } p-5 rounded-2xl bg-[#0b1120] border border-slate-800 shadow-xl`}
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-cyan-400" />
                <span>Tren Kehadiran 14 Hari Terakhir</span>
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Perbandingan kehadiran tepat waktu dan terlambat per tanggal
              </p>
            </div>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailyTrend} margin={{ top: 8, right: 8, left: -24, bottom: 0 }}>
                <defs>
                  <linearGradient id="gradHadir" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.45} />
                    <stop offset="95%" stopColor="#22d3ee" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="gradLate" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="label" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                <YAxis allowDecimals={false} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: 12,
                    fontSize: 12,
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="Hadir"
                  name="Tepat Waktu"
                  stroke="#22d3ee"
                  strokeWidth={2}
                  fill="url(#gradHadir)"
                />
                <Area
                  type="monotone"
                  dataKey="Terlambat"
                  name="Terlambat"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  fill="url(#gradLate)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Division Distribution Bar Chart */}
        <div
          className={`${
            compact ? '' : 'lg:col-span-5'
          } p-5 rounded-2xl bg-[#0b1120] border border-slate-800 shadow-xl`}
        >
          <div className="mb-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-violet-400" />
              <span>Anggota &amp; Keaktifan per Divisi</span>
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Jumlah siswa terdaftar vs total kehadiran divisi
            </p>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={divisionStats} margin={{ top: 8, right: 8, left: -24, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="shortName" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                <YAxis allowDecimals={false} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: 12,
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="Anggota" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
                <Bar dataKey="Kehadiran" fill="#2dd4bf" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Leaderboard Top 5 Most Disciplined Students */}
      {!compact && (
        <div className="p-5 rounded-2xl bg-[#0b1120] border border-slate-800 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Trophy className="w-4 h-4 text-amber-400" />
                <span>Peringkat 5 Siswa Paling Rajin &amp; Tepat Waktu</span>
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Dihitung otomatis dari catatan Tap Masuk tepat waktu (+10 poin) dan terlambat (+5 poin)
              </p>
            </div>
            <Award className="w-5 h-5 text-amber-400/70" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            {leaderboard.map((item, idx) => (
              <div
                key={item.student.id}
                className={`p-3.5 rounded-xl border flex flex-col justify-between ${
                  idx === 0
                    ? 'bg-amber-950/25 border-amber-500/40'
                    : 'bg-slate-950/70 border-slate-800'
                }`}
              >
                <div className="flex items-center gap-2.5 mb-3">
                  <span
                    className={`w-6 h-6 rounded-lg text-xs font-mono font-extrabold flex items-center justify-center shrink-0 ${
                      idx === 0
                        ? 'bg-amber-400 text-slate-950'
                        : idx === 1
                        ? 'bg-slate-300 text-slate-950'
                        : idx === 2
                        ? 'bg-amber-700 text-white'
                        : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    #{idx + 1}
                  </span>
                  <img
                    src={item.student.avatarUrl}
                    alt={item.student.name}
                    className="w-8 h-8 rounded-full object-cover border border-slate-700"
                  />
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-white truncate">{item.student.name}</div>
                    <div className="text-[10px] text-slate-400 truncate">
                      {item.student.class} · {item.student.division}
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between text-[11px] pt-2 border-t border-slate-800/80">
                  <span className="text-teal-300 font-mono font-bold">{item.hadir}x Hadir</span>
                  <span className="text-amber-300 font-mono">{item.score} pts</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
