import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  deleteDoc,
  getDocs, 
  getDoc,
  getDocFromServer,
  onSnapshot, 
  query, 
  orderBy, 
  limit, 
  writeBatch,
  Firestore
} from 'firebase/firestore';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import config from '../../firebase-applet-config.json';
import {
  Student,
  AttendanceRecord,
  ScheduleItem,
  PortfolioItem,
  ActivityEvent,
  StudentAssessment,
  PembinaCardProfile,
  ActivityRegistration,
  LearningModule,
  TaskSubmission,
  LabAnnouncement,
  StaffRoleEntry,
} from '../types';
import { WhatsAppGatewayConfig } from '../utils/whatsapp';
import { 
  INITIAL_STUDENTS, 
  INITIAL_ATTENDANCE, 
  INITIAL_SCHEDULE, 
  INITIAL_PORTFOLIO,
  INITIAL_ACTIVITIES,
  INITIAL_ASSESSMENTS,
  INITIAL_MODULES
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
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export const PRIMARY_PEMBINA_EMAIL = 'dwiambalaziz@gmail.com';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export async function signInWithGoogleFirebase() {
  const result = await signInWithPopup(auth, googleProvider);
  return result.user;
}

export async function signOutFirebase() {
  try {
    await signOut(auth);
  } catch (err) {
    console.warn('[Auth] Sign out note:', err);
  }
}

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

/**
 * Sanitizes any data payload for Cloud Firestore by removing `undefined` properties
 * and ensuring values conform to Firestore supported types.
 */
export function sanitizeForFirestore<T extends Record<string, any>>(obj: T): Record<string, any> {
  if (obj === null || obj === undefined) return {};
  const cleaned: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value === undefined) {
      continue;
    }
    if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
      cleaned[key] = sanitizeForFirestore(value);
    } else {
      cleaned[key] = value;
    }
  }
  return cleaned;
}

export async function saveStudentToFirestore(student: Student): Promise<void> {
  try {
    const payload = sanitizeForFirestore({
      ...student,
      rfidUid: student.rfidUid ? student.rfidUid.trim() : '',
      parentName: student.parentName ? student.parentName.trim() : '',
      parentPhone: student.parentPhone ? student.parentPhone.trim() : '',
      position: student.position ? student.position.trim() : '',
    });
    await setDoc(doc(db, 'students', student.id), payload, { merge: true });
    console.log('[Firestore] Student saved successfully to server:', student.id, payload);
  } catch (err) {
    console.error('[Firestore] Failed to save student to server:', err);
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

    // Check whether attendance was already initialized or intentionally reset
    const metaRef = doc(db, 'settings', 'attendance_meta');
    const metaSnap = await getDoc(metaRef);
    if (metaSnap.exists()) {
      console.log('[Firestore] Attendance is empty (already seeded/reset), skipping dummy seed.');
      return [];
    }

    console.log('[Firestore] Seeding initial attendance to Firestore server...');
    const seeded: AttendanceRecord[] = [];
    for (const a of INITIAL_ATTENDANCE) {
      await setDoc(doc(db, 'attendance', a.id), a);
      seeded.push(a);
    }
    await setDoc(metaRef, { seeded: true, seededAt: new Date().toISOString() }, { merge: true });
    return seeded;
  } catch (err) {
    console.warn('[Firestore] Error fetching attendance, using fallback:', err);
    return INITIAL_ATTENDANCE;
  }
}

export async function addAttendanceRecord(record: AttendanceRecord): Promise<void> {
  try {
    const recordDoc = doc(db, 'attendance', record.id);
    await setDoc(recordDoc, sanitizeForFirestore(record));
    console.log('[Firestore] Successfully saved record to server:', record.id);
  } catch (err) {
    console.error('[Firestore] Failed to save attendance record:', err);
    throw err;
  }
}

export async function resetAttendanceInFirestore(): Promise<number> {
  try {
    const attCol = collection(db, 'attendance');
    const snapshot = await getDocs(attCol);

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

    // Record reset flag so INITIAL_ATTENDANCE is never re-seeded automatically
    await setDoc(
      doc(db, 'settings', 'attendance_meta'),
      {
        seeded: true,
        lastResetAt: new Date().toISOString(),
        deletedCount: docs.length,
      },
      { merge: true }
    );

    console.log(`[Firestore] Reset attendance completed. Deleted ${docs.length} records (students preserved).`);
    return docs.length;
  } catch (err) {
    console.error('[Firestore] Failed to reset attendance records:', err);
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
        callback(records);
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
    await setDoc(doc(db, 'schedules', schedule.id), sanitizeForFirestore(schedule), { merge: true });
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
    await setDoc(doc(db, 'portfolios', portfolio.id), sanitizeForFirestore(portfolio), { merge: true });
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

// ==========================================
// 5. ACTIVITIES (AGENDA KEGIATAN & WORKSHOP)
// ==========================================
export async function getOrSeedActivities(): Promise<ActivityEvent[]> {
  try {
    const actCol = collection(db, 'activities');
    const snapshot = await getDocs(actCol);

    if (!snapshot.empty) {
      const list: ActivityEvent[] = [];
      snapshot.forEach((d) => {
        list.push(d.data() as ActivityEvent);
      });
      return list;
    }

    console.log('[Firestore] Seeding initial activities to Firestore server...');
    const seeded: ActivityEvent[] = [];
    for (const a of INITIAL_ACTIVITIES) {
      await setDoc(doc(db, 'activities', a.id), a);
      seeded.push(a);
    }
    return seeded;
  } catch (err) {
    console.warn('[Firestore] Error fetching activities, using fallback:', err);
    return INITIAL_ACTIVITIES;
  }
}

export async function saveActivityToFirestore(activity: ActivityEvent): Promise<void> {
  try {
    await setDoc(doc(db, 'activities', activity.id), sanitizeForFirestore(activity), { merge: true });
    console.log('[Firestore] Activity saved to server:', activity.id);
  } catch (err) {
    console.error('[Firestore] Failed to save activity:', err);
    throw err;
  }
}

export async function deleteActivityFromFirestore(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'activities', id));
    console.log('[Firestore] Activity deleted from server:', id);
  } catch (err) {
    console.error('[Firestore] Failed to delete activity:', err);
    throw err;
  }
}

export function subscribeToActivities(callback: (activities: ActivityEvent[]) => void): () => void {
  try {
    const col = collection(db, 'activities');
    const unsubscribe = onSnapshot(
      col,
      (snapshot) => {
        if (!snapshot.empty) {
          const list: ActivityEvent[] = [];
          snapshot.forEach((d) => {
            list.push(d.data() as ActivityEvent);
          });
          callback(list);
        }
      },
      (error) => console.warn('[Firestore] Activities subscription error:', error)
    );
    return unsubscribe;
  } catch (err) {
    console.warn('[Firestore] Activities subscription failed:', err);
    return () => {};
  }
}

// ==========================================
// 6. WHATSAPP GATEWAY & TOKEN SETTINGS
// ==========================================
export async function getWhatsAppConfigFromFirestore(): Promise<WhatsAppGatewayConfig | null> {
  try {
    const docRef = doc(db, 'settings', 'whatsapp');
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data();
      return {
        mode: data.mode || 'gateway',
        provider: data.provider || 'fonnte',
        apiKey: data.apiKey || '',
        customEndpoint: data.customEndpoint || '',
        enabled: data.enabled !== undefined ? Boolean(data.enabled) : true,
      };
    }
  } catch (err) {
    console.warn('[Firestore] Error fetching whatsapp config from server:', err);
  }
  return null;
}

export async function saveWhatsAppConfigToFirestore(config: WhatsAppGatewayConfig): Promise<void> {
  try {
    const docRef = doc(db, 'settings', 'whatsapp');
    const payload = sanitizeForFirestore({
      ...config,
      id: 'whatsapp',
      updatedAt: new Date().toISOString(),
    });
    await setDoc(docRef, payload, { merge: true });
    console.log('[Firestore] WhatsApp gateway configuration synced to cloud server:', payload);
  } catch (err) {
    console.error('[Firestore] Failed to save whatsapp config to server:', err);
    throw err;
  }
}

export function subscribeToWhatsAppConfig(
  callback: (config: WhatsAppGatewayConfig) => void
): () => void {
  try {
    const docRef = doc(db, 'settings', 'whatsapp');
    const unsubscribe = onSnapshot(
      docRef,
      (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          const parsed: WhatsAppGatewayConfig = {
            mode: data.mode || 'gateway',
            provider: data.provider || 'fonnte',
            apiKey: data.apiKey || '',
            customEndpoint: data.customEndpoint || '',
            enabled: data.enabled !== undefined ? Boolean(data.enabled) : true,
          };
          callback(parsed);
        }
      },
      (error) => console.warn('[Firestore] WhatsApp config subscription error:', error)
    );
    return unsubscribe;
  } catch (err) {
    console.warn('[Firestore] WhatsApp config subscription failed:', err);
    return () => {};
  }
}

// ==========================================
// 7. STUDENT ASSESSMENTS (PENILAIAN & RAPOR IT CLUB)
// ==========================================
export async function getOrSeedAssessments(): Promise<StudentAssessment[]> {
  try {
    const col = collection(db, 'assessments');
    const snapshot = await getDocs(col);

    if (!snapshot.empty) {
      const list: StudentAssessment[] = [];
      snapshot.forEach((d) => {
        list.push(d.data() as StudentAssessment);
      });
      return list;
    }

    console.log('[Firestore] Seeding initial assessments to Firestore server...');
    const seeded: StudentAssessment[] = [];
    for (const a of INITIAL_ASSESSMENTS) {
      await setDoc(doc(db, 'assessments', a.id), sanitizeForFirestore(a));
      seeded.push(a);
    }
    return seeded;
  } catch (err) {
    console.warn('[Firestore] Error fetching assessments, using fallback:', err);
    return INITIAL_ASSESSMENTS;
  }
}

export async function saveAssessmentToFirestore(assessment: StudentAssessment): Promise<void> {
  try {
    const payload = sanitizeForFirestore({
      ...assessment,
      updatedAt: assessment.updatedAt || new Date().toISOString(),
    });
    await setDoc(doc(db, 'assessments', assessment.id), payload, { merge: true });
    console.log('[Firestore] Assessment saved to server:', assessment.id);
  } catch (err) {
    console.error('[Firestore] Failed to save assessment to server:', err);
    throw err;
  }
}

export async function deleteAssessmentFromFirestore(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'assessments', id));
    console.log('[Firestore] Assessment deleted from server:', id);
  } catch (err) {
    console.error('[Firestore] Failed to delete assessment:', err);
    throw err;
  }
}

export function subscribeToAssessments(
  callback: (assessments: StudentAssessment[]) => void
): () => void {
  try {
    const col = collection(db, 'assessments');
    const unsubscribe = onSnapshot(
      col,
      (snapshot) => {
        if (!snapshot.empty) {
          const list: StudentAssessment[] = [];
          snapshot.forEach((d) => {
            list.push(d.data() as StudentAssessment);
          });
          callback(list);
        }
      },
      (error) => console.warn('[Firestore] Assessments subscription error:', error)
    );
    return unsubscribe;
  } catch (err) {
    console.warn('[Firestore] Assessments subscription failed:', err);
    return () => {};
  }
}

// ==========================================
// 8. KARTU KHUSUS PEMBINA (TERPISAH DARI DATA ANGGOTA)
// ==========================================
export async function getPembinaCardFromFirestore(): Promise<PembinaCardProfile | null> {
  try {
    const docRef = doc(db, 'settings', 'pembina_card');
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data() as PembinaCardProfile;
    }
  } catch (err) {
    console.warn('[Firestore] Error fetching pembina card profile:', err);
  }
  return null;
}

export async function savePembinaCardToFirestore(profile: PembinaCardProfile): Promise<void> {
  try {
    const docRef = doc(db, 'settings', 'pembina_card');
    const payload = sanitizeForFirestore({
      ...profile,
      id: 'pembina_card',
      updatedAt: new Date().toISOString(),
    });
    await setDoc(docRef, payload, { merge: true });
    console.log('[Firestore] Pembina card profile saved to server (without modifying students).');
  } catch (err) {
    console.error('[Firestore] Failed to save pembina card profile:', err);
    throw err;
  }
}

export function subscribeToPembinaCard(
  callback: (profile: PembinaCardProfile | null) => void
): () => void {
  try {
    const docRef = doc(db, 'settings', 'pembina_card');
    return onSnapshot(
      docRef,
      (snap) => {
        if (snap.exists()) {
          callback(snap.data() as PembinaCardProfile);
        }
      },
      (error) => console.warn('[Firestore] Pembina card subscription error:', error)
    );
  } catch (err) {
    console.warn('[Firestore] Pembina card subscription failed:', err);
    return () => {};
  }
}

// ==========================================
// 9. ACTIVITY REGISTRATIONS & COACH CONTACT
// ==========================================
export interface CoachContactConfig {
  coachName: string;
  coachWhatsapp: string;
  coachEmail: string;
  updatedAt?: string;
}

export async function getCoachContactFromFirestore(): Promise<CoachContactConfig | null> {
  try {
    const docRef = doc(db, 'settings', 'coach_contact');
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data();
      return {
        coachName: data.coachName || 'Dwi Ambal Aziz, S.Kom',
        coachWhatsapp: data.coachWhatsapp || '085731731051',
        coachEmail: data.coachEmail || 'dwiambalaziz@gmail.com',
        updatedAt: data.updatedAt,
      };
    }
    const cardSnap = await getDoc(doc(db, 'settings', 'pembina_card'));
    if (cardSnap.exists()) {
      const cardData = cardSnap.data();
      return {
        coachName: cardData.name || 'Dwi Ambal Aziz, S.Kom',
        coachWhatsapp: cardData.phone || '085731731051',
        coachEmail: cardData.email || 'dwiambalaziz@gmail.com',
        updatedAt: cardData.updatedAt,
      };
    }
  } catch (err) {
    console.warn('[Firestore] Error fetching coach contact config:', err);
  }
  return null;
}

export async function saveCoachContactToFirestore(configPayload: CoachContactConfig): Promise<void> {
  try {
    const docRef = doc(db, 'settings', 'coach_contact');
    const payload = sanitizeForFirestore({
      ...configPayload,
      id: 'coach_contact',
      updatedAt: new Date().toISOString(),
    });
    await setDoc(docRef, payload, { merge: true });
  } catch (err) {
    console.error('[Firestore] Failed to save coach contact config:', err);
    throw err;
  }
}

export async function getActivityRegistrationsFromFirestore(): Promise<ActivityRegistration[]> {
  try {
    const q = query(collection(db, 'activity_registrations'), orderBy('createdAt', 'desc'), limit(200));
    const snapshot = await getDocs(q);
    const list: ActivityRegistration[] = [];
    snapshot.forEach((d) => {
      list.push(d.data() as ActivityRegistration);
    });
    return list;
  } catch (err) {
    console.warn('[Firestore] Error fetching activity registrations:', err);
    return [];
  }
}

export async function saveActivityRegistrationToFirestore(reg: ActivityRegistration): Promise<void> {
  try {
    const payload = sanitizeForFirestore({
      ...reg,
      participantName: reg.participantName.trim().slice(0, 120),
      participantClass: reg.participantClass.trim().slice(0, 80),
      participantWhatsapp: reg.participantWhatsapp.trim().slice(0, 30),
      reason: reg.reason.trim().slice(0, 1000),
    });
    await setDoc(doc(db, 'activity_registrations', reg.id), payload);
  } catch (err) {
    console.error('[Firestore] Failed to save activity registration:', err);
    throw err;
  }
}

export async function deleteActivityRegistrationFromFirestore(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'activity_registrations', id));
  } catch (err) {
    console.error('[Firestore] Failed to delete activity registration:', err);
    throw err;
  }
}

export function subscribeToActivityRegistrations(
  callback: (list: ActivityRegistration[]) => void
): () => void {
  try {
    const q = query(collection(db, 'activity_registrations'), orderBy('createdAt', 'desc'), limit(200));
    return onSnapshot(
      q,
      (snapshot) => {
        const list: ActivityRegistration[] = [];
        snapshot.forEach((d) => {
          list.push(d.data() as ActivityRegistration);
        });
        callback(list);
      },
      (error) => console.warn('[Firestore] Activity registrations subscription error:', error)
    );
  } catch (err) {
    console.warn('[Firestore] Activity registrations subscription failed:', err);
    return () => {};
  }
}

// ==========================================
// 10. LEARNING MODULES & TASK SUBMISSIONS
// ==========================================
export async function getOrSeedLearningModules(): Promise<LearningModule[]> {
  try {
    const colRef = collection(db, 'learning_modules');
    const snap = await getDocs(colRef);
    if (!snap.empty) {
      return snap.docs.map((d) => d.data() as LearningModule);
    }
    const seeded: LearningModule[] = [];
    for (const m of INITIAL_MODULES) {
      const payload = sanitizeForFirestore({
        ...m,
        pdfUrl: 'https://sfl.gl/eXMZXIfr',
        updatedAt: new Date().toISOString(),
      });
      await setDoc(doc(db, 'learning_modules', m.id), payload);
      seeded.push(payload as LearningModule);
    }
    return seeded;
  } catch (err) {
    console.warn('[Firestore] Error fetching learning modules, using fallback:', err);
    return INITIAL_MODULES;
  }
}

export async function saveLearningModuleToFirestore(mod: LearningModule): Promise<void> {
  try {
    const payload = sanitizeForFirestore({
      ...mod,
      title: mod.title.trim().slice(0, 180),
      description: mod.description.trim().slice(0, 2000),
      syllabus: (mod.syllabus || []).slice(0, 30),
      updatedAt: new Date().toISOString(),
    });
    await setDoc(doc(db, 'learning_modules', mod.id), payload, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `learning_modules/${mod.id}`);
  }
}

export async function deleteLearningModuleFromFirestore(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'learning_modules', id));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `learning_modules/${id}`);
  }
}

export function subscribeToLearningModules(callback: (list: LearningModule[]) => void): () => void {
  try {
    return onSnapshot(
      collection(db, 'learning_modules'),
      (snap) => {
        if (!snap.empty) {
          callback(snap.docs.map((d) => d.data() as LearningModule));
        }
      },
      (err) => console.warn('[Firestore] Learning modules subscription error:', err)
    );
  } catch {
    return () => {};
  }
}

export async function saveTaskSubmissionToFirestore(sub: TaskSubmission): Promise<void> {
  try {
    const payload = sanitizeForFirestore({
      ...sub,
      studentName: sub.studentName.trim().slice(0, 120),
      nisn: sub.nisn.trim().slice(0, 40),
      studentClass: sub.studentClass.trim().slice(0, 60),
      projectUrl: sub.projectUrl.trim().slice(0, 500),
      notes: (sub.notes || '').trim().slice(0, 1000),
      feedback: (sub.feedback || '').trim().slice(0, 1000),
    });
    await setDoc(doc(db, 'task_submissions', sub.id), payload, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `task_submissions/${sub.id}`);
  }
}

export async function deleteTaskSubmissionFromFirestore(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'task_submissions', id));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `task_submissions/${id}`);
  }
}

export function subscribeToTaskSubmissions(callback: (list: TaskSubmission[]) => void): () => void {
  try {
    const q = query(collection(db, 'task_submissions'), orderBy('submittedAt', 'desc'), limit(200));
    return onSnapshot(
      q,
      (snap) => {
        callback(snap.docs.map((d) => d.data() as TaskSubmission));
      },
      (err) => console.warn('[Firestore] Task submissions subscription error:', err)
    );
  } catch {
    return () => {};
  }
}

// ==========================================
// 11. LAB ANNOUNCEMENTS (PAPAN PENGUMUMAN)
// ==========================================
export const INITIAL_ANNOUNCEMENTS: LabAnnouncement[] = [
  {
    id: 'ann-welcome-2026',
    title: 'Presensi RFID & Kartu Pembina Aktif · Wajib Bawa Kartu Anggota',
    content:
      'Seluruh anggota IT Club wajib melakukan Tap Masuk (11:15 WIB) dan Tap Pulang (13:40 WIB) menggunakan kartu RFID/QR masing-masing di terminal Lab Komputer.',
    priority: 'Info',
    active: true,
    authorName: 'Pembina IT Club',
    createdAt: '2026-02-01T08:00:00.000Z',
  },
];

export async function getOrSeedAnnouncements(): Promise<LabAnnouncement[]> {
  try {
    const snap = await getDocs(collection(db, 'announcements'));
    if (!snap.empty) {
      return snap.docs
        .map((d) => d.data() as LabAnnouncement)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    }
    const metaRef = doc(db, 'settings', 'announcements_meta');
    const metaSnap = await getDoc(metaRef);
    if (metaSnap.exists()) return [];

    for (const ann of INITIAL_ANNOUNCEMENTS) {
      await setDoc(doc(db, 'announcements', ann.id), sanitizeForFirestore(ann));
    }
    await setDoc(metaRef, { seeded: true, seededAt: new Date().toISOString() }, { merge: true });
    return INITIAL_ANNOUNCEMENTS;
  } catch (err) {
    console.warn('[Firestore] Error fetching announcements:', err);
    return INITIAL_ANNOUNCEMENTS;
  }
}

export async function saveAnnouncementToFirestore(ann: LabAnnouncement): Promise<void> {
  try {
    const payload = sanitizeForFirestore({
      ...ann,
      title: ann.title.trim().slice(0, 160),
      content: ann.content.trim().slice(0, 800),
    });
    await setDoc(doc(db, 'announcements', ann.id), payload, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `announcements/${ann.id}`);
  }
}

export async function deleteAnnouncementFromFirestore(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'announcements', id));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `announcements/${id}`);
  }
}

export function subscribeToAnnouncements(callback: (list: LabAnnouncement[]) => void): () => void {
  try {
    const q = query(collection(db, 'announcements'), orderBy('createdAt', 'desc'), limit(20));
    return onSnapshot(
      q,
      (snap) => {
        callback(snap.docs.map((d) => d.data() as LabAnnouncement));
      },
      (err) => console.warn('[Firestore] Announcements subscription error:', err)
    );
  } catch {
    return () => {};
  }
}

// ==========================================
// 13. MULTI-ROLE STAFF ACCESS (PEMBINA & PENGURUS)
// ==========================================
export function emailToDocKey(email: string): string {
  return email.trim().toLowerCase().replace(/[^a-z0-9]/g, '_');
}

export async function getStaffRoleByEmail(email: string): Promise<StaffRoleEntry | null> {
  const cleanEmail = email.trim().toLowerCase();
  if (!cleanEmail) return null;
  if (cleanEmail === PRIMARY_PEMBINA_EMAIL) {
    return {
      email: cleanEmail,
      name: 'Dwi Ambal Aziz, S.Kom., Gr.',
      role: 'guru_admin',
      addedBy: 'system',
      createdAt: new Date().toISOString(),
    };
  }
  try {
    const key = emailToDocKey(cleanEmail);
    const snap = await getDoc(doc(db, 'staff_roles', key));
    if (snap.exists()) {
      return snap.data() as StaffRoleEntry;
    }
  } catch (err) {
    console.warn('[Firestore] Error checking staff role:', err);
  }
  return null;
}

export async function saveStaffRoleToFirestore(entry: StaffRoleEntry): Promise<void> {
  const key = emailToDocKey(entry.email);
  try {
    await setDoc(
      doc(db, 'staff_roles', key),
      sanitizeForFirestore({
        ...entry,
        email: entry.email.trim().toLowerCase(),
        name: entry.name.trim().slice(0, 120),
      }),
      { merge: true }
    );
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `staff_roles/${key}`);
  }
}

export async function deleteStaffRoleFromFirestore(email: string): Promise<void> {
  const key = emailToDocKey(email);
  try {
    await deleteDoc(doc(db, 'staff_roles', key));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `staff_roles/${key}`);
  }
}

export function subscribeToStaffRoles(callback: (list: StaffRoleEntry[]) => void): () => void {
  try {
    return onSnapshot(
      collection(db, 'staff_roles'),
      (snap) => {
        callback(snap.docs.map((d) => d.data() as StaffRoleEntry));
      },
      (err) => console.warn('[Firestore] Staff roles subscription error:', err)
    );
  } catch {
    return () => {};
  }
}

export function subscribeToCoachContact(
  callback: (config: CoachContactConfig | null) => void
): () => void {
  try {
    return onSnapshot(
      doc(db, 'settings', 'coach_contact'),
      (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          callback({
            coachName: data.coachName || 'Dwi Ambal Aziz, S.Kom',
            coachWhatsapp: data.coachWhatsapp || '085731731051',
            coachEmail: data.coachEmail || 'dwiambalaziz@gmail.com',
            updatedAt: data.updatedAt,
          });
        }
      },
      (err) => console.warn('[Firestore] Coach contact subscription error:', err)
    );
  } catch {
    return () => {};
  }
}




