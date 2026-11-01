import React, { useState, useEffect } from 'react';
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

import { 
  INITIAL_STUDENTS, 
  INITIAL_ATTENDANCE, 
  INITIAL_SCHEDULE, 
  INITIAL_PORTFOLIO, 
  INITIAL_MODULES, 
  INITIAL_ACTIVITIES 
} from './data/initialData';

import { 
  Student, 
  AttendanceRecord, 
  ScheduleItem, 
  PortfolioItem, 
  AdminUser 
} from './types';

import {
  validateFirestoreConnection,
  getOrSeedStudents,
  saveStudentToFirestore,
  deleteStudentFromFirestore,
  subscribeToStudents,
  getOrSeedAttendance,
  addAttendanceRecord,
  subscribeToAttendanceRecords,
  getOrSeedSchedules,
  saveScheduleToFirestore,
  deleteScheduleFromFirestore,
  subscribeToSchedules,
  getOrSeedPortfolios,
  savePortfolioToFirestore,
  deletePortfolioFromFirestore,
  subscribeToPortfolios,
} from './services/firebase';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('beranda');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);
  const [adminModalOpen, setAdminModalOpen] = useState<boolean>(false);
  const [joinModalOpen, setJoinModalOpen] = useState<boolean>(false);

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
      if (serverAttendance && serverAttendance.length > 0) {
        setAttendanceRecords(serverAttendance);
      }
    }).catch((err) => {
      console.warn('Firestore getOrSeedAttendance error:', err);
    });

    const unsubAttendance = subscribeToAttendanceRecords((liveRecords) => {
      if (liveRecords && liveRecords.length > 0) {
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

    return () => {
      unsubStudents();
      unsubAttendance();
      unsubSchedules();
      unsubPortfolios();
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

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    if (!isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark bg-[#080c16] text-slate-100' : 'bg-slate-900 text-slate-100'} flex flex-col font-sans transition-colors duration-200`}>
      
      {/* Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        admin={admin}
        onOpenAdminModal={() => setAdminModalOpen(true)}
        onLogoutAdmin={handleLogoutAdmin}
        onOpenJoinModal={() => setJoinModalOpen(true)}
        isDarkMode={isDarkMode}
        onToggleTheme={toggleTheme}
      />

      {/* Main Content View Switcher */}
      <main className="flex-1">
        
        {/* BERANDA */}
        {activeTab === 'beranda' && (
          <>
            <HeroSection
              onExplorePortfolio={() => setActiveTab('portofolio')}
              onExploreModules={() => setActiveTab('pembelajaran')}
              onOpenJoinModal={() => setJoinModalOpen(true)}
              onOpenRfidDemo={() => {
                if (admin.isAuthenticated) {
                  setActiveTab('absensi');
                } else {
                  setAdminModalOpen(true);
                }
              }}
            />

            {/* Quick Preview of Portfolio in Home */}
            <div className="border-t border-cyan-900/20 bg-[#070b14]/70">
              <PortofolioSection
                admin={admin}
                portfolioList={portfolioList.slice(0, 3)}
                onAddPortfolio={handleAddPortfolio}
                onUpdatePortfolio={handleUpdatePortfolio}
                onDeletePortfolio={handleDeletePortfolio}
                onOpenAdminModal={() => setAdminModalOpen(true)}
              />
            </div>

            {/* Quick Preview of Modules in Home */}
            <div className="border-t border-cyan-900/20 bg-[#080c16]">
              <PembelajaranSection modules={INITIAL_MODULES} />
            </div>

            {/* Quick Preview of Upcoming Activities in Home */}
            <div className="border-t border-cyan-900/20 bg-[#070b14]/70">
              <KegiatanSection
                activities={INITIAL_ACTIVITIES}
                onOpenJoinModal={() => setJoinModalOpen(true)}
              />
            </div>
          </>
        )}

        {/* KEGIATAN */}
        {activeTab === 'kegiatan' && (
          <KegiatanSection
            activities={INITIAL_ACTIVITIES}
            onOpenJoinModal={() => setJoinModalOpen(true)}
          />
        )}

        {/* PEMBELAJARAN */}
        {activeTab === 'pembelajaran' && (
          <PembelajaranSection modules={INITIAL_MODULES} />
        )}

        {/* PORTOFOLIO */}
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

        {/* ABSENSI QR & RFID (PROTECTED FOR GURU) */}
        {activeTab === 'absensi' && (
          <AbsensiSection
            admin={admin}
            students={students}
            attendanceRecords={attendanceRecords}
            onAddAttendance={handleAddAttendance}
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
        setActiveTab={setActiveTab}
        onOpenAdminModal={() => setAdminModalOpen(true)}
        onOpenJoinModal={() => setJoinModalOpen(true)}
      />

      {/* Admin Login Modal */}
      <AdminLoginModal
        isOpen={adminModalOpen}
        onClose={() => setAdminModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* Join Club Registration Modal */}
      <JoinClubModal
        isOpen={joinModalOpen}
        onClose={() => setJoinModalOpen(false)}
        onStudentRegistered={(newStd) => {
          handleAddStudent(newStd);
        }}
      />

    </div>
  );
}
