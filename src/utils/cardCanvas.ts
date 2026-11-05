import QRCode from 'qrcode';
import { Student } from '../types';

/**
 * Generates a high-resolution PNG image of the front side of the ID Card
 */
export async function generateFrontCardImage(student: Student): Promise<string> {
  const canvas = document.createElement('canvas');
  // High DPI: CR80 standard ratio 85.6mm x 54mm (1012px x 638px at 300 DPI)
  canvas.width = 1012;
  canvas.height = 638;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  // Background gradient (Dark Navy / Tech Charcoal)
  const bgGrad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  bgGrad.addColorStop(0, '#0c1424');
  bgGrad.addColorStop(0.5, '#080d19');
  bgGrad.addColorStop(1, '#120d26');
  ctx.fillStyle = bgGrad;
  ctx.roundRect(0, 0, canvas.width, canvas.height, 28);
  ctx.fill();

  // Outer border with subtle cyan glow
  ctx.lineWidth = 4;
  ctx.strokeStyle = '#06b6d4';
  ctx.stroke();

  // Tech grid lines decoration
  ctx.strokeStyle = 'rgba(6, 182, 212, 0.08)';
  ctx.lineWidth = 1;
  for (let x = 30; x < canvas.width; x += 40) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
  }
  for (let y = 30; y < canvas.height; y += 40) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }

  // Top header bar
  ctx.fillStyle = 'rgba(6, 182, 212, 0.15)';
  ctx.fillRect(0, 0, canvas.width, 100);
  ctx.strokeStyle = 'rgba(6, 182, 212, 0.4)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, 100);
  ctx.lineTo(canvas.width, 100);
  ctx.stroke();

  // Header Title
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 30px "Plus Jakarta Sans", sans-serif';
  ctx.fillText('KARTU ANGGOTA IT CLUB & LAB KOMPUTER', 110, 52);

  ctx.fillStyle = '#22d3ee';
  ctx.font = '500 18px "JetBrains Mono", monospace';
  ctx.fillText('<LabKomputer/> · TA 2026/2027', 110, 80);

  // Logo Icon placeholder
  ctx.fillStyle = '#06b6d4';
  ctx.beginPath();
  ctx.roundRect(36, 24, 52, 52, 12);
  ctx.fill();
  ctx.fillStyle = '#080c16';
  ctx.font = 'bold 24px "JetBrains Mono", monospace';
  ctx.fillText('</>', 42, 60);

  // Student Photo
  try {
    const photo = new Image();
    photo.crossOrigin = 'anonymous';
    photo.src = student.avatarUrl;
    await new Promise((resolve) => {
      photo.onload = resolve;
      photo.onerror = resolve; // Continue if error
    });
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(50, 150, 200, 250, 18);
    ctx.clip();
    if (photo.complete && photo.naturalWidth > 0) {
      ctx.drawImage(photo, 50, 150, 200, 250);
    } else {
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(50, 150, 200, 250);
    }
    ctx.restore();
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#22d3ee';
    ctx.stroke();
  } catch {
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(50, 150, 200, 250);
  }

  // Student Details
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 36px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(student.name, 280, 195);

  ctx.fillStyle = '#94a3b8';
  ctx.font = '600 22px "JetBrains Mono", monospace';
  ctx.fillText(`NISN    : ${student.nisn}`, 280, 245);

  ctx.fillStyle = '#cbd5e1';
  ctx.font = '22px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(`Kelas   : ${student.class}`, 280, 285);

  ctx.fillStyle = '#22d3ee';
  ctx.font = 'bold 22px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(`Divisi  : ${student.division}`, 280, 325);

  ctx.fillStyle = '#a855f7';
  ctx.font = '18px "JetBrains Mono", monospace';
  ctx.fillText(`Jabatan : ${student.position || 'Anggota Aktif'}`, 280, 365);

  // RFID Chip representation
  ctx.fillStyle = '#d97706';
  ctx.beginPath();
  ctx.roundRect(50, 440, 80, 60, 8);
  ctx.fill();
  ctx.fillStyle = '#fde68a';
  ctx.fillRect(60, 452, 60, 36);

  ctx.fillStyle = '#38bdf8';
  ctx.font = 'bold 18px "JetBrains Mono", monospace';
  ctx.fillText('SMART CARD LAB ACCESS', 145, 478);

  // Generate QR Code on right side
  try {
    const qrDataUrl = await QRCode.toDataURL(student.qrCodeData, {
      width: 220,
      margin: 1,
      color: { dark: '#080c16', light: '#ffffff' },
    });
    const qrImg = new Image();
    qrImg.src = qrDataUrl;
    await new Promise((resolve) => {
      qrImg.onload = resolve;
    });
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.roundRect(750, 150, 220, 220, 14);
    ctx.fill();
    ctx.drawImage(qrImg, 760, 160, 200, 200);

    ctx.fillStyle = '#22d3ee';
    ctx.font = 'bold 16px "JetBrains Mono", monospace';
    ctx.fillText('SCAN PRESENSI', 795, 395);
  } catch (e) {
    console.error('Failed to draw QR', e);
  }

  // Footer bar on card
  ctx.strokeStyle = 'rgba(148, 163, 184, 0.2)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(50, 540);
  ctx.lineTo(canvas.width - 50, 540);
  ctx.stroke();

  ctx.fillStyle = '#94a3b8';
  ctx.font = '16px "JetBrains Mono", monospace';
  ctx.fillText(`KARTU IDENTITAS RESMI SEKOLAH · ID: #${student.id.toUpperCase()}`, 50, 580);

  ctx.fillStyle = '#10b981';
  ctx.font = 'bold 16px "JetBrains Mono", monospace';
  ctx.fillText('STATUS: TERVERIFIKASI GURU', 700, 580);

  return canvas.toDataURL('image/png');
}

/**
 * Generates a high-resolution PNG image of the back side of the ID Card
 */
export async function generateBackCardImage(
  student: Student,
  instructorName: string = 'Dwi Ambal Aziz, S.Kom',
  instructorRole: string = 'Pembina Lab & IT Club'
): Promise<string> {
  const canvas = document.createElement('canvas');
  canvas.width = 1012;
  canvas.height = 638;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  // Background
  const bgGrad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  bgGrad.addColorStop(0, '#0a0f1d');
  bgGrad.addColorStop(1, '#080c16');
  ctx.fillStyle = bgGrad;
  ctx.roundRect(0, 0, canvas.width, canvas.height, 28);
  ctx.fill();

  ctx.lineWidth = 4;
  ctx.strokeStyle = '#06b6d4';
  ctx.stroke();

  // Header
  ctx.fillStyle = '#22d3ee';
  ctx.font = 'bold 24px "Plus Jakarta Sans", sans-serif';
  ctx.fillText('TATA TERTIB PENGGUNAAN LABORATORIUM KOMPUTER', 60, 70);

  // Rules list
  ctx.fillStyle = '#cbd5e1';
  ctx.font = '18px "Plus Jakarta Sans", sans-serif';
  const rules = [
    '1. Wajib melakukan presensi mandiri (Tap RFID / Scan QR Code) sebelum masuk lab.',
    '2. Dilarang membawa makanan, minuman, dan merubah jalur kabel perkabelan PC.',
    '3. Menggunakan perangkat komputer hanya untuk keperluan praktikum & riset IT Club.',
    '4. Menjaga kebersihan meja, merapikan keyboard, mouse, serta kursi sebelum keluar.',
    '5. Setiap pelanggaran tata tertib akan dikenakan sanksi penonaktifan kartu akses.',
  ];

  rules.forEach((rule, idx) => {
    ctx.fillText(rule, 60, 125 + idx * 42);
  });

  // Simulated Barcode
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.roundRect(60, 360, 892, 100, 8);
  ctx.fill();

  ctx.fillStyle = '#000000';
  let barX = 100;
  for (let i = 0; i < 75; i++) {
    const width = (i * 7) % 5 === 0 ? 5 : (i * 3) % 4 === 0 ? 3 : 2;
    ctx.fillRect(barX, 375, width, 55);
    barX += width + 5;
  }

  ctx.save();
  ctx.fillStyle = '#000000';
  ctx.textAlign = 'center';
  ctx.font = 'bold 18px "JetBrains Mono", monospace';
  ctx.fillText(`*${student.nisn}*`, canvas.width / 2, 450);
  ctx.restore();

  // Signatures
  ctx.fillStyle = '#94a3b8';
  ctx.font = '16px "Plus Jakarta Sans", sans-serif';
  ctx.fillText('Laboratorium Komputer Sekolah', 60, 520);
  ctx.fillText('Terdaftar Sistem Resmi 2026', 60, 545);

  const pembinaName = (instructorName && instructorName.trim()) 
    ? instructorName.trim() 
    : 'Dwi Ambal Aziz, S.Kom';
  const pembinaRole = (instructorRole && instructorRole.trim())
    ? instructorRole.trim()
    : 'Pembina Lab & IT Club';

  ctx.save();
  ctx.textAlign = 'right';
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 20px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(pembinaName, 952, 550);

  ctx.fillStyle = '#94a3b8';
  ctx.font = '16px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(pembinaRole, 952, 580);
  ctx.restore();

  return canvas.toDataURL('image/png');
}
