import React, { useState } from 'react';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  User, 
  Plus, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  ShieldAlert, 
  Lock,
  Layers,
  Sparkles,
  X
} from 'lucide-react';
import { ScheduleItem, DayOfWeek, AdminUser } from '../types';

interface JadwalSectionProps {
  admin: AdminUser;
  scheduleList: ScheduleItem[];
  onAddSchedule: (item: ScheduleItem) => void;
  onUpdateSchedule: (item: ScheduleItem) => void;
  onDeleteSchedule: (id: string) => void;
  onOpenAdminModal: () => void;
}

export const JadwalSection: React.FC<JadwalSectionProps> = ({
  admin,
  scheduleList,
  onAddSchedule,
  onUpdateSchedule,
  onDeleteSchedule,
  onOpenAdminModal,
}) => {
  const [selectedDay, setSelectedDay] = useState<DayOfWeek>('Senin');
  const [selectedRoom, setSelectedRoom] = useState<string>('Semua');
  const [editingItem, setEditingItem] = useState<ScheduleItem | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // New / Edit Form state
  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState<ScheduleItem['category']>('IT Club');
  const [formDay, setFormDay] = useState<DayOfWeek>('Senin');
  const [formStartTime, setFormStartTime] = useState('13:30');
  const [formEndTime, setFormEndTime] = useState('15:30');
  const [formInstructor, setFormInstructor] = useState('Dwi Ambal Aziz, S.Kom');
  const [formRoom, setFormRoom] = useState<ScheduleItem['room']>('Lab Komputer');
  const [formCapacity, setFormCapacity] = useState(36);
  const [formDesc, setFormDesc] = useState('');

  const days: DayOfWeek[] = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const rooms = [
    'Semua',
    'Lab Komputer',
    
  ];

  const filteredSchedule = scheduleList.filter((item) => {
    const matchDay = item.day === selectedDay;
    const matchRoom = selectedRoom === 'Semua' || item.room === selectedRoom;
    return matchDay && matchRoom;
  });

  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormTitle('');
    setFormCategory('IT Club');
    setFormDay(selectedDay);
    setFormStartTime('13:30');
    setFormEndTime('15:30');
    setFormInstructor('Dwi Ambal Aziz, S.Kom');
    setFormRoom('Lab Komputer');
    setFormCapacity(36);
    setFormDesc('');
    setShowAddModal(true);
  };

  const handleOpenEdit = (item: ScheduleItem) => {
    setEditingItem(item);
    setFormTitle(item.title);
    setFormCategory(item.category);
    setFormDay(item.day);
    setFormStartTime(item.startTime);
    setFormEndTime(item.endTime);
    setFormInstructor(item.instructor);
    setFormRoom(item.room);
    setFormCapacity(item.capacity);
    setFormDesc(item.description);
    setShowAddModal(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    if (editingItem) {
      onUpdateSchedule({
        ...editingItem,
        title: formTitle,
        category: formCategory,
        day: formDay,
        startTime: formStartTime,
        endTime: formEndTime,
        instructor: formInstructor,
        room: formRoom,
        capacity: Number(formCapacity),
        description: formDesc,
      });
    } else {
      const newItem: ScheduleItem = {
        id: `sch-${Date.now()}`,
        title: formTitle,
        category: formCategory,
        day: formDay,
        startTime: formStartTime,
        endTime: formEndTime,
        instructor: formInstructor,
        room: formRoom,
        capacity: Number(formCapacity),
        description: formDesc,
      };
      onAddSchedule(newItem);
    }

    setShowAddModal(false);
  };

  return (
    <section className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs uppercase tracking-wider mb-2">
            <CalendarIcon className="w-4 h-4" />
            <span>Manajemen Penggunaan Fasilitas</span>
          </div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">
            Jadwal Laboratorium &amp; IT Club
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Alokasi jam praktikum kelas reguler, sesi club sepulang sekolah, serta slot maintenance hardware.
          </p>
        </div>

        {/* Teacher Role Status / Action */}
        <div className="flex items-center gap-3">
          {admin.isAuthenticated ? (
            <button
              onClick={handleOpenAdd}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-teal-400 to-cyan-400 text-slate-950 text-xs font-bold hover:opacity-95 shadow-md shadow-cyan-500/20"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Jadwal Sesi</span>
            </button>
          ) : (
            <button
              onClick={onOpenAdminModal}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 border border-violet-500/30 text-xs font-medium text-violet-300 hover:text-white transition-all"
            >
              <Lock className="w-3.5 h-3.5 text-amber-400" />
              <span>Login Guru untuk Mengedit Jadwal</span>
            </button>
          )}
        </div>
      </div>

      {/* Filters: Day Selector & Room Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 bg-[#0b1120] p-3 rounded-2xl border border-slate-800">
        
        {/* Days segmented control */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
          {days.map((day) => {
            const isSelected = selectedDay === day;
            return (
              <button
                key={day}
                onClick={() => setSelectedDay(day)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  isSelected
                    ? 'bg-gradient-to-r from-cyan-500 to-teal-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                {day}
              </button>
            );
          })}
        </div>

        {/* Room select */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 shrink-0">Filter Ruang:</span>
          <select
            value={selectedRoom}
            onChange={(e) => setSelectedRoom(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-cyan-400"
          >
            {rooms.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>

      </div>

      {/* Schedule Cards Grid */}
      {filteredSchedule.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-[#0b1120]/60 border border-dashed border-slate-800">
          <CalendarIcon className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h4 className="text-base font-semibold text-white">Tidak ada sesi jadwal pada hari {selectedDay}</h4>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Laboratorium dalam status standby bebas atau dapat dipesan untuk sesi workshop tambahan.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSchedule.map((item) => {
            const isItClub = item.category === 'IT Club';
            const isReguler = item.category === 'Kelas Reguler';
            const isMaint = item.category === 'Maintenance';

            return (
              <div
                key={item.id}
                className="relative rounded-2xl bg-[#0b1120] border border-slate-800 hover:border-cyan-500/40 p-5 shadow-lg transition-all flex flex-col justify-between group"
              >
                <div>
                  
                  {/* Category & Room Badge */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span
                      className={`px-2.5 py-0.5 rounded-md text-[11px] font-mono font-bold ${
                        isItClub
                          ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/30'
                          : isReguler
                          ? 'bg-violet-950 text-violet-300 border border-violet-500/30'
                          : isMaint
                          ? 'bg-amber-950 text-amber-300 border border-amber-500/30'
                          : 'bg-teal-950 text-teal-300 border border-teal-500/30'
                      }`}
                    >
                      {item.category}
                    </span>

                    <span className="text-[11px] text-slate-400 font-mono">
                      Kapasitas: {item.capacity} PC
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-base font-bold text-white mb-2 group-hover:text-cyan-300 transition-colors">
                    {item.title}
                  </h3>

                  {/* Description */}
                  <p className="text-xs text-slate-400 leading-relaxed mb-4">
                    {item.description}
                  </p>
                </div>

                {/* Footer details */}
                <div className="space-y-2 pt-3 border-t border-slate-800/80 text-xs text-slate-300">
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span className="font-mono text-cyan-200">
                      {item.startTime} - {item.endTime} WIB
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                    <span className="truncate">{item.room}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <User className="w-3.5 h-3.5 text-violet-400 shrink-0" />
                    <span className="truncate">{item.instructor}</span>
                  </div>

                  {/* Admin Edit/Delete Actions */}
                  {admin.isAuthenticated && (
                    <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-800">
                      <button
                        onClick={() => handleOpenEdit(item)}
                        className="p-1.5 rounded-lg bg-slate-900 hover:bg-cyan-950 text-slate-300 hover:text-cyan-300 transition-colors"
                        title="Edit Sesi Ini"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDeleteSchedule(item.id)}
                        className="p-1.5 rounded-lg bg-slate-900 hover:bg-red-950 text-slate-300 hover:text-red-400 transition-colors"
                        title="Hapus Sesi Ini"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL: ADD / EDIT SCHEDULE */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="relative w-full max-w-lg rounded-2xl bg-[#0b1120] border border-cyan-500/40 p-6 sm:p-8 shadow-2xl">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-bold text-white mb-1">
              {editingItem ? 'Edit Sesi Jadwal Lab' : 'Tambah Sesi Jadwal Baru'}
            </h3>
            <p className="text-xs text-slate-400 mb-6">
              Diatur oleh Instruktur Guru: {admin.name}
            </p>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Nama Kegiatan / Topik Sesi
                </label>
                <input
                  type="text"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="Contoh: Praktikum C# Windows Forms & Database"
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Hari
                  </label>
                  <select
                    value={formDay}
                    onChange={(e) => setFormDay(e.target.value as DayOfWeek)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-400"
                  >
                    {days.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Kategori
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as ScheduleItem['category'])}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-400"
                  >
                    <option value="IT Club">IT Club</option>
                    <option value="Kelas Reguler">Kelas Reguler</option>
                    <option value="Praktikum">Praktikum</option>
                    <option value="Workshop">Workshop</option>
                    <option value="Maintenance">Maintenance</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Jam Mulai
                  </label>
                  <input
                    type="time"
                    value={formStartTime}
                    onChange={(e) => setFormStartTime(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-400 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Jam Selesai
                  </label>
                  <input
                    type="time"
                    value={formEndTime}
                    onChange={(e) => setFormEndTime(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-400 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Ruang Lab
                  </label>
                  <select
                    value={formRoom}
                    onChange={(e) => setFormRoom(e.target.value as ScheduleItem['room'])}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-400"
                  >
                    <option value="Lab Komputer">Lab Komputer</option>
                    <option value="Lab Komputer 1 (Utama)">Lab Komputer 1 (Utama)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Instruktur / Pengajar
                  </label>
                  <input
                    type="text"
                    value={formInstructor}
                    onChange={(e) => setFormInstructor(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Deskripsi Singkat Materi
                </label>
                <textarea
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  rows={2}
                  placeholder="Keterangan materi, software yang digunakan..."
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-teal-400 to-cyan-400 text-slate-950 text-xs font-bold hover:opacity-95 shadow-md shadow-cyan-500/20"
                >
                  {editingItem ? 'Simpan Perubahan' : 'Terbitkan Jadwal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </section>
  );
};
