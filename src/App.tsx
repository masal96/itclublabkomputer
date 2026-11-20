import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  ChevronRight,
  FolderGit2,
  Home,
  Trophy,
} from 'lucide-react';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { AbsensiSection } from './components/AbsensiSection';
import { CardStudioSection } from './components/CardStudioSection';
import { DataAnggotaSection } from './components/DataAnggotaSection';
import { JadwalSection } from './components/JadwalSection';
import { PortofolioSection } from './components/PortofolioSection';
import { PembelajaranSection } from './components/PembelajaranSection';
import { KegiatanSection } from './components/KegiatanSection';
import { AdminLoginModal } from './components/AdminLoginModal';
import { JoinClubModal } from './components/JoinClubModal';
import { Footer } from './components/Footer';
import { PenilaianSection } from './components/PenilaianSection';
import { AnnouncementBanner } from './components/AnnouncementBanner';
import { AnalyticsSection } from './components/AnalyticsSection';
import { CertificateVerifyModal } from './components/CertificateVerifyModal';
import { OfflineIndicator } from './components/PWAControls';

import { 
  INITIAL_STUDENTS, 
  INITIAL_ATTENDANCE, 
  INITIAL_SCHEDULE, 
  INITIAL_PORTFOLIO, 
  INITIAL_MODULES, 
  INITIAL_ACTIVITIES,
  INITIAL_ASSESSMENTS
} from './data/initialData';

import { 
  Student, 
  AttendanceRecord, 
  ScheduleItem, 
  PortfolioItem, 
  ActivityEvent,
  StudentAssessment,
  AdminUser,
  LearningModule,
  TaskSubmission,
  LabAnnouncement,
  StaffRoleEntry,
  PembinaCardProfile,
} from './types';

import {
  validateFirestoreConnection,
  getOrSeedStudents,
  saveStudentToFirestore,
  deleteStudentFromFirestore,
  subscribeToStudents,
  getOrSeedAttendance,
  addAttendanceRecord,
  resetAttendanceInFirestore,
  subscribeToAttendanceRecords,
  getOrSeedSchedules,
  saveScheduleToFirestore,
  deleteScheduleFromFirestore,
  subscribeToSchedules,
  getOrSeedPortfolios,
  savePortfolioToFirestore,
  deletePortfolioFromFirestore,
  subscribeToPortfolios,
  getOrSeedActivities,
  saveActivityToFirestore,
  deleteActivityFromFirestore,
  subscribeToActivities,
  getWhatsAppConfigFromFirestore,
  saveWhatsAppConfigToFirestore,
  subscribeToWhatsAppConfig,
  getOrSeedAssessments,
  saveAssessmentToFirestore,
  deleteAssessmentFromFirestore,
  subscribeToAssessments,
  getPembinaCardFromFirestore,
  subscribeToPembinaCard,
  getCoachContactFromFirestore,
  subscribeToCoachContact,
  type CoachContactConfig,
  getOrSeedLearningModules,
  saveLearningModuleToFirestore,
  deleteLearningModuleFromFirestore,
  subscribeToLearningModules,
  saveTaskSubmissionToFirestore,
  deleteTaskSubmissionFromFirestore,
  subscribeToTaskSubmissions,
  INITIAL_ANNOUNCEMENTS,
  getOrSeedAnnouncements,
  saveAnnouncementToFirestore,
  deleteAnnouncementFromFirestore,
  subscribeToAnnouncements,
  subscribeToStaffRoles,
  saveStaffRoleToFirestore,
  deleteStaffRoleFromFirestore,
  signOutFirebase,
} from './services/firebase';
import { getWhatsAppConfig, saveWhatsAppConfig } from './utils/whatsapp';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('beranda');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);
  const [adminModalOpen, setAdminModalOpen] = useState<boolean>(false);
  const [joinModalOpen, setJoinModalOpen] = useState<boolean>(false);
  const [verifyCertModalOpen, setVerifyCertModalOpen] = useState<boolean>(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      return Boolean(params.get('verify'));
    } catch {
      return false;
    }
  });
  const [verifyCertInitialCode, setVerifyCertInitialCode] = useState<string>(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      return params.get('verify') || '';
    } catch {
      return '';
    }
  });

  // Teacher Authentication state
  const [admin, setAdmin] = useState<AdminUser>(() => {
    try {
      const saved = localStorage.getItem('itclub_admin');
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return {
      isAuthenticated: false,
      name: '',
      nip: '',
      role: 'guru_admin',
      email: '',
      avatar: '',
    };
  });

  // Students Data with localStorage persistence
  const [students, setStudents] = useState<Student[]>(() => {
    try {
      const saved = localStorage.getItem('itclub_students');
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_STUDENTS;
  });

  // Attendance Records
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>(() => {
    try {
      const saved = localStorage.getItem('itclub_attendance');
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_ATTENDANCE;
  });

  // Schedule List
  const [scheduleList, setScheduleList] = useState<ScheduleItem[]>(() => {
    try {
      const saved = localStorage.getItem('itclub_schedule');
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_SCHEDULE;
  });

  // Portfolio List
  const [portfolioList, setPortfolioList] = useState<PortfolioItem[]>(() => {
    try {
      const saved = localStorage.getItem('itclub_portfolio');
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_PORTFOLIO;
  });

  // Activities List
  const [activityList, setActivityList] = useState<ActivityEvent[]>(() => {
    try {
      const saved = localStorage.getItem('itclub_activities');
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_ACTIVITIES;
  });

  // Student Assessments List
  const [assessments, setAssessments] = useState<StudentAssessment[]>(() => {
    try {
      const saved = localStorage.getItem('itclub_assessments');
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_ASSESSMENTS;
  });

  // Learning Modules (Firestore CRUD)
  const [learningModules, setLearningModules] = useState<LearningModule[]>(() => {
    try {
      const saved = localStorage.getItem('itclub_modules');
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_MODULES;
  });

  // Task Submissions
  const [taskSubmissions, setTaskSubmissions] = useState<TaskSubmission[]>([]);

  // Lab Announcements
  const [announcements, setAnnouncements] = useState<LabAnnouncement[]>(INITIAL_ANNOUNCEMENTS);

  // Staff Roles (Multi-Role RBAC)
  const [staffRoles, setStaffRoles] = useState<StaffRoleEntry[]>([]);

  // Synced Pembina Profile & Coach Contact
  const [pembinaProfile, setPembinaProfile] = useState<PembinaCardProfile>({
    id: 'pembina_card',
    name: 'Dwi Ambal Aziz, S.Kom., Gr.',
    nip: '321072605960009',
    roleTitle: 'Pembina Lab & IT Club',
    unit: 'Lab Komputer Terpadu',
    rfidUid: '0149059097',
    qrCodeData: 'ITCLUB:PEMBINA:321072605960009:Dwi Ambal Aziz, S.Kom., Gr.',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
    email: 'dwiambalaziz@gmail.com',
    phone: '085731731051',
  });

  const [coachContact, setCoachContact] = useState<CoachContactConfig>({
    coachName: 'Dwi Ambal Aziz, S.Kom., Gr.',
    coachWhatsapp: '6285731731051',
    coachEmail: 'dwiambalaziz@gmail.com',
  });

  // Save changes to localStorage
  useEffect(() => {
    localStorage.setItem('itclub_admin', JSON.stringify(admin));
  }, [admin]);

  useEffect(() => {
    localStorage.setItem('itclub_students', JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    localStorage.setItem('itclub_attendance', JSON.stringify(attendanceRecords));
  }, [attendanceRecords]);

  useEffect(() => {
    localStorage.setItem('itclub_schedule', JSON.stringify(scheduleList));
  }, [scheduleList]);

  useEffect(() => {
    localStorage.setItem('itclub_portfolio', JSON.stringify(portfolioList));
  }, [portfolioList]);

  useEffect(() => {
    localStorage.setItem('itclub_activities', JSON.stringify(activityList));
  }, [activityList]);

  useEffect(() => {
    localStorage.setItem('itclub_assessments', JSON.stringify(assessments));
  }, [assessments]);

  useEffect(() => {
    localStorage.setItem('itclub_modules', JSON.stringify(learningModules));
  }, [learningModules]);

  // Synchronize with Firebase Firestore Server
  useEffect(() => {
    // 1. Check server connection
    validateFirestoreConnection().catch((err) => {
      console.warn('Firestore connection check note:', err);
    });

    // 2. Fetch or seed students & subscribe in real-time
    getOrSeedStudents().then((serverStudents) => {
      if (serverStudents && serverStudents.length > 0) {
        setStudents(serverStudents);
      }
    }).catch((err) => {
      console.warn('Firestore getOrSeedStudents error:', err);
    });

    const unsubStudents = subscribeToStudents((liveStudents) => {
      if (liveStudents && liveStudents.length > 0) {
        setStudents(liveStudents);
      }
    });

    // 3. Fetch or seed attendance logs & subscribe in real-time
    getOrSeedAttendance().then((serverAttendance) => {
      if (Array.isArray(serverAttendance)) {
        setAttendanceRecords(serverAttendance);
      }
    }).catch((err) => {
      console.warn('Firestore getOrSeedAttendance error:', err);
    });

    const unsubAttendance = subscribeToAttendanceRecords((liveRecords) => {
      if (Array.isArray(liveRecords)) {
        setAttendanceRecords(liveRecords);
      }
    });

    // 4. Fetch or seed schedules & subscribe in real-time
    getOrSeedSchedules().then((serverSchedules) => {
      if (serverSchedules && serverSchedules.length > 0) {
        setScheduleList(serverSchedules);
      }
    }).catch((err) => {
      console.warn('Firestore getOrSeedSchedules error:', err);
    });

    const unsubSchedules = subscribeToSchedules((liveSchedules) => {
      if (liveSchedules && liveSchedules.length > 0) {
        setScheduleList(liveSchedules);
      }
    });

    // 5. Fetch or seed portfolios & subscribe in real-time
    getOrSeedPortfolios().then((serverPortfolios) => {
      if (serverPortfolios && serverPortfolios.length > 0) {
        setPortfolioList(serverPortfolios);
      }
    }).catch((err) => {
      console.warn('Firestore getOrSeedPortfolios error:', err);
    });

    const unsubPortfolios = subscribeToPortfolios((livePortfolios) => {
      if (livePortfolios && livePortfolios.length > 0) {
        setPortfolioList(livePortfolios);
      }
    });

    // 6. Fetch or seed activities & subscribe in real-time
    getOrSeedActivities().then((serverActivities) => {
      if (serverActivities && serverActivities.length > 0) {
        setActivityList(serverActivities);
      }
    }).catch((err) => {
      console.warn('Firestore getOrSeedActivities error:', err);
    });

    const unsubActivities = subscribeToActivities((liveActivities) => {
      if (liveActivities && liveActivities.length > 0) {
        setActivityList(liveActivities);
      }
    });

    // 6. Sync WhatsApp Gateway configuration across devices via Cloud Firestore
    getWhatsAppConfigFromFirestore()
      .then((serverConfig) => {
        if (serverConfig && (serverConfig.apiKey || serverConfig.mode)) {
          saveWhatsAppConfig(serverConfig);
        } else {
          const local = getWhatsAppConfig();
          if (local && local.apiKey) {
            saveWhatsAppConfigToFirestore(local).catch(console.warn);
          }
        }
      })
      .catch((err) => console.warn('Firestore getWhatsAppConfig error:', err));

    const unsubWaConfig = subscribeToWhatsAppConfig((liveWaConfig) => {
      if (liveWaConfig) {
        saveWhatsAppConfig(liveWaConfig);
      }
    });

    // 7. Fetch or seed student assessments & subscribe in real-time
    getOrSeedAssessments()
      .then((serverAssessments) => {
        if (serverAssessments && serverAssessments.length > 0) {
          setAssessments(serverAssessments);
        }
      })
      .catch((err) => {
        console.warn('Firestore getOrSeedAssessments error:', err);
      });

    const unsubAssessments = subscribeToAssessments((liveAssessments) => {
      if (liveAssessments && liveAssessments.length > 0) {
        setAssessments(liveAssessments);
      }
    });

    // 8. Learning Modules & Task Submissions
    getOrSeedLearningModules()
      .then((mods) => {
        if (mods && mods.length > 0) setLearningModules(mods);
      })
      .catch((err) => console.warn('Firestore getOrSeedLearningModules error:', err));
    const unsubModules = subscribeToLearningModules((liveMods) => {
      if (Array.isArray(liveMods)) setLearningModules(liveMods);
    });
    const unsubSubmissions = subscribeToTaskSubmissions((liveSubs) => {
      if (Array.isArray(liveSubs)) setTaskSubmissions(liveSubs);
    });

    // 9. Announcements
    getOrSeedAnnouncements()
      .then((list) => {
        if (list && list.length > 0) setAnnouncements(list);
      })
      .catch((err) => console.warn('Firestore getOrSeedAnnouncements error:', err));
    const unsubAnnouncements = subscribeToAnnouncements((liveList) => {
      if (Array.isArray(liveList)) setAnnouncements(liveList);
    });

    // 11. Multi-Role Staff Access
    const unsubStaffRoles = subscribeToStaffRoles((liveRoles) => {
      if (Array.isArray(liveRoles)) setStaffRoles(liveRoles);
    });

    // 12. Sync Pembina Profile & Coach Contact across Navbar, Login, Footer, Reports
    getPembinaCardFromFirestore()
      .then((p) => {
        if (p) setPembinaProfile((prev) => ({ ...prev, ...p }));
      })
      .catch((err) => console.warn('Firestore getPembinaCard error:', err));
    const unsubPembina = subscribeToPembinaCard((liveP) => {
      if (liveP) setPembinaProfile((prev) => ({ ...prev, ...liveP }));
    });

    getCoachContactFromFirestore()
      .then((c) => {
        if (c) setCoachContact(c);
      })
      .catch((err) => console.warn('Firestore getCoachContact error:', err));
    const unsubCoachContact = subscribeToCoachContact((liveC) => {
      if (liveC) setCoachContact(liveC);
    });

    return () => {
      unsubStudents();
      unsubAttendance();
      unsubSchedules();
      unsubPortfolios();
      unsubActivities();
      unsubWaConfig();
      unsubAssessments();
      unsubModules();
      unsubSubmissions();
      unsubAnnouncements();
      unsubStaffRoles();
      unsubPembina();
      unsubCoachContact();
    };
  }, []);

  // Handlers
  const handleLoginSuccess = (user: AdminUser) => {
    setAdmin(user);
    if (activeTab === 'beranda') {
      setActiveTab('absensi');
    }
  };

  const handleLogoutAdmin = () => {
    signOutFirebase().catch(() => {});
    setAdmin({
      isAuthenticated: false,
      name: '',
      nip: '',
      role: 'guru_admin',
      email: '',
      avatar: '',
    });
    if (activeTab === 'absensi' || activeTab === 'kartu' || activeTab === 'anggota') {
      setActiveTab('beranda');
    }
  };

  const handleAddAttendance = async (record: AttendanceRecord) => {
    setAttendanceRecords((prev) => [record, ...prev]);
    try {
      await addAttendanceRecord(record);
      console.log('Attendance successfully synced to Cloud Firestore');
    } catch (err) {
      console.warn('Note saving to Cloud Firestore:', err);
    }
  };

  const handleAddStudent = async (newStudent: Student) => {
    setStudents((prev) => [newStudent, ...prev]);
    try {
      await saveStudentToFirestore(newStudent);
      console.log('Student successfully synced to Cloud Firestore');
    } catch (err) {
      console.warn('Error saving student to Firestore:', err);
    }
  };

  const handleUpdateStudent = async (updatedStudent: Student) => {
    setStudents((prev) => prev.map((s) => (s.id === updatedStudent.id ? updatedStudent : s)));
    try {
      await saveStudentToFirestore(updatedStudent);
      console.log('Updated student successfully synced to Cloud Firestore');
    } catch (err) {
      console.warn('Error updating student to Firestore:', err);
    }
  };

  const handleDeleteStudent = async (id: string) => {
    setStudents((prev) => prev.filter((s) => s.id !== id));
    try {
      await deleteStudentFromFirestore(id);
      console.log('Deleted student from Cloud Firestore');
    } catch (err) {
      console.warn('Error deleting student from Firestore:', err);
    }
  };

  const handleResetAttendance = async (): Promise<number> => {
    if (admin.role !== 'guru_admin') {
      throw new Error('Hanya Pembina Utama yang diizinkan mereset riwayat absensi.');
    }
    const deletedCount = await resetAttendanceInFirestore();
    setAttendanceRecords([]);
    localStorage.setItem('itclub_attendance', JSON.stringify([]));
    return deletedCount;
  };

  const handleAddSchedule = async (item: ScheduleItem) => {
    setScheduleList((prev) => [item, ...prev]);
    try {
      await saveScheduleToFirestore(item);
      console.log('Schedule successfully synced to Cloud Firestore');
    } catch (err) {
      console.warn('Error saving schedule to Firestore:', err);
    }
  };

  const handleUpdateSchedule = async (updated: ScheduleItem) => {
    setScheduleList((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
    try {
      await saveScheduleToFirestore(updated);
      console.log('Updated schedule successfully synced to Cloud Firestore');
    } catch (err) {
      console.warn('Error updating schedule to Firestore:', err);
    }
  };

  const handleDeleteSchedule = async (id: string) => {
    setScheduleList((prev) => prev.filter((s) => s.id !== id));
    try {
      await deleteScheduleFromFirestore(id);
      console.log('Deleted schedule from Cloud Firestore');
    } catch (err) {
      console.warn('Error deleting schedule from Firestore:', err);
    }
  };

  const handleAddPortfolio = async (item: PortfolioItem) => {
    setPortfolioList((prev) => [item, ...prev]);
    try {
      await savePortfolioToFirestore(item);
      console.log('Portfolio successfully synced to Cloud Firestore');
    } catch (err) {
      console.warn('Error saving portfolio to Firestore:', err);
    }
  };

  const handleUpdatePortfolio = async (updated: PortfolioItem) => {
    setPortfolioList((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    try {
      await savePortfolioToFirestore(updated);
      console.log('Updated portfolio successfully synced to Cloud Firestore');
    } catch (err) {
      console.warn('Error updating portfolio to Firestore:', err);
    }
  };

  const handleDeletePortfolio = async (id: string) => {
    setPortfolioList((prev) => prev.filter((p) => p.id !== id));
    try {
      await deletePortfolioFromFirestore(id);
      console.log('Deleted portfolio from Cloud Firestore');
    } catch (err) {
      console.warn('Error deleting portfolio from Firestore:', err);
    }
  };

  const handleAddActivity = async (item: ActivityEvent) => {
    setActivityList((prev) => [item, ...prev]);
    try {
      await saveActivityToFirestore(item);
      console.log('Activity successfully synced to Cloud Firestore');
    } catch (err) {
      console.warn('Error saving activity to Firestore:', err);
    }
  };

  const handleUpdateActivity = async (updated: ActivityEvent) => {
    setActivityList((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
    try {
      await saveActivityToFirestore(updated);
      console.log('Updated activity successfully synced to Cloud Firestore');
    } catch (err) {
      console.warn('Error updating activity to Firestore:', err);
    }
  };

  const handleDeleteActivity = async (id: string) => {
    setActivityList((prev) => prev.filter((a) => a.id !== id));
    try {
      await deleteActivityFromFirestore(id);
      console.log('Deleted activity from Cloud Firestore');
    } catch (err) {
      console.warn('Error deleting activity from Firestore:', err);
    }
  };

  const handleAddAssessment = async (item: StudentAssessment) => {
    setAssessments((prev) => [item, ...prev]);
    try {
      await saveAssessmentToFirestore(item);
      console.log('Assessment successfully synced to Cloud Firestore');
    } catch (err) {
      console.warn('Error saving assessment to Firestore:', err);
    }
  };

  const handleUpdateAssessment = async (updated: StudentAssessment) => {
    setAssessments((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
    try {
      await saveAssessmentToFirestore(updated);
      console.log('Updated assessment successfully synced to Cloud Firestore');
    } catch (err) {
      console.warn('Error updating assessment to Firestore:', err);
    }
  };

  const handleDeleteAssessment = async (id: string) => {
    setAssessments((prev) => prev.filter((a) => a.id !== id));
    try {
      await deleteAssessmentFromFirestore(id);
      console.log('Deleted assessment from Cloud Firestore');
    } catch (err) {
      console.warn('Error deleting assessment from Firestore:', err);
    }
  };

  // Learning Modules & Task Submissions Handlers
  const handleSaveLearningModule = async (mod: LearningModule) => {
    setLearningModules((prev) => {
      const exists = prev.some((m) => m.id === mod.id);
      return exists ? prev.map((m) => (m.id === mod.id ? mod : m)) : [mod, ...prev];
    });
    await saveLearningModuleToFirestore(mod);
  };

  const handleDeleteLearningModule = async (id: string) => {
    setLearningModules((prev) => prev.filter((m) => m.id !== id));
    await deleteLearningModuleFromFirestore(id);
  };

  const handleSaveTaskSubmission = async (sub: TaskSubmission) => {
    setTaskSubmissions((prev) => {
      const exists = prev.some((s) => s.id === sub.id);
      return exists ? prev.map((s) => (s.id === sub.id ? sub : s)) : [sub, ...prev];
    });
    await saveTaskSubmissionToFirestore(sub);
  };

  const handleDeleteTaskSubmission = async (id: string) => {
    setTaskSubmissions((prev) => prev.filter((s) => s.id !== id));
    await deleteTaskSubmissionFromFirestore(id);
  };

  // Announcements Handlers
  const handleSaveAnnouncement = async (ann: LabAnnouncement) => {
    setAnnouncements((prev) => {
      const exists = prev.some((a) => a.id === ann.id);
      return exists ? prev.map((a) => (a.id === ann.id ? ann : a)) : [ann, ...prev];
    });
    await saveAnnouncementToFirestore(ann);
  };

  const handleDeleteAnnouncement = async (id: string) => {
    setAnnouncements((prev) => prev.filter((a) => a.id !== id));
    await deleteAnnouncementFromFirestore(id);
  };

  // Staff Roles Handlers
  const handleSaveStaffRole = async (entry: StaffRoleEntry) => {
    setStaffRoles((prev) => {
      const exists = prev.some((r) => r.email.toLowerCase() === entry.email.toLowerCase());
      return exists
        ? prev.map((r) => (r.email.toLowerCase() === entry.email.toLowerCase() ? entry : r))
        : [entry, ...prev];
    });
    await saveStaffRoleToFirestore(entry);
  };

  const handleDeleteStaffRole = async (email: string) => {
    setStaffRoles((prev) => prev.filter((r) => r.email.toLowerCase() !== email.toLowerCase()));
    await deleteStaffRoleFromFirestore(email);
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    if (!isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleNavigateTab = (tab: string) => {
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const isProgramPage =
    activeTab === 'kegiatan' ||
    activeTab === 'pembelajaran' ||
    activeTab === 'portofolio';

  const programPageTitle =
    activeTab === 'kegiatan'
      ? 'Agenda Kegiatan'
      : activeTab === 'pembelajaran'
      ? 'Materi Pembelajaran & Tugas'
      : 'Portofolio Karya Siswa';

  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark bg-[#080c16] text-slate-100' : 'bg-slate-900 text-slate-100'} flex flex-col font-sans transition-colors duration-200`}>
      
      {/* Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={handleNavigateTab}
        admin={admin}
        onOpenAdminModal={() => setAdminModalOpen(true)}
        onLogoutAdmin={handleLogoutAdmin}
        onOpenJoinModal={() => setJoinModalOpen(true)}
        isDarkMode={isDarkMode}
        onToggleTheme={toggleTheme}
      />

      {/* Main Content View Switcher */}
      <main className="flex-1">
        {/* Dedicated Sub-Page Header Bar for Kegiatan, Pembelajaran, & Portofolio */}
        {isProgramPage && (
          <div className="border-b border-cyan-900/30 bg-[#0b1120]/90">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
              {/* Breadcrumb */}
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <button
                  type="button"
                  onClick={() => handleNavigateTab('beranda')}
                  className="hover:text-cyan-300 flex items-center gap-1 transition-colors"
                >
                  <Home className="w-3.5 h-3.5" />
                  <span>Beranda</span>
                </button>
                <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
                <span className="text-slate-300">Kegiatan</span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
                <span className="text-cyan-300 font-semibold">{programPageTitle}</span>
              </div>

              {/* Quick Tab Switcher between the 3 Dedicated Pages */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="inline-flex p-1 rounded-xl bg-slate-950 border border-slate-800">
                  <button
                    type="button"
                    onClick={() => handleNavigateTab('kegiatan')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                      activeTab === 'kegiatan'
                        ? 'bg-cyan-500 text-slate-950 font-bold shadow'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Trophy className="w-3.5 h-3.5" />
                    <span>Kegiatan</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleNavigateTab('pembelajaran')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                      activeTab === 'pembelajaran'
                        ? 'bg-cyan-500 text-slate-950 font-bold shadow'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Pembelajaran</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleNavigateTab('portofolio')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                      activeTab === 'portofolio'
                        ? 'bg-cyan-500 text-slate-950 font-bold shadow'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <FolderGit2 className="w-3.5 h-3.5" />
                    <span>Portofolio</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => handleNavigateTab('beranda')}
                  className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-medium text-slate-300 hover:text-white flex items-center gap-1.5 transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Beranda</span>
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* BERANDA */}
        {activeTab === 'beranda' && (
          <>
            {/* Papan Pengumuman Cepat Lab */}
            <AnnouncementBanner
              admin={admin}
              announcements={announcements}
              onSaveAnnouncement={handleSaveAnnouncement}
              onDeleteAnnouncement={handleDeleteAnnouncement}
            />

            <HeroSection
              onExplorePortfolio={() => handleNavigateTab('portofolio')}
              onExploreModules={() => handleNavigateTab('pembelajaran')}
              onOpenJoinModal={() => setJoinModalOpen(true)}
            />

            {/* Compact Hub Directory linking to Dedicated Pages (Kegiatan, Pembelajaran, Portofolio) */}
            <section className="border-t border-cyan-900/20 bg-[#070b14]/80 py-14">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
                  <div>
                    <span className="text-xs font-mono uppercase tracking-wider text-cyan-400">
                      Direktori Halaman Program IT Club
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
                      Kegiatan, Pembelajaran &amp; Portofolio
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-400 mt-1">
                      Pilih halaman di bawah ini atau gunakan daftar menu <strong className="text-cyan-300">Kegiatan</strong> di bilah atas.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Card 1: Agenda Kegiatan */}
                  <button
                    type="button"
                    onClick={() => handleNavigateTab('kegiatan')}
                    className="group text-left p-5 rounded-2xl bg-[#0b1120] border border-slate-800 hover:border-cyan-500/50 transition-all shadow-xl flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-11 h-11 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                          <Trophy className="w-5 h-5" />
                        </div>
                        <span className="px-2.5 py-0.5 rounded text-[11px] font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-500/30">
                          {activityList.length} Agenda
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors">
                        Agenda &amp; Event Kegiatan
                      </h3>
                      <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                        Jadwal workshop, lomba internal, bootcamp, serta formulir pendaftaran kegiatan ke WhatsApp &amp; Email Pembina.
                      </p>
                    </div>
                    <div className="mt-5 pt-3.5 border-t border-slate-800/80 flex items-center justify-between text-xs font-bold text-cyan-400">
                      <span>Buka Kegiatan</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </button>

                  {/* Card 2: Pembelajaran */}
                  <button
                    type="button"
                    onClick={() => handleNavigateTab('pembelajaran')}
                    className="group text-left p-5 rounded-2xl bg-[#0b1120] border border-slate-800 hover:border-teal-500/50 transition-all shadow-xl flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-11 h-11 rounded-xl bg-teal-500/15 border border-teal-500/30 flex items-center justify-center text-teal-400">
                          <BookOpen className="w-5 h-5" />
                        </div>
                        <span className="px-2.5 py-0.5 rounded text-[11px] font-mono font-bold bg-teal-950 text-teal-300 border border-teal-500/30">
                          {learningModules.length} Modul
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-white group-hover:text-teal-300 transition-colors">
                        Pembelajaran &amp; Tugas
                      </h3>
                      <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                        Modul praktikum C# .NET, Python, Scratch, Desain, Robotika &amp; IoT beserta ruang pengumpulan tugas siswa.
                      </p>
                    </div>
                    <div className="mt-5 pt-3.5 border-t border-slate-800/80 flex items-center justify-between text-xs font-bold text-teal-400">
                      <span>Buka Pembelajaran</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </button>

                  {/* Card 3: Portofolio */}
                  <button
                    type="button"
                    onClick={() => handleNavigateTab('portofolio')}
                    className="group text-left p-5 rounded-2xl bg-[#0b1120] border border-slate-800 hover:border-violet-500/50 transition-all shadow-xl flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-11 h-11 rounded-xl bg-violet-500/15 border border-violet-500/30 flex items-center justify-center text-violet-400">
                          <FolderGit2 className="w-5 h-5" />
                        </div>
                        <span className="px-2.5 py-0.5 rounded text-[11px] font-mono font-bold bg-violet-950 text-violet-300 border border-violet-500/30">
                          {portfolioList.length} Karya
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-white group-hover:text-violet-300 transition-colors">
                        Galeri Portofolio Siswa
                      </h3>
                      <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                        Etalase karya aplikasi, game, desain, dan proyek IoT siswa lengkap dengan tautan langsung hasil proyek.
                      </p>
                    </div>
                    <div className="mt-5 pt-3.5 border-t border-slate-800/80 flex items-center justify-between text-xs font-bold text-violet-400">
                      <span>Buka Portofolio</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </button>
                </div>

                {/* Compact Live Attendance & Division Statistics on Beranda */}
                <div className="mt-10">
                  <AnalyticsSection
                    students={students}
                    attendanceRecords={attendanceRecords}
                    compact
                  />
                </div>
              </div>
            </section>
          </>
        )}

        {/* KEGIATAN (HALAMAN KHUSUS) */}
        {activeTab === 'kegiatan' && (
          <KegiatanSection
            admin={admin}
            activities={activityList}
            onAddActivity={handleAddActivity}
            onUpdateActivity={handleUpdateActivity}
            onDeleteActivity={handleDeleteActivity}
            onOpenAdminModal={() => setAdminModalOpen(true)}
            onOpenJoinModal={() => setJoinModalOpen(true)}
          />
        )}

        {/* PEMBELAJARAN & PENGUMPULAN TUGAS (HALAMAN KHUSUS) */}
        {activeTab === 'pembelajaran' && (
          <PembelajaranSection
            admin={admin}
            modules={learningModules}
            submissions={taskSubmissions}
            onSaveModule={handleSaveLearningModule}
            onDeleteModule={handleDeleteLearningModule}
            onSaveSubmission={handleSaveTaskSubmission}
            onDeleteSubmission={handleDeleteTaskSubmission}
            onNavigateToPenilaian={() => handleNavigateTab('penilaian')}
          />
        )}

        {/* PORTOFOLIO (HALAMAN KHUSUS) */}
        {activeTab === 'portofolio' && (
          <PortofolioSection
            admin={admin}
            portfolioList={portfolioList}
            onAddPortfolio={handleAddPortfolio}
            onUpdatePortfolio={handleUpdatePortfolio}
            onDeletePortfolio={handleDeletePortfolio}
            onOpenAdminModal={() => setAdminModalOpen(true)}
          />
        )}

        {/* JADWAL */}
        {activeTab === 'jadwal' && (
          <JadwalSection
            admin={admin}
            scheduleList={scheduleList}
            onAddSchedule={handleAddSchedule}
            onUpdateSchedule={handleUpdateSchedule}
            onDeleteSchedule={handleDeleteSchedule}
            onOpenAdminModal={() => setAdminModalOpen(true)}
          />
        )}

        {/* PENILAIAN & RAPOR WALI MURID (PUBLIC READ + GURU CRUD) */}
        {activeTab === 'penilaian' && (
          <PenilaianSection
            admin={admin}
            students={students}
            attendanceRecords={attendanceRecords}
            assessments={assessments}
            onAddAssessment={handleAddAssessment}
            onUpdateAssessment={handleUpdateAssessment}
            onDeleteAssessment={handleDeleteAssessment}
            onOpenAdminModal={() => setAdminModalOpen(true)}
            onOpenVerifyCert={() => {
              setVerifyCertInitialCode('');
              setVerifyCertModalOpen(true);
            }}
          />
        )}

        {/* ABSENSI QR & RFID (PROTECTED FOR GURU) */}
        {activeTab === 'absensi' && (
          <AbsensiSection
            admin={admin}
            students={students}
            attendanceRecords={attendanceRecords}
            onAddAttendance={handleAddAttendance}
            onResetAttendance={handleResetAttendance}
            onOpenAdminModal={() => setAdminModalOpen(true)}
          />
        )}

        {/* CETAK KARTU ANGGOTA (PROTECTED FOR GURU) */}
        {activeTab === 'kartu' && (
          <CardStudioSection
            admin={admin}
            students={students}
            onAddStudent={handleAddStudent}
            onUpdateStudent={handleUpdateStudent}
            onDeleteStudent={handleDeleteStudent}
            onOpenAdminModal={() => setAdminModalOpen(true)}
          />
        )}

        {/* DATA ANGGOTA (PROTECTED FOR GURU) */}
        {activeTab === 'anggota' && (
          <DataAnggotaSection
            admin={admin}
            students={students}
            onAddStudent={handleAddStudent}
            onUpdateStudent={handleUpdateStudent}
            onDeleteStudent={handleDeleteStudent}
            onOpenAdminModal={() => setAdminModalOpen(true)}
            onNavigateToCardStudio={() => {
              setActiveTab('kartu');
            }}
          />
        )}

      </main>

      {/* Footer */}
      <Footer
        setActiveTab={handleNavigateTab}
        onOpenAdminModal={() => setAdminModalOpen(true)}
        onOpenJoinModal={() => setJoinModalOpen(true)}
        coachEmail={coachContact.coachEmail || pembinaProfile.email}
        coachPhone={coachContact.coachWhatsapp || pembinaProfile.phone}
      />

      {/* Admin Login & Multi-Role Manager Modal */}
      <AdminLoginModal
        isOpen={adminModalOpen}
        onClose={() => setAdminModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
        pembinaProfile={pembinaProfile}
        currentAdmin={admin}
        staffRoles={staffRoles}
        onSaveStaffRole={handleSaveStaffRole}
        onDeleteStaffRole={handleDeleteStaffRole}
      />

      {/* Join Club Registration Modal */}
      <JoinClubModal
        isOpen={joinModalOpen}
        onClose={() => setJoinModalOpen(false)}
        onStudentRegistered={(newStd) => {
          handleAddStudent(newStd);
        }}
      />

      {/* QR E-Sertifikat Verification Modal */}
      <CertificateVerifyModal
        isOpen={verifyCertModalOpen}
        initialCode={verifyCertInitialCode}
        assessments={assessments}
        onClose={() => {
          setVerifyCertModalOpen(false);
          if (window.location.search.includes('verify=')) {
            window.history.replaceState({}, '', window.location.pathname);
          }
        }}
      />

      {/* PWA Offline Status Indicator */}
      <OfflineIndicator />

    </div>
  );
}
