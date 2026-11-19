import express, { type Request, type Response, type NextFunction } from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  query,
  where,
  orderBy,
  limit,
  writeBatch,
  type Firestore,
} from 'firebase/firestore';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ==========================================
// 1. LOAD FIREBASE CONFIG & INITIALIZE DB
// ==========================================
interface FirebaseAppletConfig {
  apiKey?: string;
  authDomain?: string;
  projectId?: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId?: string;
  firestoreDatabaseId?: string;
}

function loadFirebaseConfig(): FirebaseAppletConfig {
  try {
    const configPath = path.join(__dirname, 'firebase-applet-config.json');
    if (fs.existsSync(configPath)) {
      const raw = fs.readFileSync(configPath, 'utf-8');
      return JSON.parse(raw) as FirebaseAppletConfig;
    }
  } catch (err) {
    console.warn('[Server] Warning reading firebase-applet-config.json:', err);
  }
  return {};
}

const fileConfig = loadFirebaseConfig();
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY || fileConfig.apiKey || 'AIzaSyDj9YZdJYNzfVQCoAbNzL4yOteSn0PWkG0',
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN || fileConfig.authDomain || 'angular-bonbon-93kqt.firebaseapp.com',
  projectId: process.env.VITE_FIREBASE_PROJECT_ID || fileConfig.projectId || 'angular-bonbon-93kqt',
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET || fileConfig.storageBucket || 'angular-bonbon-93kqt.firebasestorage.app',
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || fileConfig.messagingSenderId || '59593777959',
  appId: process.env.VITE_FIREBASE_APP_ID || fileConfig.appId || '1:59593777959:web:41070e9e23b843b99dbf02',
  firestoreDatabaseId:
    process.env.VITE_FIREBASE_DATABASE_ID ||
    fileConfig.firestoreDatabaseId ||
    'ai-studio-labkomputeritclu-830bf4bb-f7b8-46a0-ac95-dd0dd4c673e1',
};

const firebaseApp = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const db: Firestore =
  firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== '(default)'
    ? getFirestore(firebaseApp, firebaseConfig.firestoreDatabaseId)
    : getFirestore(firebaseApp);

// ==========================================
// 2. TYPES & HELPERS
// ==========================================
interface StudentDoc {
  id: string;
  nisn: string;
  name: string;
  class: string;
  division: string;
  rfidUid: string;
  qrCodeData: string;
  avatarUrl: string;
  email: string;
  phone: string;
  parentName?: string;
  parentPhone?: string;
  joinedDate: string;
  status: 'Aktif' | 'Alumni' | 'Pengurus';
  position?: string;
}

interface AttendanceDoc {
  id: string;
  timestamp: string;
  studentId: string;
  studentName: string;
  class: string;
  nisn: string;
  division: string;
  method: 'RFID' | 'QR Code' | 'Manual';
  status: 'Hadir' | 'Terlambat' | 'Izin';
  tapType: 'Masuk' | 'Pulang';
  sessionTitle: string;
  notes?: string;
  parentPhone?: string;
  waSent?: boolean;
}

interface WhatsAppSettingsDoc {
  mode?: 'gateway' | 'direct';
  provider?: 'fonnte' | 'custom' | 'demo';
  apiKey?: string;
  customEndpoint?: string;
  enabled?: boolean;
}

let lastUnknownTap: { uid: string; detectedAt: string; deviceName?: string } | null = null;

function sanitizeForFirestore(obj: Record<string, unknown>): Record<string, unknown> {
  const cleaned: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value === undefined) continue;
    if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
      cleaned[key] = sanitizeForFirestore(value as Record<string, unknown>);
    } else {
      cleaned[key] = value;
    }
  }
  return cleaned;
}

/**
 * Normalizes RFID UID so formats like "A4:B2:78:19", "A4 B2 78 19", "a4b27819", or "A4B2-7819" all match.
 */
function normalizeRfidUid(uid: string): string {
  return uid.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
}

/**
 * Returns current time parts in Asia/Jakarta (WIB, UTC+7) reliably even on UTC servers.
 */
function getJakartaTimeInfo(date: Date = new Date()) {
  const wibTime = new Date(date.getTime() + 7 * 60 * 60 * 1000);
  const hours = wibTime.getUTCHours();
  const minutes = wibTime.getUTCMinutes();
  const year = wibTime.getUTCFullYear();
  const month = String(wibTime.getUTCMonth() + 1).padStart(2, '0');
  const day = String(wibTime.getUTCDate()).padStart(2, '0');
  const dateKey = `${year}-${month}-${day}`;
  const timeWIB = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
  const dateFormatted = date.toLocaleDateString('id-ID', {
    timeZone: 'Asia/Jakarta',
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  return { hours, minutes, totalMinutes: hours * 60 + minutes, dateKey, timeWIB, dateFormatted };
}

function evaluateAttendanceWIB(tapType: 'Masuk' | 'Pulang', totalMinutes: number) {
  const MASUK_SCHEDULE_MINS = 11 * 60 + 15; // 11:15 WIB
  const LATE_THRESHOLD_MINS = 11 * 60 + 25; // 11:25 WIB
  const PULANG_SCHEDULE_MINS = 13 * 60 + 40; // 13:40 WIB

  if (tapType === 'Masuk') {
    const isLate = totalMinutes > LATE_THRESHOLD_MINS;
    const isEarly = totalMinutes < MASUK_SCHEDULE_MINS;
    const status: 'Hadir' | 'Terlambat' = isLate ? 'Terlambat' : 'Hadir';

    let notes = 'Tap Masuk Tepat Waktu (Jadwal 11:15)';
    if (isLate) {
      const lateBy = totalMinutes - LATE_THRESHOLD_MINS;
      notes = `Tap Masuk Terlambat ${lateBy} menit (Lewat batas 11:25)`;
    } else if (isEarly) {
      const earlyBy = MASUK_SCHEDULE_MINS - totalMinutes;
      notes = `Tap Masuk Lebih Awal ${earlyBy} menit (Sebelum 11:15)`;
    }
    return { status, notes };
  }

  const isEarlyDeparture = totalMinutes < PULANG_SCHEDULE_MINS;
  let notes = 'Tap Pulang Sesuai Jadwal (13:40)';
  if (isEarlyDeparture) {
    const earlyBy = PULANG_SCHEDULE_MINS - totalMinutes;
    notes = `Tap Pulang Lebih Awal ${earlyBy} menit (Sebelum jam 13:40)`;
  }
  return { status: 'Hadir' as const, notes };
}

function formatWhatsAppNumber(phone?: string): string {
  if (!phone) return '';
  let cleaned = phone.replace(/\D/g, '');
  if (cleaned.startsWith('0')) {
    cleaned = '62' + cleaned.substring(1);
  } else if (cleaned.startsWith('8')) {
    cleaned = '628' + cleaned.substring(1);
  } else if (!cleaned.startsWith('62')) {
    cleaned = '62' + cleaned;
  }
  return cleaned;
}

function buildWhatsAppMessage(student: StudentDoc, record: AttendanceDoc, timeWIB: string, dateFormatted: string): string {
  const isMasuk = record.tapType === 'Masuk';
  const isTerlambat = record.status === 'Terlambat';
  const statusLabel = isMasuk
    ? isTerlambat
      ? '⚠️ TAP MASUK (TERLAMBAT)'
      : '🟢 TAP MASUK (TEPAT WAKTU)'
    : '🔵 TAP PULANG (SELESAI PRAKTIKUM)';

  const parentSalutation = student.parentName
    ? `Bapak/Ibu *${student.parentName}* (Wali dari ananda *${student.name}*)`
    : `Bapak/Ibu Wali Murid dari ananda *${student.name}*`;

  const closingMessage = isMasuk
    ? 'Ananda telah tiba di Laboratorium Komputer dan saat ini sedang mengikuti kegiatan belajar / praktikum IT Club.'
    : 'Ananda telah selesai melaksanakan kegiatan praktikum di Laboratorium Komputer dan sedang dalam perjalanan pulang ke rumah.';

  return `🏫 *NOTIFIKASI PRESENSI LAB KOMPUTER & IT CLUB*
--------------------------------------------------
Yth. ${parentSalutation},

Kami menginformasikan bahwa siswa telah berhasil melakukan presensi kehadiran di Laboratorium Komputer sekolah dengan rincian berikut:

👤 *Nama Siswa:* ${student.name}
🆔 *NISN:* ${student.nisn}
📚 *Kelas:* ${student.class}
💻 *Divisi:* ${student.division}

📌 *Status Presensi:* ${statusLabel}
⏰ *Waktu Tap:* ${timeWIB} WIB
📅 *Hari, Tanggal:* ${dateFormatted}
💳 *Metode Presensi:* ${record.method} (Mesin Hardware ESP32)
📍 *Lokasi:* Lab Komputer Sekolah
📝 *Catatan Sistem:* ${record.notes || '-'}

_${closingMessage}_

Mohon bantu pantau kehadiran ananda demi kenyamanan, keselamatan, dan ketertiban belajar bersama.

_Salam hormat,_
*Tim Pembina Laboratorium Komputer & IT Club*
--------------------------------------------------`;
}

async function dispatchWhatsAppServerSide(
  student: StudentDoc,
  record: AttendanceDoc,
  timeWIB: string,
  dateFormatted: string
): Promise<{ sent: boolean; detail: string }> {
  const targetPhone = student.parentPhone || student.phone;
  if (!targetPhone) {
    return { sent: false, detail: 'Nomor WA wali murid belum terdaftar' };
  }

  let waSettings: WhatsAppSettingsDoc = { mode: 'direct', provider: 'fonnte', apiKey: '', enabled: true };
  try {
    const snap = await getDoc(doc(db, 'settings', 'whatsapp'));
    if (snap.exists()) {
      waSettings = snap.data() as WhatsAppSettingsDoc;
    }
  } catch (err) {
    console.warn('[API WA] Gagal membaca settings/whatsapp:', err);
  }

  if (waSettings.enabled === false) {
    return { sent: false, detail: 'Auto WA Wali sedang dinonaktifkan di pengaturan' };
  }

  const cleanPhone = formatWhatsAppNumber(targetPhone);
  const messageText = buildWhatsAppMessage(student, record, timeWIB, dateFormatted);

  if (waSettings.mode === 'gateway' && waSettings.provider === 'fonnte' && waSettings.apiKey?.trim()) {
    try {
      const formData = new FormData();
      formData.append('target', cleanPhone);
      formData.append('message', messageText);

      const res = await fetch('https://api.fonnte.com/send', {
        method: 'POST',
        headers: {
          Authorization: waSettings.apiKey.trim(),
        },
        body: formData,
      });
      const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;
      if (res.ok && (data.status === true || data.status === 'true' || Boolean(data.id))) {
        return { sent: true, detail: `Terkirim otomatis via Fonnte ke ${targetPhone}` };
      }
      return { sent: false, detail: `Gagal Fonnte: ${String(data.reason || data.message || res.status)}` };
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      return { sent: false, detail: `Error koneksi Fonnte: ${msg}` };
    }
  }

  if (waSettings.mode === 'gateway' && waSettings.provider === 'custom' && waSettings.customEndpoint?.trim()) {
    try {
      const res = await fetch(waSettings.customEndpoint.trim(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: cleanPhone,
          target: targetPhone,
          studentName: student.name,
          nisn: student.nisn,
          class: student.class,
          division: student.division,
          tapType: record.tapType,
          status: record.status,
          timestamp: record.timestamp,
          message: messageText,
        }),
      });
      if (res.ok) {
        return { sent: true, detail: `Terkirim otomatis via Webhook ke ${targetPhone}` };
      }
      return { sent: false, detail: `Webhook HTTP ${res.status}` };
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      return { sent: false, detail: `Error koneksi Webhook: ${msg}` };
    }
  }

  if (waSettings.mode === 'gateway' && waSettings.provider === 'demo') {
    return { sent: true, detail: `[Mode Demo] Simulasi WA sukses ke ${targetPhone}` };
  }

  return {
    sent: false,
    detail: 'Token Gateway Fonnte / Webhook belum diaktifkan (mode saat ini: Direct Link)',
  };
}

// ==========================================
// 3. EXPRESS APP & REST API ROUTES
// ==========================================
const app = express();

// Parse JSON & URL-encoded form bodies (compatible with ESP32 Arduino HTTPClient)
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// Open CORS for /api/* so ESP32, Postman, or external tools can call cleanly
app.use('/api', (req: Request, res: Response, next: NextFunction) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-API-Key');
  if (req.method === 'OPTIONS') {
    res.sendStatus(204);
    return;
  }

  // Optional API key check ONLY if RFID_API_KEY env var is explicitly configured
  const requiredKey = process.env.RFID_API_KEY;
  if (requiredKey && req.path !== '/health') {
    const providedKey =
      (req.headers['x-api-key'] as string) ||
      (req.query.apiKey as string) ||
      (req.body && typeof req.body === 'object' ? (req.body.apiKey as string) : '');
    if (providedKey !== requiredKey) {
      res.status(401).json({
        success: false,
        error: 'Unauthorized: X-API-Key tidak valid',
      });
      return;
    }
  }
  next();
});

// 1) Health check
app.get('/api/health', async (_req: Request, res: Response) => {
  const { timeWIB, dateKey } = getJakartaTimeInfo();
  let firestoreConnected = false;
  try {
    await getDoc(doc(db, 'test', 'connection'));
    firestoreConnected = true;
  } catch {
    firestoreConnected = false;
  }

  res.json({
    success: true,
    service: 'Lab Komputer & IT Club REST API',
    status: 'online',
    databaseId: firebaseConfig.firestoreDatabaseId,
    firestoreConnected,
    serverDateWIB: dateKey,
    serverTimeWIB: timeWIB,
    endpoints: [
      'GET  /api/health',
      'GET  /api/students',
      'GET  /api/rfid/check/:uid',
      'POST /api/rfid/tap',
      'GET  /api/rfid/tap?uid=...',
      'GET  /api/rfid/last-unknown',
      'GET  /api/attendance',
      'POST /api/attendance/reset',
      'GET  /api/assessments',
    ],
  });
});

// 2) List / search students
app.get('/api/students', async (req: Request, res: Response) => {
  try {
    const snapshot = await getDocs(collection(db, 'students'));
    let list: StudentDoc[] = [];
    snapshot.forEach((d) => {
      list.push(d.data() as StudentDoc);
    });

    const rfidParam = String(req.query.rfid || req.query.uid || '').trim();
    const nisnParam = String(req.query.nisn || '').trim();

    if (rfidParam) {
      const normalizedQuery = normalizeRfidUid(rfidParam);
      list = list.filter((s) => normalizeRfidUid(s.rfidUid || '') === normalizedQuery);
    }
    if (nisnParam) {
      list = list.filter((s) => String(s.nisn) === nisnParam);
    }

    res.json({
      success: true,
      count: list.length,
      data: list,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    res.status(500).json({ success: false, error: message });
  }
});

// 3) Quick check if RFID UID is registered
app.get('/api/rfid/check/:uid', async (req: Request, res: Response) => {
  try {
    const rawUid = String(req.params.uid || '').trim();
    const normalized = normalizeRfidUid(rawUid);
    if (!normalized) {
      res.status(400).json({ success: false, error: 'Parameter UID wajib diisi' });
      return;
    }

    const snapshot = await getDocs(collection(db, 'students'));
    let matched: StudentDoc | null = null;
    snapshot.forEach((d) => {
      const s = d.data() as StudentDoc;
      if (normalizeRfidUid(s.rfidUid || '') === normalized || s.nisn === rawUid) {
        matched = s;
      }
    });

    if (!matched) {
      res.status(404).json({
        success: false,
        registered: false,
        uid: rawUid,
        message: 'Kartu RFID belum terdaftar',
      });
      return;
    }

    const found = matched as StudentDoc;
    res.json({
      success: true,
      registered: true,
      data: {
        id: found.id,
        name: found.name,
        nisn: found.nisn,
        class: found.class,
        division: found.division,
        rfidUid: found.rfidUid,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    res.status(500).json({ success: false, error: message });
  }
});

// 4) Last unknown RFID UID tapped on hardware (helps teacher register new cards)
app.get('/api/rfid/last-unknown', (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: lastUnknownTap,
  });
});

// 5) Shared tap processor for POST /api/rfid/tap, GET /api/rfid/tap, POST /api/attendance/tap
async function handleRfidTap(req: Request, res: Response) {
  try {
    const body = (req.body && typeof req.body === 'object' ? req.body : {}) as Record<string, unknown>;
    const rawUid = String(
      body.uid ?? body.rfidUid ?? body.rfid ?? body.cardUid ?? body.nisn ?? req.query.uid ?? req.query.rfid ?? ''
    ).trim();

    if (!rawUid) {
      res.status(400).json({
        success: false,
        error: 'Parameter uid / rfidUid wajib dikirim (contoh: { "uid": "A4B2-7819-21" })',
      });
      return;
    }

    const forcedTapRaw = String(body.tapType ?? req.query.tapType ?? '').trim();
    const forcedTapType: 'Masuk' | 'Pulang' | undefined =
      forcedTapRaw === 'Masuk' || forcedTapRaw === 'Pulang' ? forcedTapRaw : undefined;
    const deviceName = String(body.deviceName ?? req.query.deviceName ?? 'ESP32 RFID Reader').trim();
    const sessionTitle = String(body.sessionTitle ?? 'Sesi Praktikum Lab & IT Club').trim();
    const skipWa = body.skipWa === true || req.query.skipWa === 'true';

    // Find student in Firestore
    const normalizedInput = normalizeRfidUid(rawUid);
    const studentsSnap = await getDocs(collection(db, 'students'));
    let matchedStudent: StudentDoc | null = null;

    studentsSnap.forEach((d) => {
      const s = d.data() as StudentDoc;
      if (
        normalizeRfidUid(s.rfidUid || '') === normalizedInput ||
        String(s.nisn).trim() === rawUid
      ) {
        matchedStudent = s;
      }
    });

    if (!matchedStudent) {
      lastUnknownTap = {
        uid: rawUid.toUpperCase(),
        detectedAt: new Date().toISOString(),
        deviceName,
      };
      res.status(404).json({
        success: false,
        error: `Kartu RFID (${rawUid}) tidak terdaftar di sistem`,
        uid: rawUid,
      });
      return;
    }

    const student = matchedStudent as StudentDoc;
    const now = new Date();
    const { totalMinutes, dateKey, timeWIB, dateFormatted } = getJakartaTimeInfo(now);

    // Resolve Masuk vs Pulang automatically based on today's logs in Firestore
    let resolvedTapType: 'Masuk' | 'Pulang' = forcedTapType || 'Masuk';
    if (!forcedTapType) {
      const attQuery = query(collection(db, 'attendance'), where('studentId', '==', student.id));
      const attSnap = await getDocs(attQuery);
      let hasCheckedInToday = false;
      let hasCheckedOutToday = false;

      attSnap.forEach((d) => {
        const rec = d.data() as AttendanceDoc;
        if (!rec.timestamp) return;
        const recDate = getJakartaTimeInfo(new Date(rec.timestamp)).dateKey;
        if (recDate === dateKey) {
          if (rec.tapType === 'Masuk' || !rec.tapType) hasCheckedInToday = true;
          if (rec.tapType === 'Pulang') hasCheckedOutToday = true;
        }
      });

      const PULANG_SCHEDULE_MINS = 13 * 60 + 40; // 13:40 WIB
      if (hasCheckedInToday && !hasCheckedOutToday) {
        resolvedTapType = 'Pulang';
      } else if (totalMinutes >= PULANG_SCHEDULE_MINS && hasCheckedInToday) {
        resolvedTapType = 'Pulang';
      } else {
        resolvedTapType = 'Masuk';
      }
    }

    const { status, notes } = evaluateAttendanceWIB(resolvedTapType, totalMinutes);
    const recordId = `att-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;

    const newRecord: AttendanceDoc = {
      id: recordId,
      timestamp: now.toISOString(),
      studentId: student.id,
      studentName: student.name,
      class: student.class,
      nisn: student.nisn,
      division: student.division,
      method: 'RFID',
      status,
      tapType: resolvedTapType,
      sessionTitle,
      notes: `${notes} · [${deviceName}]`,
      parentPhone: student.parentPhone || student.phone || '',
      waSent: false,
    };

    // Save attendance record to Cloud Firestore
    await setDoc(doc(db, 'attendance', recordId), sanitizeForFirestore(newRecord as unknown as Record<string, unknown>));

    // Send WhatsApp notification automatically if enabled
    let waResult = { sent: false, detail: 'Dilewati (skipWa=true)' };
    if (!skipWa) {
      waResult = await dispatchWhatsAppServerSide(student, newRecord, timeWIB, dateFormatted);
      if (waResult.sent) {
        await setDoc(doc(db, 'attendance', recordId), { waSent: true }, { merge: true });
      }
    }

    res.json({
      success: true,
      message: `Tap ${resolvedTapType} berhasil untuk ${student.name}`,
      data: {
        recordId,
        studentId: student.id,
        studentName: student.name,
        nisn: student.nisn,
        class: student.class,
        division: student.division,
        rfidUid: student.rfidUid,
        tapType: resolvedTapType,
        status,
        timeWIB,
        dateWIB: dateKey,
        notes: newRecord.notes,
        timestamp: newRecord.timestamp,
        waSent: waResult.sent,
        waDetail: waResult.detail,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[API /rfid/tap] Error:', err);
    res.status(500).json({
      success: false,
      error: `Gagal memproses tap RFID: ${message}`,
    });
  }
}

app.post('/api/rfid/tap', handleRfidTap);
app.get('/api/rfid/tap', handleRfidTap);
app.post('/api/attendance/tap', handleRfidTap);

// 6) Get recent attendance logs
app.get('/api/attendance', async (req: Request, res: Response) => {
  try {
    const maxLimit = Math.min(Math.max(Number(req.query.limit) || 50, 1), 200);
    const q = query(collection(db, 'attendance'), orderBy('timestamp', 'desc'), limit(maxLimit));
    const snapshot = await getDocs(q);
    const records: AttendanceDoc[] = [];
    snapshot.forEach((d) => {
      records.push(d.data() as AttendanceDoc);
    });

    res.json({
      success: true,
      count: records.length,
      data: records,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    res.status(500).json({ success: false, error: message });
  }
});

// 6b) Reset all stored attendance logs without touching students/cards
app.post('/api/attendance/reset', async (_req: Request, res: Response) => {
  try {
    const snapshot = await getDocs(collection(db, 'attendance'));
    const docs = snapshot.docs;
    const chunkSize = 400;

    for (let i = 0; i < docs.length; i += chunkSize) {
      const batch = writeBatch(db);
      const chunk = docs.slice(i, i + chunkSize);
      for (const d of chunk) {
        batch.delete(d.ref);
      }
      await batch.commit();
    }

    await setDoc(
      doc(db, 'settings', 'attendance_meta'),
      {
        seeded: true,
        lastResetAt: new Date().toISOString(),
        deletedCount: docs.length,
      },
      { merge: true }
    );

    res.json({
      success: true,
      message: `Berhasil mereset ${docs.length} data absensi. Data anggota dan kartu tetap aman.`,
      deletedCount: docs.length,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    res.status(500).json({ success: false, error: message });
  }
});

// 7) Get student IT Club assessments & reports
app.get('/api/assessments', async (req: Request, res: Response) => {
  try {
    const snapshot = await getDocs(collection(db, 'assessments'));
    let list: Record<string, unknown>[] = [];
    snapshot.forEach((d) => {
      list.push(d.data() as Record<string, unknown>);
    });

    const nisnParam = String(req.query.nisn || '').trim();
    const studentIdParam = String(req.query.studentId || '').trim();
    const onlyPublished = req.query.published === 'true';

    if (nisnParam) {
      list = list.filter((a) => String(a.nisn || '').trim() === nisnParam);
    }
    if (studentIdParam) {
      list = list.filter((a) => String(a.studentId || '').trim() === studentIdParam);
    }
    if (onlyPublished) {
      list = list.filter((a) => a.published === true);
    }

    res.json({
      success: true,
      count: list.length,
      data: list,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    res.status(500).json({ success: false, error: message });
  }
});

// Catch-all for unknown /api routes so they always return JSON instead of HTML
app.use('/api', (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: `Endpoint ${req.method} /api${req.path} tidak ditemukan`,
  });
});

// ==========================================
// 4. FRONTEND SERVING (VITE DEV OR DIST PROD)
// ==========================================
async function startServer() {
  const PORT = Number(process.env.PORT) || 3000;
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.join(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Server] Lab Komputer & IT Club Server + REST API running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[Server] Fatal startup error:', err);
  process.exit(1);
});
