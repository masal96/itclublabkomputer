export type DivisionType = 'C# .NET' | 'Scratch/Pictoblox' | 'Desain Grafis' | 'Robotika & IoT' | 'Python Programming';

export interface Student {
  id: string;
  nisn: string;
  name: string;
  class: string;
  division: DivisionType;
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

export interface AttendanceRecord {
  id: string;
  timestamp: string; // ISO string
  studentId: string;
  studentName: string;
  class: string;
  nisn: string;
  division: DivisionType | string;
  method: 'RFID' | 'QR Code' | 'Manual';
  status: 'Hadir' | 'Terlambat' | 'Izin';
  tapType?: 'Masuk' | 'Pulang';
  sessionTitle: string;
  notes?: string;
  parentPhone?: string;
  waSent?: boolean;
  isPembina?: boolean;
}

export type DayOfWeek = 'Senin' | 'Selasa' | 'Rabu' | 'Kamis' | 'Jumat' | 'Sabtu';

export interface ScheduleItem {
  id: string;
  day: DayOfWeek;
  startTime: string;
  endTime: string;
  title: string;
  category: 'Kelas Reguler' | 'IT Club' | 'Praktikum' | 'Maintenance' | 'Workshop';
  instructor: string;
  room: 'Lab Komputer' ;
  capacity: number;
  description: string;
}

export interface PortfolioItem {
  id: string;
  title: string;
  category: 'C# Desktop' | 'Scratch/Pictoblox Game' | 'UI/UX Design' | 'Robotika & IoT' | 'Web Apps';
  description: string;
  studentAuthors: string[];
  gradeClass: string;
  imageUrl: string;
  demoUrl?: string;
  githubUrl?: string;
  featured: boolean;
  date: string;
  techTags: string[];
}

export interface LearningModule {
  id: string;
  title: string;
  track: DivisionType;
  level: 'Dasar' | 'Menengah' | 'Lanjutan';
  duration: string;
  lessons: number;
  description: string;
  syllabus: string[];
  starterCode?: string;
  starterLanguage?: string;
  pdfUrl?: string;
  videoUrl?: string;
  updatedAt?: string;
}

export interface TaskSubmission {
  id: string;
  moduleId: string;
  moduleTitle: string;
  studentName: string;
  nisn: string;
  studentClass: string;
  division: DivisionType;
  projectUrl: string;
  notes?: string;
  status: 'Menunggu' | 'Dinilai' | 'Perlu Revisi';
  feedback?: string;
  score?: number;
  submittedAt: string;
}

export interface ActivityEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  description: string;
  speaker: string;
  category: string;
  status: 'Mendatang' | 'Sedang Berlangsung' | 'Selesai';
  registeredCount: number;
  maxParticipants: number;
}

export type AdminRole = 'guru_admin' | 'pengurus';

export interface AdminUser {
  isAuthenticated: boolean;
  name: string;
  nip: string;
  role: AdminRole;
  email: string;
  avatar: string;
  authProvider?: 'google' | 'server_passcode';
  sessionToken?: string;
}

export interface StaffRoleEntry {
  email: string;
  name: string;
  role: AdminRole;
  addedBy: string;
  createdAt: string;
}

export interface StudentAssessment {
  id: string;
  studentId: string;
  studentName: string;
  nisn: string;
  class: string;
  division: DivisionType;
  period: string;
  assessmentDate: string;
  attendanceScore: number; // Bobot 20%
  materialScore: number;   // Bobot 25%
  practiceScore: number;   // Bobot 35%
  creativityScore: number; // Bobot 20%
  finalScore: number;
  grade: 'A' | 'B' | 'C' | 'D';
  predicate: string;
  projectTitle: string;
  coachNotes: string;
  recommendation: string;
  instructorName: string;
  published: boolean;
  waSent?: boolean;
  waSentAt?: string;
  updatedAt: string;
}

export interface PembinaCardProfile {
  id: string;
  name: string;
  nip: string;
  roleTitle: string;
  unit: string;
  rfidUid: string;
  qrCodeData: string;
  avatarUrl: string;
  email: string;
  phone: string;
  updatedAt?: string;
}

export interface ActivityRegistration {
  id: string;
  activityId: string;
  activityTitle: string;
  participantName: string;
  participantClass: string;
  participantWhatsapp: string;
  reason: string;
  preferredChannel: 'whatsapp' | 'email';
  createdAt: string;
}

export interface LabAnnouncement {
  id: string;
  title: string;
  content: string;
  priority: 'Info' | 'Penting' | 'Lomba' | 'Libur';
  active: boolean;
  authorName: string;
  createdAt: string;
}
