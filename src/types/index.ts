export type DivisionType = 'C# .NET' | 'Scratch' | 'Desain Grafis' | 'Jaringan Komputer' | 'Python Programming';

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
  division: DivisionType;
  method: 'RFID' | 'QR Code' | 'Manual';
  status: 'Hadir' | 'Terlambat' | 'Izin';
  tapType?: 'Masuk' | 'Pulang';
  sessionTitle: string;
  notes?: string;
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
  room: 'Lab Komputer' | 'Lab Komputer 1 (Utama)' | 'Lab Komputer 2 (Multimedia)' | 'Lab Jaringan & Server';
  capacity: number;
  description: string;
}

export interface PortfolioItem {
  id: string;
  title: string;
  category: 'C# Desktop' | 'Scratch Game' | 'UI/UX Design' | 'Jaringan & IoT' | 'Web Apps';
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

export interface AdminUser {
  isAuthenticated: boolean;
  name: string;
  nip: string;
  role: 'guru_admin';
  email: string;
  avatar: string;
}
