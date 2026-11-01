import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  deleteDoc,
  getDocs, 
  getDocFromServer,
  onSnapshot, 
  query, 
  orderBy, 
  limit, 
  Firestore
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import config from '../../firebase-applet-config.json';
import { Student, AttendanceRecord, ScheduleItem, PortfolioItem } from '../types';
import { 
  INITIAL_STUDENTS, 
  INITIAL_ATTENDANCE, 
  INITIAL_SCHEDULE, 
  INITIAL_PORTFOLIO 
} from '../data/initialData';

// Firebase Configuration with reliable fallbacks for external deployments (Vercel, Netlify)
export const FIREBASE_CONFIG = {
  apiKey: config?.apiKey || "AIzaSyDj9YZdJYNzfVQCoAbNzL4yOteSn0PWkG0",
  authDomain: config?.authDomain || "angular-bonbon-93kqt.firebaseapp.com",
  projectId: config?.projectId || "angular-bonbon-93kqt",
  storageBucket: config?.storageBucket || "angular-bonbon-93kqt.firebasestorage.app",
  messagingSenderId: config?.messagingSenderId || "59593777959",
  appId: config?.appId || "1:59593777959:web:41070e9e23b843b99dbf02",
  firestoreDatabaseId: config?.firestoreDatabaseId || "ai-studio-labkomputeritclu-830bf4bb-f7b8-46a0-ac95-dd0dd4c673e1"
};

// Initialize Firebase App
const app = getApps().length > 0 ? getApp() : initializeApp(FIREBASE_CONFIG);

// Initialize Firestore with specific database ID
export const db: Firestore = FIREBASE_CONFIG.firestoreDatabaseId && FIREBASE_CONFIG.firestoreDatabaseId !== '(default)'
  ? getFirestore(app, FIREBASE_CONFIG.firestoreDatabaseId)
  : getFirestore(app);

export const auth = getAuth(app);

// Connection state checker
export async function validateFirestoreConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log('[Firestore] Connected to server successfully');
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('[Firestore] Client is offline or checking connection:', error.message);
      return false;
    }
    return true;
  }
}

// ==========================================
// 1. STUDENTS (DATA ANGGOTA & KARTU SISWA)
// ==========================================
export async function getOrSeedStudents(): Promise<Student[]> {
  try {
    const studentsCol = collection(db, 'students');
    const snapshot = await getDocs(studentsCol);

    if (!snapshot.empty) {
      const list: Student[] = [];
      snapshot.forEach((d) => {
        list.push(d.data() as Student);
      });
      return list;
    }

    console.log('[Firestore] Seeding initial students to Firestore server...');
    const seededList: Student[] = [];
    for (const s of INITIAL_STUDENTS) {
      await setDoc(doc(db, 'students', s.id), s);
      seededList.push(s);
    }
    return seededList;
  } catch (err) {
    console.warn('[Firestore] Error fetching students, using fallback:', err);
    return INITIAL_STUDENTS;
  }
}

export async function saveStudentToFirestore(student: Student): Promise<void> {
  try {
    await setDoc(doc(db, 'students', student.id), student);
    console.log('[Firestore] Student saved to server:', student.id);
  } catch (err) {
    console.error('[Firestore] Failed to save student:', err);
    throw err;
  }
}

export async function deleteStudentFromFirestore(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'students', id));
    console.log('[Firestore] Student deleted from server:', id);
  } catch (err) {
    console.error('[Firestore] Failed to delete student:', err);
    throw err;
  }
}

export function subscribeToStudents(callback: (students: Student[]) => void): () => void {
  try {
    const col = collection(db, 'students');
    const unsubscribe = onSnapshot(
      col,
      (snapshot) => {
        if (!snapshot.empty) {
          const list: Student[] = [];
          snapshot.forEach((d) => {
            list.push(d.data() as Student);
          });
          callback(list);
        }
      },
      (error) => console.warn('[Firestore] Students subscription error:', error)
    );
    return unsubscribe;
  } catch (err) {
    console.warn('[Firestore] Students subscription failed:', err);
    return () => {};
  }
}

// ==========================================
// 2. ATTENDANCE (REKAMAN PRESENSI LAB)
// ==========================================
export async function getOrSeedAttendance(): Promise<AttendanceRecord[]> {
  try {
    const attCol = collection(db, 'attendance');
    const q = query(attCol, orderBy('timestamp', 'desc'), limit(100));
    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
      const list: AttendanceRecord[] = [];
      snapshot.forEach((d) => {
        list.push(d.data() as AttendanceRecord);
      });
      return list;
    }

    console.log('[Firestore] Seeding initial attendance to Firestore server...');
    const seeded: AttendanceRecord[] = [];
    for (const a of INITIAL_ATTENDANCE) {
      await setDoc(doc(db, 'attendance', a.id), a);
      seeded.push(a);
    }
    return seeded;
  } catch (err) {
    console.warn('[Firestore] Error fetching attendance, using fallback:', err);
    return INITIAL_ATTENDANCE;
  }
}

export async function addAttendanceRecord(record: AttendanceRecord): Promise<void> {
  try {
    const recordDoc = doc(db, 'attendance', record.id);
    await setDoc(recordDoc, record);
    console.log('[Firestore] Successfully saved record to server:', record.id);
  } catch (err) {
    console.error('[Firestore] Failed to save attendance record:', err);
    throw err;
  }
}

export function subscribeToAttendanceRecords(
  callback: (records: AttendanceRecord[]) => void
): () => void {
  try {
    const attCol = collection(db, 'attendance');
    const q = query(attCol, orderBy('timestamp', 'desc'), limit(100));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const records: AttendanceRecord[] = [];
        snapshot.forEach((d) => {
          records.push(d.data() as AttendanceRecord);
        });
        if (records.length > 0) {
          callback(records);
        }
      },
      (error) => console.warn('[Firestore] Attendance onSnapshot error:', error)
    );

    return unsubscribe;
  } catch (err) {
    console.warn('[Firestore] Attendance subscription failed:', err);
    return () => {};
  }
}

// ==========================================
// 3. SCHEDULES (JADWAL LAB & IT CLUB)
// ==========================================
export async function getOrSeedSchedules(): Promise<ScheduleItem[]> {
  try {
    const schedCol = collection(db, 'schedules');
    const snapshot = await getDocs(schedCol);

    if (!snapshot.empty) {
      const list: ScheduleItem[] = [];
      snapshot.forEach((d) => {
        list.push(d.data() as ScheduleItem);
      });
      return list;
    }

    console.log('[Firestore] Seeding initial schedules to Firestore server...');
    const seeded: ScheduleItem[] = [];
    for (const s of INITIAL_SCHEDULE) {
      await setDoc(doc(db, 'schedules', s.id), s);
      seeded.push(s);
    }
    return seeded;
  } catch (err) {
    console.warn('[Firestore] Error fetching schedules, using fallback:', err);
    return INITIAL_SCHEDULE;
  }
}

export async function saveScheduleToFirestore(schedule: ScheduleItem): Promise<void> {
  try {
    await setDoc(doc(db, 'schedules', schedule.id), schedule);
    console.log('[Firestore] Schedule saved to server:', schedule.id);
  } catch (err) {
    console.error('[Firestore] Failed to save schedule:', err);
    throw err;
  }
}

export async function deleteScheduleFromFirestore(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'schedules', id));
    console.log('[Firestore] Schedule deleted from server:', id);
  } catch (err) {
    console.error('[Firestore] Failed to delete schedule:', err);
    throw err;
  }
}

export function subscribeToSchedules(callback: (schedules: ScheduleItem[]) => void): () => void {
  try {
    const col = collection(db, 'schedules');
    const unsubscribe = onSnapshot(
      col,
      (snapshot) => {
        if (!snapshot.empty) {
          const list: ScheduleItem[] = [];
          snapshot.forEach((d) => {
            list.push(d.data() as ScheduleItem);
          });
          callback(list);
        }
      },
      (error) => console.warn('[Firestore] Schedules subscription error:', error)
    );
    return unsubscribe;
  } catch (err) {
    console.warn('[Firestore] Schedules subscription failed:', err);
    return () => {};
  }
}

// ==========================================
// 4. PORTFOLIOS (PORTOFOLIO KARYA SISWA)
// ==========================================
export async function getOrSeedPortfolios(): Promise<PortfolioItem[]> {
  try {
    const portCol = collection(db, 'portfolios');
    const snapshot = await getDocs(portCol);

    if (!snapshot.empty) {
      const list: PortfolioItem[] = [];
      snapshot.forEach((d) => {
        list.push(d.data() as PortfolioItem);
      });
      return list;
    }

    console.log('[Firestore] Seeding initial portfolios to Firestore server...');
    const seeded: PortfolioItem[] = [];
    for (const p of INITIAL_PORTFOLIO) {
      await setDoc(doc(db, 'portfolios', p.id), p);
      seeded.push(p);
    }
    return seeded;
  } catch (err) {
    console.warn('[Firestore] Error fetching portfolios, using fallback:', err);
    return INITIAL_PORTFOLIO;
  }
}

export async function savePortfolioToFirestore(portfolio: PortfolioItem): Promise<void> {
  try {
    await setDoc(doc(db, 'portfolios', portfolio.id), portfolio);
    console.log('[Firestore] Portfolio saved to server:', portfolio.id);
  } catch (err) {
    console.error('[Firestore] Failed to save portfolio:', err);
    throw err;
  }
}

export async function deletePortfolioFromFirestore(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'portfolios', id));
    console.log('[Firestore] Portfolio deleted from server:', id);
  } catch (err) {
    console.error('[Firestore] Failed to delete portfolio:', err);
    throw err;
  }
}

export function subscribeToPortfolios(callback: (portfolios: PortfolioItem[]) => void): () => void {
  try {
    const col = collection(db, 'portfolios');
    const unsubscribe = onSnapshot(
      col,
      (snapshot) => {
        if (!snapshot.empty) {
          const list: PortfolioItem[] = [];
          snapshot.forEach((d) => {
            list.push(d.data() as PortfolioItem);
          });
          callback(list);
        }
      },
      (error) => console.warn('[Firestore] Portfolios subscription error:', error)
    );
    return unsubscribe;
  } catch (err) {
    console.warn('[Firestore] Portfolios subscription failed:', err);
    return () => {};
  }
}
