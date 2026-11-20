import QRCode from 'qrcode';
import { Student, PembinaCardProfile } from '../types';

/**
 * Helper to draw a rounded rectangle path with custom radii
 */
function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  radius: number
) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, radius);
}

/**
 * Generates a high-resolution PNG image of the front side of the ID Card
 * exactly matching the live preview in Card Studio & Print Preview.
 */
export async function generateFrontCardImage(student: Student): Promise<string> {
  const canvas = document.createElement('canvas');
  // High DPI: CR80 standard ratio 85.6mm x 53.98mm (1012px x 638px at 300 DPI)
  canvas.width = 1012;
  canvas.height = 638;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  // 1. Base Card Outline & Clip
  roundRect(ctx, 0, 0, canvas.width, canvas.height, 28);
  ctx.save();
  ctx.clip();

  // 2. Background: Deep dark midnight blue
  ctx.fillStyle = '#030712';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // 3. Cyber Grid overlay (subtle cyan square grid)
  ctx.strokeStyle = 'rgba(6, 182, 212, 0.08)';
  ctx.lineWidth = 1;
  const gridSize = 28;
  for (let x = 0; x <= canvas.width; x += gridSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
  }
  for (let y = 0; y <= canvas.height; y += gridSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }

  // Restore clip for outer border
  ctx.restore();
  ctx.save();
  roundRect(ctx, 2.5, 2.5, canvas.width - 5, canvas.height - 5, 27);
  ctx.lineWidth = 3.5;
  ctx.strokeStyle = '#00c8e0';
  ctx.stroke();
  ctx.restore();

  // ==========================================
  // 4. HEADER BAR
  // ==========================================
  // Solid cyan badge with </>
  const badgeX = 36;
  const badgeY = 24;
  const badgeSize = 52;
  const badgeR = 12;

  ctx.fillStyle = '#00bcd4';
  roundRect(ctx, badgeX, badgeY, badgeSize, badgeSize, badgeR);
  ctx.fill();

  ctx.fillStyle = '#02121e';
  ctx.font = 'bold 24px "JetBrains Mono", monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('</>', badgeX + badgeSize / 2, badgeY + badgeSize / 2);

  // Title & Subtitle text
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = '#ffffff';
  ctx.font = '800 23px "Plus Jakarta Sans", system-ui, -apple-system, sans-serif';
  ctx.fillText('KARTU ANGGOTA IT CLUB & LAB KOMPUTER', badgeX + badgeSize + 16, badgeY + 23);

  ctx.fillStyle = '#00e5ff';
  ctx.font = 'bold 16px "JetBrains Mono", monospace';
  ctx.fillText('<LabKomputer/> · TA 2026/2027', badgeX + badgeSize + 16, badgeY + 47);

  // Header bottom divider line across card
  ctx.strokeStyle = 'rgba(6, 182, 212, 0.35)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(36, 100);
  ctx.lineTo(canvas.width - 36, 100);
  ctx.stroke();

  // ==========================================
  // 5. MIDDLE CONTENT: PHOTO + DETAILS + QR
  // ==========================================
  
  // Student Photo (CR80 standard aspect ratio ~4:5)
  const photoX = 48;
  const photoY = 148;
  const photoW = 200;
  const photoH = 252;
  const photoRadius = 18;

  // Dark background inside photo container
  ctx.fillStyle = '#030814';
  roundRect(ctx, photoX, photoY, photoW, photoH, photoRadius);
  ctx.fill();

  try {
    const photo = new Image();
    photo.crossOrigin = 'anonymous';
    photo.src = student.avatarUrl;
    await new Promise((resolve) => {
      photo.onload = resolve;
      photo.onerror = resolve;
    });

    ctx.save();
    roundRect(ctx, photoX + 2, photoY + 2, photoW - 4, photoH - 4, photoRadius - 2);
    ctx.clip();

    if (photo.complete && photo.naturalWidth > 0) {
      // Cover fit calculation
      const imgRatio = photo.naturalWidth / photo.naturalHeight;
      const targetRatio = (photoW - 4) / (photoH - 4);
      let sWidth = photo.naturalWidth;
      let sHeight = photo.naturalHeight;
      let sx = 0;
      let sy = 0;

      if (imgRatio > targetRatio) {
        sWidth = photo.naturalHeight * targetRatio;
        sx = (photo.naturalWidth - sWidth) / 2;
      } else {
        sHeight = photo.naturalWidth / targetRatio;
        sy = (photo.naturalHeight - sHeight) / 2;
      }
      ctx.drawImage(photo, sx, sy, sWidth, sHeight, photoX + 2, photoY + 2, photoW - 4, photoH - 4);
    } else {
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(photoX, photoY, photoW, photoH);
      ctx.fillStyle = '#64748b';
      ctx.font = 'bold 52px "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(student.name.charAt(0).toUpperCase(), photoX + photoW / 2, photoY + photoH / 2);
    }
    ctx.restore();
  } catch {
    ctx.fillStyle = '#0f172a';
    roundRect(ctx, photoX, photoY, photoW, photoH, photoRadius);
    ctx.fill();
  }

  // Cyan border around photo container
  ctx.strokeStyle = '#00c8e0';
  ctx.lineWidth = 3;
  roundRect(ctx, photoX, photoY, photoW, photoH, photoRadius);
  ctx.stroke();

  // Student Details (Center Column)
  const detailX = 278;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';

  // 1. Name: Bold White
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 32px "Plus Jakarta Sans", system-ui, -apple-system, sans-serif';
  let displayName = student.name;
  if (ctx.measureText(displayName).width > 440) {
    while (ctx.measureText(displayName + '...').width > 440 && displayName.length > 0) {
      displayName = displayName.slice(0, -1);
    }
    displayName += '...';
  }
  ctx.fillText(displayName, detailX, 195);

  // 2. NIS row: NIS     : [nisn]
  ctx.fillStyle = '#94a3b8';
  ctx.font = '19px "JetBrains Mono", monospace';
  ctx.fillText('NIS     : ', detailX, 244);
  const nisLabelW = ctx.measureText('NIS     : ').width;
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 20px "JetBrains Mono", monospace';
  ctx.fillText(student.nisn, detailX + nisLabelW, 244);

  // 3. Kelas row: Kelas : [class]
  ctx.fillStyle = '#94a3b8';
  ctx.font = '19px "Plus Jakarta Sans", system-ui, sans-serif';
  ctx.fillText('Kelas : ', detailX, 286);
  const classLabelW = ctx.measureText('Kelas : ').width;
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 20px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(student.class, detailX + classLabelW, 286);

  // 4. Divisi row: Divisi : [division] (Vibrant Neon Cyan)
  ctx.fillStyle = '#00e5ff';
  ctx.font = 'bold 20px "Plus Jakarta Sans", system-ui, sans-serif';
  ctx.fillText(`Divisi : ${student.division}`, detailX, 328);

  // 5. Jabatan row: Jabatan : [position] (Light Purple / Violet)
  const positionText = student.position || (student.status === 'Pengurus' ? 'Pengurus IT Club' : 'Anggota Aktif');
  ctx.fillStyle = '#c084fc';
  ctx.font = 'bold 18px "JetBrains Mono", monospace';
  ctx.fillText(`Jabatan : ${positionText}`, detailX, 368);

  // Embedded QR Code (Right Side)
  const qrBoxW = 216;
  const qrBoxH = 216;
  const qrBoxX = canvas.width - 44 - qrBoxW;
  const qrBoxY = 148;
  const qrBoxR = 18;

  // White Card for QR Code
  ctx.fillStyle = '#ffffff';
  roundRect(ctx, qrBoxX, qrBoxY, qrBoxW, qrBoxH, qrBoxR);
  ctx.fill();

  try {
    const qrDataUrl = await QRCode.toDataURL(student.qrCodeData, {
      width: 188,
      margin: 0,
      color: { dark: '#000000', light: '#ffffff' },
    });
    const qrImg = new Image();
    qrImg.src = qrDataUrl;
    await new Promise((resolve) => {
      qrImg.onload = resolve;
    });
    ctx.drawImage(qrImg, qrBoxX + 14, qrBoxY + 14, 188, 188);

    // Label below QR: SCAN PRESENSI
    ctx.fillStyle = '#00e5ff';
    ctx.font = 'bold 14px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';
    ctx.fillText('SCAN PRESENSI', qrBoxX + qrBoxW / 2, qrBoxY + qrBoxH + 32);
  } catch (e) {
    console.error('Failed to draw QR in canvas', e);
  }

  // ==========================================
  // 6. SMART CARD CHIP ROW
  // ==========================================
  const chipX = 48;
  const chipY = 440;
  const chipW = 78;
  const chipH = 56;
  const chipR = 8;

  // Outer golden amber box
  ctx.fillStyle = '#f59e0b';
  roundRect(ctx, chipX, chipY, chipW, chipH, chipR);
  ctx.fill();
  ctx.strokeStyle = '#d97706';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Inner bright yellow box
  ctx.fillStyle = '#fde047';
  roundRect(ctx, chipX + 9, chipY + 8, chipW - 18, chipH - 16, 4);
  ctx.fill();

  // Chip contact line
  ctx.strokeStyle = '#b45309';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(chipX + chipW / 2, chipY + 8);
  ctx.lineTo(chipX + chipW / 2, chipY + chipH - 8);
  ctx.stroke();

  // Text next to chip: SMART CARD LAB ACCESS
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#00e5ff';
  ctx.font = 'bold 16px "JetBrains Mono", monospace';
  ctx.fillText('SMART CARD LAB ACCESS', chipX + chipW + 16, chipY + chipH / 2);

  // ==========================================
  // 7. FOOTER BAR
  // ==========================================
  // Divider Line
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(44, 540);
  ctx.lineTo(canvas.width - 44, 540);
  ctx.stroke();

  // Left text: KARTU IDENTITAS RESMI SEKOLAH · ID: #...
  const rawId = student.id.toUpperCase();
  const formattedId = rawId.startsWith('STD-') ? '#' + rawId : (rawId.startsWith('#STD-') ? rawId : '#STD-' + rawId.replace(/^STD-/, ''));
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = '#94a3b8';
  ctx.font = '14px "JetBrains Mono", monospace';
  ctx.fillText(`KARTU IDENTITAS RESMI SEKOLAH · ID: ${formattedId}`, 44, 580);

  // Right text: STATUS: TERVERIFIKASI GURU (Emerald green bold)
  ctx.textAlign = 'right';
  ctx.fillStyle = '#10b981';
  ctx.font = 'bold 14px "JetBrains Mono", monospace';
  ctx.fillText('STATUS: TERVERIFIKASI GURU', canvas.width - 44, 580);

  return canvas.toDataURL('image/png');
}

/**
 * Generates a high-resolution PNG image of the back side of the ID Card
 * exactly matching the live preview in Card Studio & Print Preview.
 */
export async function generateBackCardImage(
  student: Student,
  instructorName: string = 'Dwi Ambal Aziz, S.Kom',
  instructorRole: string = 'Pembina Lab & IT Club'
): Promise<string> {
  const canvas = document.createElement('canvas');
  // High DPI: CR80 standard ratio 85.6mm x 53.98mm (1012px x 638px at 300 DPI)
  canvas.width = 1012;
  canvas.height = 638;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  // 1. Base Card Outline & Clip
  roundRect(ctx, 0, 0, canvas.width, canvas.height, 32);
  ctx.save();
  ctx.clip();

  // 2. Background Gradient (identical to preview: #0c1322 via #080d19 to #120e24)
  const bgGrad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  bgGrad.addColorStop(0, '#0c1322');
  bgGrad.addColorStop(0.5, '#080d19');
  bgGrad.addColorStop(1, '#120e24');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // 3. Ambient Highlights
  const glowCyan = ctx.createRadialGradient(850, 80, 20, 850, 80, 260);
  glowCyan.addColorStop(0, 'rgba(6, 182, 212, 0.12)');
  glowCyan.addColorStop(1, 'rgba(6, 182, 212, 0)');
  ctx.fillStyle = glowCyan;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.restore(); // restore clip
  ctx.save();
  roundRect(ctx, 1.5, 1.5, canvas.width - 3, canvas.height - 3, 31);
  ctx.lineWidth = 3;
  ctx.strokeStyle = 'rgba(6, 182, 212, 0.45)';
  ctx.stroke();
  ctx.restore();

  // ==========================================
  // 4. HEADER: TATA TERTIB LAB
  // ==========================================
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = '#67e8f9';
  ctx.font = 'bold 20px "Plus Jakarta Sans", system-ui, -apple-system, sans-serif';
  ctx.fillText('TATA TERTIB PENGGUNAAN LABORATORIUM KOMPUTER', 48, 56);

  // Radio Waves Symbol (Right)
  const radioX = canvas.width - 64;
  const radioY = 50;
  ctx.strokeStyle = '#22d3ee';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(radioX, radioY, 4, 0, Math.PI * 2);
  ctx.fillStyle = '#22d3ee';
  ctx.fill();
  ctx.beginPath();
  ctx.arc(radioX, radioY, 9, -Math.PI / 3, Math.PI / 3);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(radioX, radioY, 15, -Math.PI / 3, Math.PI / 3);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(radioX, radioY, 9, Math.PI * 2 / 3, Math.PI * 4 / 3);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(radioX, radioY, 15, Math.PI * 2 / 3, Math.PI * 4 / 3);
  ctx.stroke();

  // Header Divider Line
  ctx.strokeStyle = 'rgba(6, 182, 212, 0.3)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(48, 76);
  ctx.lineTo(canvas.width - 48, 76);
  ctx.stroke();

  // ==========================================
  // 5. RULES LIST (5 POINTS FROM PREVIEW)
  // ==========================================
  const rules = [
    'Wajib melakukan tap kartu RFID / scan QR Code saat masuk dan keluar lab.',
    'Dilarang keras membawa makanan, minuman, dan merubah kabel instalasi.',
    'Gunakan workstation PC sesuai dengan penugasan instruktur guru.',
    'Simpan file proyek di cloud/GitHub IT Club.',
    'Menjaga kebersihan meja, merapikan keyboard, mouse serta kursi sebelum keluar.',
  ];

  ctx.font = '16.5px "Plus Jakarta Sans", system-ui, -apple-system, sans-serif';
  const startRuleY = 114;
  const lineSpacing = 36;

  rules.forEach((rule, idx) => {
    const currentY = startRuleY + idx * lineSpacing;

    // Number bullet
    ctx.textAlign = 'left';
    ctx.fillStyle = '#22d3ee';
    ctx.font = 'bold 16.5px "JetBrains Mono", monospace';
    ctx.fillText(`${idx + 1}.`, 48, currentY);

    // Rule Text
    ctx.fillStyle = '#cbd5e1';
    ctx.font = '16.5px "Plus Jakarta Sans", system-ui, -apple-system, sans-serif';
    ctx.fillText(rule, 78, currentY);
  });

  // ==========================================
  // 6. SIMULATED BARCODE (EXACT MATCH TO PREVIEW)
  // ==========================================
  const barBoxW = canvas.width - 96;
  const barBoxH = 108;
  const barBoxX = 48;
  const barBoxY = 328;

  // White Card
  ctx.fillStyle = '#ffffff';
  roundRect(ctx, barBoxX, barBoxY, barBoxW, barBoxH, 14);
  ctx.fill();

  // Barcode Stripes
  ctx.fillStyle = '#000000';
  const barH = 50;
  const barStartY = barBoxY + 14;
  let currentBarX = barBoxX + 42;
  const endBarX = barBoxX + barBoxW - 42;

  let patternIndex = 0;
  const widths = [3, 1, 4, 2, 1, 3, 2, 5, 1, 2, 4, 1, 3, 2, 1, 4];

  while (currentBarX < endBarX) {
    const w = widths[patternIndex % widths.length];
    ctx.fillRect(currentBarX, barStartY, w, barH);
    currentBarX += w + ((patternIndex % 3 === 0) ? 6 : 4);
    patternIndex++;
  }

  // Text below barcode: *NIS*
  ctx.fillStyle = '#000000';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  ctx.font = 'bold 18px "JetBrains Mono", monospace';
  ctx.fillText(`*${student.nisn}*`, canvas.width / 2, barBoxY + barBoxH - 12);

  // ==========================================
  // 7. FOOTER / SIGNATURE SECTION
  // ==========================================
  // Top border line
  ctx.strokeStyle = 'rgba(51, 65, 85, 0.8)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(48, 524);
  ctx.lineTo(canvas.width - 48, 524);
  ctx.stroke();

  // Left side signature details
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = '#94a3b8';
  ctx.font = '17px "Plus Jakarta Sans", system-ui, -apple-system, sans-serif';
  ctx.fillText('Laboratorium Komputer Sekolah', 48, 558);

  ctx.fillStyle = '#2dd4bf';
  ctx.font = 'bold 15px "JetBrains Mono", monospace';
  ctx.fillText('Terdaftar Sistem Resmi 2026', 48, 588);

  // Right side signature details
  const pembinaName = (instructorName && instructorName.trim())
    ? instructorName.trim()
    : 'Dwi Ambal Aziz, S.Kom';
  const pembinaRole = (instructorRole && instructorRole.trim())
    ? instructorRole.trim()
    : 'Pembina Lab & IT Club';

  ctx.textAlign = 'right';
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 22px "Plus Jakarta Sans", system-ui, -apple-system, sans-serif';
  ctx.fillText(pembinaName, canvas.width - 48, 558);

  ctx.fillStyle = '#94a3b8';
  ctx.font = '16px "Plus Jakarta Sans", system-ui, -apple-system, sans-serif';
  ctx.fillText(pembinaRole, canvas.width - 48, 588);

  return canvas.toDataURL('image/png');
}

/**
 * Generates high-resolution PNG of the dedicated Pembina (Instructor) front ID card.
 * Styled with gold/amber & obsidian executive accents to distinguish from student member cards.
 */
export async function generatePembinaFrontCardImage(pembina: PembinaCardProfile): Promise<string> {
  const canvas = document.createElement('canvas');
  canvas.width = 1012;
  canvas.height = 638;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  // Base outline & clip
  roundRect(ctx, 0, 0, canvas.width, canvas.height, 28);
  ctx.save();
  ctx.clip();

  // Deep obsidian + subtle royal indigo gradient
  const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  grad.addColorStop(0, '#090714');
  grad.addColorStop(0.55, '#070b18');
  grad.addColorStop(1, '#161108');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Subtle gold cyber grid
  ctx.strokeStyle = 'rgba(245, 158, 11, 0.08)';
  ctx.lineWidth = 1;
  for (let x = 0; x <= canvas.width; x += 28) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
  }
  for (let y = 0; y <= canvas.height; y += 28) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }

  ctx.restore();
  ctx.save();
  roundRect(ctx, 2.5, 2.5, canvas.width - 5, canvas.height - 5, 27);
  ctx.lineWidth = 3.5;
  ctx.strokeStyle = '#f59e0b';
  ctx.stroke();
  ctx.restore();

  // Header Badge
  const badgeX = 36;
  const badgeY = 24;
  const badgeSize = 52;
  ctx.fillStyle = '#f59e0b';
  roundRect(ctx, badgeX, badgeY, badgeSize, badgeSize, 12);
  ctx.fill();

  ctx.fillStyle = '#1c1203';
  ctx.font = 'bold 22px "JetBrains Mono", monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('★', badgeX + badgeSize / 2, badgeY + badgeSize / 2);

  // Header Title
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = '#ffffff';
  ctx.font = '800 23px "Plus Jakarta Sans", system-ui, -apple-system, sans-serif';
  ctx.fillText('KARTU KHUSUS PEMBINA IT CLUB & LAB', badgeX + badgeSize + 16, badgeY + 23);

  ctx.fillStyle = '#fcd34d';
  ctx.font = 'bold 16px "JetBrains Mono", monospace';
  ctx.fillText('<AdministratorLab/> · OTORITAS RESMI · TA 2026/2027', badgeX + badgeSize + 16, badgeY + 47);

  ctx.strokeStyle = 'rgba(245, 158, 11, 0.4)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(36, 100);
  ctx.lineTo(canvas.width - 36, 100);
  ctx.stroke();

  // Photo container
  const photoX = 48;
  const photoY = 148;
  const photoW = 200;
  const photoH = 252;
  const photoRadius = 18;

  ctx.fillStyle = '#0b0f1c';
  roundRect(ctx, photoX, photoY, photoW, photoH, photoRadius);
  ctx.fill();

  try {
    const photo = new Image();
    photo.crossOrigin = 'anonymous';
    photo.src = pembina.avatarUrl;
    await new Promise((resolve) => {
      photo.onload = resolve;
      photo.onerror = resolve;
    });

    ctx.save();
    roundRect(ctx, photoX + 2, photoY + 2, photoW - 4, photoH - 4, photoRadius - 2);
    ctx.clip();

    if (photo.complete && photo.naturalWidth > 0) {
      const imgRatio = photo.naturalWidth / photo.naturalHeight;
      const targetRatio = (photoW - 4) / (photoH - 4);
      let sWidth = photo.naturalWidth;
      let sHeight = photo.naturalHeight;
      let sx = 0;
      let sy = 0;
      if (imgRatio > targetRatio) {
        sWidth = photo.naturalHeight * targetRatio;
        sx = (photo.naturalWidth - sWidth) / 2;
      } else {
        sHeight = photo.naturalWidth / targetRatio;
        sy = (photo.naturalHeight - sHeight) / 2;
      }
      ctx.drawImage(photo, sx, sy, sWidth, sHeight, photoX + 2, photoY + 2, photoW - 4, photoH - 4);
    } else {
      ctx.fillStyle = '#1e1b2e';
      ctx.fillRect(photoX, photoY, photoW, photoH);
      ctx.fillStyle = '#fcd34d';
      ctx.font = 'bold 56px "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(pembina.name.charAt(0).toUpperCase(), photoX + photoW / 2, photoY + photoH / 2);
    }
    ctx.restore();
  } catch {
    ctx.fillStyle = '#1e1b2e';
    roundRect(ctx, photoX, photoY, photoW, photoH, photoRadius);
    ctx.fill();
  }

  ctx.strokeStyle = '#f59e0b';
  ctx.lineWidth = 3;
  roundRect(ctx, photoX, photoY, photoW, photoH, photoRadius);
  ctx.stroke();

  // Pembina Details
  const detailX = 278;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 29px "Plus Jakarta Sans", system-ui, -apple-system, sans-serif';
  let displayName = pembina.name;
  if (ctx.measureText(displayName).width > 445) {
    while (ctx.measureText(displayName + '...').width > 445 && displayName.length > 0) {
      displayName = displayName.slice(0, -1);
    }
    displayName += '...';
  }
  ctx.fillText(displayName, detailX, 195);

  ctx.fillStyle = '#94a3b8';
  ctx.font = '18px "JetBrains Mono", monospace';
  ctx.fillText('NIP     : ', detailX, 244);
  const nipLabelW = ctx.measureText('NIP     : ').width;
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 19px "JetBrains Mono", monospace';
  ctx.fillText(pembina.nip, detailX + nipLabelW, 244);

  ctx.fillStyle = '#94a3b8';
  ctx.font = '18px "Plus Jakarta Sans", system-ui, sans-serif';
  ctx.fillText('Unit    : ', detailX, 286);
  const unitLabelW = ctx.measureText('Unit    : ').width;
  ctx.fillStyle = '#e2e8f0';
  ctx.font = 'bold 19px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(pembina.unit, detailX + unitLabelW, 286, 360);

  ctx.fillStyle = '#fcd34d';
  ctx.font = 'bold 19px "Plus Jakarta Sans", system-ui, sans-serif';
  ctx.fillText(`Jabatan : ${pembina.roleTitle}`, detailX, 328, 445);

  // Embedded QR Code
  const qrBoxW = 216;
  const qrBoxH = 216;
  const qrBoxX = canvas.width - 44 - qrBoxW;
  const qrBoxY = 148;

  ctx.fillStyle = '#ffffff';
  roundRect(ctx, qrBoxX, qrBoxY, qrBoxW, qrBoxH, 18);
  ctx.fill();

  try {
    const qrDataUrl = await QRCode.toDataURL(
      pembina.qrCodeData || `ITCLUB:PEMBINA:${pembina.nip}:${pembina.name}`,
      {
        width: 188,
        margin: 0,
        color: { dark: '#000000', light: '#ffffff' },
      }
    );
    const qrImg = new Image();
    qrImg.src = qrDataUrl;
    await new Promise((resolve) => {
      qrImg.onload = resolve;
    });
    ctx.drawImage(qrImg, qrBoxX + 14, qrBoxY + 14, 188, 188);

    ctx.fillStyle = '#fcd34d';
    ctx.font = 'bold 14px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('OTORITAS PEMBINA', qrBoxX + qrBoxW / 2, qrBoxY + qrBoxH + 32);
  } catch (e) {
    console.error('Failed to draw Pembina QR in canvas', e);
  }

  // Chip row
  const chipX = 48;
  const chipY = 440;
  const chipW = 78;
  const chipH = 56;
  ctx.fillStyle = '#f59e0b';
  roundRect(ctx, chipX, chipY, chipW, chipH, 8);
  ctx.fill();
  ctx.strokeStyle = '#fbbf24';
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.fillStyle = '#fef08a';
  roundRect(ctx, chipX + 9, chipY + 8, chipW - 18, chipH - 16, 4);
  ctx.fill();

  ctx.strokeStyle = '#b45309';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(chipX + chipW / 2, chipY + 8);
  ctx.lineTo(chipX + chipW / 2, chipY + chipH - 8);
  ctx.stroke();

  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#fcd34d';
  ctx.font = 'bold 16px "JetBrains Mono", monospace';
  ctx.fillText('MASTER ACCESS · PEMBINA LAB', chipX + chipW + 16, chipY + chipH / 2);

  // Footer
  ctx.strokeStyle = 'rgba(245, 158, 11, 0.25)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(44, 540);
  ctx.lineTo(canvas.width - 44, 540);
  ctx.stroke();

  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = '#94a3b8';
  ctx.font = '14px "JetBrains Mono", monospace';
  ctx.fillText('KARTU IDENTITAS KHUSUS PEMBINA LAB · ID: #PEMBINA-01', 44, 580);

  ctx.textAlign = 'right';
  ctx.fillStyle = '#f59e0b';
  ctx.font = 'bold 14px "JetBrains Mono", monospace';
  ctx.fillText('HAK AKSES: ADMINISTRATOR PENUH', canvas.width - 44, 580);

  return canvas.toDataURL('image/png');
}

/**
 * Generates high-resolution PNG of the dedicated Pembina back ID card.
 */
export async function generatePembinaBackCardImage(pembina: PembinaCardProfile): Promise<string> {
  const canvas = document.createElement('canvas');
  canvas.width = 1012;
  canvas.height = 638;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  roundRect(ctx, 0, 0, canvas.width, canvas.height, 32);
  ctx.save();
  ctx.clip();

  const bgGrad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  bgGrad.addColorStop(0, '#120d1e');
  bgGrad.addColorStop(0.5, '#090d1a');
  bgGrad.addColorStop(1, '#191206');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.restore();
  ctx.save();
  roundRect(ctx, 1.5, 1.5, canvas.width - 3, canvas.height - 3, 31);
  ctx.lineWidth = 3;
  ctx.strokeStyle = 'rgba(245, 158, 11, 0.5)';
  ctx.stroke();
  ctx.restore();

  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = '#fcd34d';
  ctx.font = 'bold 20px "Plus Jakarta Sans", system-ui, -apple-system, sans-serif';
  ctx.fillText('OTORITAS & TUGAS PEMBINA LABORATORIUM KOMPUTER', 48, 56);

  ctx.strokeStyle = 'rgba(245, 158, 11, 0.3)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(48, 76);
  ctx.lineTo(canvas.width - 48, 76);
  ctx.stroke();

  const authorities = [
    'Pemegang otoritas akses penuh ruang Laboratorium Komputer & server lokal.',
    'Berwenang memvalidasi pendaftaran anggota, kartu RFID, dan data penilaian siswa.',
    'Mengelola jadwal praktikum, workshop, serta publikasi portofolio karya siswa.',
    'Melakukan audit berkala perangkat keras, jaringan, dan keamanan workstation.',
    'Kontak darurat & penanggung jawab utama operasional kegiatan IT Club sekolah.',
  ];

  const startRuleY = 114;
  const lineSpacing = 36;
  authorities.forEach((item, idx) => {
    const currentY = startRuleY + idx * lineSpacing;
    ctx.textAlign = 'left';
    ctx.fillStyle = '#f59e0b';
    ctx.font = 'bold 16.5px "JetBrains Mono", monospace';
    ctx.fillText(`${idx + 1}.`, 48, currentY);

    ctx.fillStyle = '#e2e8f0';
    ctx.font = '16.5px "Plus Jakarta Sans", system-ui, -apple-system, sans-serif';
    ctx.fillText(item, 78, currentY);
  });

  // Barcode box
  const barBoxW = canvas.width - 96;
  const barBoxH = 108;
  const barBoxX = 48;
  const barBoxY = 328;

  ctx.fillStyle = '#ffffff';
  roundRect(ctx, barBoxX, barBoxY, barBoxW, barBoxH, 14);
  ctx.fill();

  ctx.fillStyle = '#000000';
  const barH = 50;
  const barStartY = barBoxY + 14;
  let currentBarX = barBoxX + 42;
  const endBarX = barBoxX + barBoxW - 42;
  let patternIndex = 0;
  const widths = [3, 1, 4, 2, 1, 3, 2, 5, 1, 2, 4, 1, 3, 2, 1, 4];

  while (currentBarX < endBarX) {
    const w = widths[patternIndex % widths.length];
    ctx.fillRect(currentBarX, barStartY, w, barH);
    currentBarX += w + ((patternIndex % 3 === 0) ? 6 : 4);
    patternIndex++;
  }

  ctx.fillStyle = '#000000';
  ctx.textAlign = 'center';
  ctx.font = 'bold 18px "JetBrains Mono", monospace';
  ctx.fillText(`*${pembina.nip}*`, canvas.width / 2, barBoxY + barBoxH - 12);

  // Footer
  ctx.strokeStyle = 'rgba(245, 158, 11, 0.25)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(48, 524);
  ctx.lineTo(canvas.width - 48, 524);
  ctx.stroke();

  ctx.textAlign = 'left';
  ctx.fillStyle = '#94a3b8';
  ctx.font = '17px "Plus Jakarta Sans", system-ui, -apple-system, sans-serif';
  ctx.fillText(pembina.unit || 'Laboratorium Komputer Sekolah', 48, 558);

  ctx.fillStyle = '#fcd34d';
  ctx.font = 'bold 15px "JetBrains Mono", monospace';
  ctx.fillText(`Email: ${pembina.email}`, 48, 588);

  ctx.textAlign = 'right';
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 21px "Plus Jakarta Sans", system-ui, -apple-system, sans-serif';
  ctx.fillText(pembina.name, canvas.width - 48, 558);

  ctx.fillStyle = '#fcd34d';
  ctx.font = '16px "Plus Jakarta Sans", system-ui, -apple-system, sans-serif';
  ctx.fillText(pembina.roleTitle, canvas.width - 48, 588);

  return canvas.toDataURL('image/png');
}

