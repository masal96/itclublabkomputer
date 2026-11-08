import { Student, AttendanceRecord } from '../types';

/**
 * Normalizes an Indonesian phone number to international format (628...)
 * Example: '0812-3456-7890' -> '6281234567890'
 */
export function formatWhatsAppNumber(phone?: string): string {
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

/**
 * Creates an official, polite, and comprehensive Indonesian WhatsApp notification message
 * for the student's parent or guardian.
 */
export function generateAttendanceWhatsAppMessage(
  student: Student,
  record: AttendanceRecord
): string {
  const dateObj = new Date(record.timestamp);
  const timeFormatted = dateObj.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  const dateFormatted = dateObj.toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const tapType = record.tapType || 'Masuk';
  const isMasuk = tapType === 'Masuk';
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
⏰ *Waktu Tap:* ${timeFormatted} WIB
📅 *Hari, Tanggal:* ${dateFormatted}
💳 *Metode Presensi:* ${record.method} (Kartu Digital)
📍 *Lokasi:* Lab Komputer Sekolah
📝 *Catatan Sistem:* ${record.notes || '-'}

_${closingMessage}_

Mohon bantu pantau kehadiran ananda demi kenyamanan, keselamatan, dan ketertiban belajar bersama.

_Salam hormat,_
*Tim Pembina Laboratorium Komputer & IT Club*
--------------------------------------------------`;
}

/**
 * Returns direct WhatsApp click-to-chat URL
 */
export function getWhatsAppDirectUrl(phone: string, message: string): string {
  const cleanPhone = formatWhatsAppNumber(phone);
  const encodedText = encodeURIComponent(message);
  return `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodedText}`;
}

/**
 * Triggers opening WhatsApp in a new window/tab safely
 */
export function openWhatsAppNotification(student: Student, record: AttendanceRecord): boolean {
  const targetPhone = student.parentPhone || student.phone;
  if (!targetPhone) return false;

  const message = generateAttendanceWhatsAppMessage(student, record);
  const url = getWhatsAppDirectUrl(targetPhone, message);

  try {
    const newWindow = window.open(url, '_blank', 'noopener,noreferrer');
    if (newWindow) {
      newWindow.focus();
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

/**
 * Configuration schema for Automated WhatsApp Notifications
 */
export interface WhatsAppGatewayConfig {
  mode: 'gateway' | 'direct'; // 'gateway' = background HTTP API, 'direct' = WhatsApp Web / App
  provider: 'fonnte' | 'custom' | 'demo';
  apiKey: string; // Token Fonnte
  customEndpoint?: string; // Custom webhook URL
  enabled: boolean; // Auto-send toggle
}

export const DEFAULT_WA_CONFIG: WhatsAppGatewayConfig = {
  mode: 'direct',
  provider: 'fonnte',
  apiKey: '',
  customEndpoint: '',
  enabled: true, // Default: AKTIF otomatis
};

export function getWhatsAppConfig(): WhatsAppGatewayConfig {
  try {
    const saved = localStorage.getItem('itclub_wa_gateway_config');
    if (saved) {
      const parsed = JSON.parse(saved);
      return { ...DEFAULT_WA_CONFIG, ...parsed };
    }
  } catch {}
  return DEFAULT_WA_CONFIG;
}

export function saveWhatsAppConfig(config: WhatsAppGatewayConfig): void {
  try {
    localStorage.setItem('itclub_wa_gateway_config', JSON.stringify(config));
  } catch {}
}

/**
 * Sends automated WhatsApp notification according to configured mode:
 * 1. Gateway API (Fonnte / Custom Webhook / Demo background delivery)
 * 2. Direct click-to-chat link
 */
export async function sendAutomatedWhatsAppNotification(
  student: Student,
  record: AttendanceRecord,
  config: WhatsAppGatewayConfig
): Promise<{ success: boolean; method: 'gateway' | 'direct'; message: string; url?: string }> {
  const targetPhone = student.parentPhone || student.phone;
  if (!targetPhone) {
    return {
      success: false,
      method: config.mode,
      message: `Nomor WhatsApp wali murid ${student.name} belum terdaftar di data siswa.`,
    };
  }

  const cleanPhone = formatWhatsAppNumber(targetPhone);
  const messageText = generateAttendanceWhatsAppMessage(student, record);
  const directUrl = getWhatsAppDirectUrl(cleanPhone, messageText);

  // If Gateway Mode is chosen
  if (config.mode === 'gateway') {
    if (config.provider === 'fonnte') {
      if (!config.apiKey || config.apiKey.trim() === '') {
        // Fall back to direct WhatsApp if API key is not yet set
        const opened = openWhatsAppNotification(student, record);
        return {
          success: opened,
          method: 'direct',
          message: opened
            ? `Token Fonnte belum diisi. Mengalihkan otomatis ke WhatsApp Web untuk wali ${student.name}...`
            : `Token Fonnte belum diisi. Klik tombol WhatsApp untuk mengirim pesan ke wali ${student.name}.`,
          url: directUrl,
        };
      }

      try {
        const formData = new FormData();
        formData.append('target', cleanPhone);
        formData.append('message', messageText);

        const res = await fetch('https://api.fonnte.com/send', {
          method: 'POST',
          headers: {
            Authorization: config.apiKey.trim(),
          },
          body: formData,
        });

        const data = await res.json().catch(() => ({}));
        if (res.ok && (data.status === true || data.status === 'true' || data.id)) {
          return {
            success: true,
            method: 'gateway',
            message: `Notifikasi WA otomatis terkirim via Fonnte Gateway ke wali ${student.name} (${targetPhone})!`,
          };
        } else {
          return {
            success: false,
            method: 'gateway',
            message: `Gagal via Fonnte: ${data.reason || data.message || 'Periksa token Fonnte'}. Mengalihkan ke tautan langsung...`,
            url: directUrl,
          };
        }
      } catch (err: any) {
        return {
          success: false,
          method: 'gateway',
          message: `Koneksi Fonnte bermasalah (${err.message || 'Cek internet'}). Mengalihkan ke tautan langsung...`,
          url: directUrl,
        };
      }
    } else if (config.provider === 'custom') {
      if (!config.customEndpoint || config.customEndpoint.trim() === '') {
        return {
          success: false,
          method: 'gateway',
          message: 'URL endpoint webhook kustom belum diisi di Pengaturan WA.',
          url: directUrl,
        };
      }

      try {
        const res = await fetch(config.customEndpoint.trim(), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            phone: cleanPhone,
            target: targetPhone,
            studentName: student.name,
            nisn: student.nisn,
            class: student.class,
            division: student.division,
            tapType: record.tapType || 'Masuk',
            status: record.status,
            timestamp: record.timestamp,
            message: messageText,
          }),
        });

        if (res.ok) {
          return {
            success: true,
            method: 'gateway',
            message: `Notifikasi WA terkirim otomatis via Webhook ke wali ${student.name} (${targetPhone})!`,
          };
        } else {
          return {
            success: false,
            method: 'gateway',
            message: `Webhook merespons status HTTP ${res.status}. Mengalihkan ke WhatsApp langsung...`,
            url: directUrl,
          };
        }
      } catch (err: any) {
        return {
          success: false,
          method: 'gateway',
          message: `Koneksi webhook gagal: ${err.message}. Mengalihkan ke tautan langsung...`,
          url: directUrl,
        };
      }
    } else if (config.provider === 'demo') {
      // Demo simulated automated background dispatch
      await new Promise((r) => setTimeout(r, 600));
      return {
        success: true,
        method: 'gateway',
        message: `[Simulasi Otomatis Berhasil] Notifikasi WhatsApp ke wali ${student.name} (${targetPhone}) telah dikirim dari server!`,
      };
    }
  }

  // Direct Mode (WhatsApp Web / App)
  const opened = openWhatsAppNotification(student, record);
  return {
    success: opened,
    method: 'direct',
    message: opened
      ? `Jendela WhatsApp otomatis terbuka untuk wali murid ${student.name} (${targetPhone}).`
      : `Browser memblokir jendela pop-up. Silakan klik tombol "Buka WhatsApp" untuk wali ${student.name}.`,
    url: directUrl,
  };
}

/**
 * Tests the WhatsApp Gateway with a custom phone number
 */
export async function testWhatsAppGateway(
  targetPhone: string,
  config: WhatsAppGatewayConfig
): Promise<{ success: boolean; message: string }> {
  if (!targetPhone) {
    return { success: false, message: 'Masukkan nomor WhatsApp tujuan uji coba.' };
  }

  const cleanPhone = formatWhatsAppNumber(targetPhone);
  const testMessage = `🔔 *UJI COBA NOTIFIKASI WHATSAPP LAB KOMPUTER & IT CLUB*
--------------------------------------------------
Halo! Ini adalah pesan pengujian koneksi WhatsApp otomatis dari sistem Presensi Lab Komputer & IT Club.

Koneksi Gateway WhatsApp Anda berhasil terhubung dan siap mengirimkan notifikasi presensi siswa kepada wali murid secara otomatis.

_Waktu Uji:_ ${new Date().toLocaleTimeString('id-ID')} WIB
_Status:_ *Koneksi Berhasil & Aktif*
--------------------------------------------------`;

  if (config.mode === 'gateway') {
    if (config.provider === 'fonnte') {
      if (!config.apiKey) {
        return { success: false, message: 'Masukkan Token API Fonnte terlebih dahulu untuk uji coba.' };
      }

      try {
        const formData = new FormData();
        formData.append('target', cleanPhone);
        formData.append('message', testMessage);

        const res = await fetch('https://api.fonnte.com/send', {
          method: 'POST',
          headers: { Authorization: config.apiKey.trim() },
          body: formData,
        });

        const data = await res.json().catch(() => ({}));
        if (res.ok && (data.status === true || data.status === 'true' || data.id)) {
          return { success: true, message: `Pesan uji coba berhasil terkirim ke ${targetPhone} via Fonnte Gateway!` };
        } else {
          return { success: false, message: `Gagal: ${data.reason || data.message || 'Cek token API Fonnte'}` };
        }
      } catch (err: any) {
        return { success: false, message: `Koneksi gagal: ${err.message}` };
      }
    } else if (config.provider === 'custom') {
      if (!config.customEndpoint) {
        return { success: false, message: 'Masukkan URL Webhook kustom terlebih dahulu.' };
      }
      try {
        const res = await fetch(config.customEndpoint.trim(), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            phone: cleanPhone,
            message: testMessage,
            type: 'test_connection',
          }),
        });
        if (res.ok) {
          return { success: true, message: `Pesan uji coba webhook berhasil dikirim ke ${config.customEndpoint}!` };
        }
        return { success: false, message: `Webhook merespons kode status HTTP ${res.status}` };
      } catch (err: any) {
        return { success: false, message: `Gagal menghubungi webhook: ${err.message}` };
      }
    } else if (config.provider === 'demo') {
      await new Promise((r) => setTimeout(r, 800));
      return { success: true, message: `[Simulasi Sukses] Pesan pengujian berhasil dikirim ke nomor ${targetPhone}!` };
    }
  }

  // Direct test
  const directUrl = getWhatsAppDirectUrl(cleanPhone, testMessage);
  window.open(directUrl, '_blank', 'noopener,noreferrer');
  return { success: true, message: `Membuka WhatsApp Web untuk nomor pengujian ${targetPhone}...` };
}
