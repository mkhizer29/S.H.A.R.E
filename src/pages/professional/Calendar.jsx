import React, { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Video, Phone, MessageSquare, Clock, Calendar as CalendarIcon, Settings2, Trash2 } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Avatar from '../../components/ui/Avatar';
import JoinSessionButton from '../../components/JoinSessionButton';
import { useAuthStore } from '../../stores/authStore';
import { useBookingStore } from '../../stores/bookingStore';
import { useAvailabilityStore } from '../../stores/availabilityStore';

/* ─── Helpers ──────────────────────────────────────────────── */

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const HOUR_LABELS = ['8 AM', '9 AM', '10 AM', '11 AM', '12 PM', '1 PM', '2 PM', '3 PM', '4 PM', '5 PM', '6 PM'];
const GRID_START_HOUR = 8;   // 8 AM
const GRID_END_HOUR = 19;    // 7 PM (exclusive)
const HOUR_HEIGHT_REM = 5;   // rem per hour slot

/** Return the start of week (Sunday) for a given date */
const startOfWeek = (date) => {
  const d = new Date(date);
  d.setDate(d.getDate() - d.getDay());
  d.setHours(0, 0, 0, 0);
  return d;
};

/** Add N days to a date */
const addDays = (date, n) => {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
};

/** Check if two dates are the same calendar day */
const isSameDay = (a, b) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

/** Format date as "Apr 28" */
const shortDate = (d) => d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

/** Get session type icon */
const getTypeIcon = (type) => {
  const t = (type || '').toLowerCase();
  if (t.includes('video')) return <Video size={13} strokeWidth={2.5} />;
  if (t.includes('audio') || t.includes('phone') || t.includes('call')) return <Phone size={13} strokeWidth={2.5} />;
  if (t.includes('chat') || t.includes('message')) return <MessageSquare size={13} strokeWidth={2.5} />;
  return <Clock size={13} strokeWidth={2.5} />;
};

/* ─── Component ────────────────────────────────────────────── */

const Calendar = () => {
  const { user } = useAuthStore();
  const { sessions, loadBookings, isLoading } = useBookingStore();
  const { availabilities, loadAvailability, addAvailability, deleteAvailability } = useAvailabilityStore();
  const [weekOffset, setWeekOffset] = useState(0); // 0 = current week
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);

  useEffect(() => {
    if (user?.uid) {
      loadBookings(user.uid, 'professional');
      loadAvailability(user.uid);
    }
  }, [user?.uid, loadBookings, loadAvailability]);

  const now = new Date();

  /* ── Compute the 7 days of the current view week ── */
  const weekStart = useMemo(() => addDays(startOfWeek(now), weekOffset * 7), [weekOffset]);
  const weekDays = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)), [weekStart]);

  /* ── Title for header ── */
  const headerTitle = useMemo(() => {
    const first = weekDays[0];
    const last = weekDays[6];
    if (first.getMonth() === last.getMonth()) {
      return `${first.toLocaleDateString(undefined, { month: 'long' })} ${first.getFullYear()}`;
    }
    return `${shortDate(first)} – ${shortDate(last)}, ${last.getFullYear()}`;
  }, [weekDays]);

  /* ── Filter sessions that fall within this week ── */
  const weekSessions = useMemo(() => {
    const weekEnd = addDays(weekStart, 7);
    return sessions.filter(s => {
      if (!s.startsAt) return false;
      const d = new Date(s.startsAt);
      return d >= weekStart && d < weekEnd;
    });
  }, [sessions, weekStart]);

  /* ── Group sessions by day index (0-6) ── */
  const sessionsByDay = useMemo(() => {
    const map = {};
    weekSessions.forEach(s => {
      const d = new Date(s.startsAt);
      const dayIdx = d.getDay(); // 0=Sun
      if (!map[dayIdx]) map[dayIdx] = [];
      map[dayIdx].push(s);
    });
    return map;
  }, [weekSessions]);

  /* ── Today's sessions for the sidebar ── */
  const todaySessions = useMemo(() => {
    return sessions
      .filter(s => s.startsAt && isSameDay(new Date(s.startsAt), now) && s.status === 'upcoming')
      .sort((a, b) => new Date(a.startsAt) - new Date(b.startsAt));
  }, [sessions, now]);

  /* ── Stats ── */
  const upcomingCount = sessions.filter(s => s.status === 'upcoming').length;
  const thisWeekCount = weekSessions.filter(s => s.status === 'upcoming').length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* ─── Page Header ─── */}
      <motion.div 
        initial={{ opacity: 0, y: 16 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.4 }}
        className="flex justify-between items-end mb-2 px-1"
      >
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 tracking-tight">Calendar</h1>
          <p className="text-[15px] font-medium text-neutral-500 mt-2">
            {thisWeekCount} session{thisWeekCount !== 1 ? 's' : ''} this week · {todaySessions.length} today
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="primary" icon={<CalendarIcon size={13} />}>
            {upcomingCount} upcoming
          </Badge>
        </div>
      </motion.div>

      <div className="grid lg:grid-cols-[1fr_340px] gap-6">
        {/* ─── Main Weekly Grid ─── */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <div className="bg-surface rounded-[32px] border border-neutral-200 shadow-soft overflow-hidden">
            {/* Calendar Header */}
            <div className="p-6 md:p-8 border-b border-neutral-200 flex justify-between items-center bg-surface w-full">
              <div className="flex items-center gap-5">
                <h2 className="text-xl font-bold text-neutral-900 tracking-tight">{headerTitle}</h2>
                {weekOffset !== 0 && (
                  <button 
                    onClick={() => setWeekOffset(0)}
                    className="text-[13px] font-bold text-primary bg-primary-light px-3 py-1 rounded-full hover:bg-primary-light/80 transition-colors"
                  >
                    Back to today
                  </button>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setWeekOffset(o => o - 1)}
                  className="w-10 h-10 flex items-center justify-center border border-neutral-200 rounded-xl text-neutral-500 hover:text-primary hover:border-primary-light hover:bg-primary-light transition-all"
                >
                  <ChevronLeft size={20} />
                </button>
                <button 
                  onClick={() => setWeekOffset(0)}
                  className="px-5 py-2 text-[14px] font-bold border border-neutral-200 rounded-xl text-neutral-700 hover:text-primary hover:border-primary-light hover:bg-primary-light transition-all"
                >
                  Today
                </button>
                <button 
                  onClick={() => setWeekOffset(o => o + 1)}
                  className="w-10 h-10 flex items-center justify-center border border-neutral-200 rounded-xl text-neutral-500 hover:text-primary hover:border-primary-light hover:bg-primary-light transition-all"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>

            {/* Weekly View */}
            <div className="flex flex-col min-w-[700px] overflow-x-auto">
              {/* Day Headers */}
              <div className="grid grid-cols-8 border-b border-neutral-200 bg-surface-tinted">
                <div className="col-span-1 border-r border-neutral-200 p-4 text-center text-[11px] font-bold text-neutral-400 uppercase tracking-wider flex items-center justify-center">
                  {Intl.DateTimeFormat().resolvedOptions().timeZone.split('/').pop().replace('_', ' ')}
                </div>
                {weekDays.map((day, idx) => {
                  const isToday = isSameDay(day, now);
                  return (
                    <div key={idx} className={`col-span-1 border-r border-neutral-200 py-3 flex flex-col items-center justify-center transition-colors ${isToday ? 'bg-primary/5' : ''}`}>
                      <p className={`text-[10px] font-bold tracking-wider uppercase mb-1.5 ${isToday ? 'text-primary' : 'text-neutral-400'}`}>
                        {DAY_LABELS[day.getDay()]}
                      </p>
                      <div className={`w-8 h-8 flex items-center justify-center rounded-full text-[17px] font-bold tracking-tight ${isToday ? 'bg-primary text-white shadow-md shadow-primary/30' : 'text-neutral-800'}`}>
                        {day.getDate()}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Time Grid */}
              {isLoading ? (
                <div className="flex items-center justify-center py-24 bg-surface">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                    <p className="text-neutral-400 font-medium text-sm animate-pulse">Loading schedule…</p>
                  </div>
                </div>
              ) : (
                <div className="relative overflow-y-auto bg-surface text-neutral-900" style={{ height: '560px' }}>
                  <div className="grid grid-cols-8" style={{ height: `${HOUR_LABELS.length * HOUR_HEIGHT_REM}rem` }}>
                    {/* Time labels */}
                    <div className="col-span-1 border-r border-neutral-200 bg-surface-tinted">
                      {HOUR_LABELS.map(time => (
                        <div key={time} className="relative border-b border-dashed border-neutral-200/80" style={{ height: `${HOUR_HEIGHT_REM}rem` }}>
                          <div className="absolute -top-[14px] right-2 z-10">
                            <span className="bg-white border border-neutral-200 text-neutral-500 text-[9px] font-bold px-2 py-1 rounded-lg shadow-sm whitespace-nowrap tracking-tight">
                              {time}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Day columns */}
                    {weekDays.map((day, dIdx) => {
                      const isToday = isSameDay(day, now);
                      const dayIdx = day.getDay();
                      const daySessions = sessionsByDay[dayIdx] || [];
                      const dayAvailabilities = availabilities.filter(a => Number(a.dayOfWeek) === dayIdx && a.isActive);

                      return (
                        <div key={dIdx} className={`col-span-1 border-r border-neutral-200 relative ${isToday ? 'bg-primary-light/5' : ''}`}>
                          {/* Grid lines */}
                          {HOUR_LABELS.map((_, i) => (
                            <div key={i} className="border-b border-dashed border-neutral-200/60" style={{ height: `${HOUR_HEIGHT_REM}rem` }} />
                          ))}

                          {/* Render availability blocks (background) */}
                          {dayAvailabilities.map((avail, aIdx) => {
                            const [startH, startM] = avail.startTime.split(':').map(Number);
                            const [endH, endM] = avail.endTime.split(':').map(Number);
                            
                            const startMin8 = (startH - GRID_START_HOUR) * 60 + startM;
                            const endMin8 = (endH - GRID_START_HOUR) * 60 + endM;
                            
                            if (startMin8 < 0 || startH >= GRID_END_HOUR) return null;

                            const topRem = (startMin8 / 60) * HOUR_HEIGHT_REM;
                            const durationMin = endMin8 - startMin8;
                            const heightRem = (durationMin / 60) * HOUR_HEIGHT_REM;

                            const formatTime = (h, m) => {
                              const period = h >= 12 ? 'PM' : 'AM';
                              const hour12 = h % 12 || 12;
                              const min = m < 10 ? `0${m}` : m;
                              return `${hour12}:${min} ${period}`;
                            };
                            const timeString = `${formatTime(startH, startM)} - ${formatTime(endH, endM)}`;

                             // Check if this specific availability block is occupied by any session
                             const isOccupied = daySessions.some(s => {
                               const sStart = new Date(s.startsAt);
                               const sEnd = new Date(sStart.getTime() + (s.durationMinutes || 50) * 60000);
                               const aStart = new Date(day);
                               aStart.setHours(startH, startM, 0, 0);
                               const aEnd = new Date(day);
                               aEnd.setHours(endH, endM, 0, 0);
                               
                               return (sStart < aEnd && sEnd > aStart);
                             });

                             return (
                               <div
                                 key={avail.id || aIdx}
                                 className={`absolute left-1 right-1 rounded-2xl z-0 pointer-events-none flex flex-col items-center justify-center overflow-hidden border border-dashed transition-opacity
                                   ${isOccupied ? 'border-neutral-300 opacity-40 bg-neutral-100' : 'border-primary/20 bg-primary-light/5'}`}
                                 style={{ 
                                   top: `${topRem}rem`, 
                                   height: `${Math.max(heightRem, 1)}rem`
                                 }}
                               >
                                 {heightRem >= 2 && (
                                   <div className="flex flex-col items-center opacity-30">
                                     <span className="text-[9px] font-bold text-neutral-600 tracking-widest uppercase">
                                       {isOccupied ? 'Occupied' : timeString}
                                     </span>
                                   </div>
                                 )}
                               </div>
                             );
                          })}

                          {/* Current time indicator */}
                          {isToday && (() => {
                            const minutesSince8 = (now.getHours() - GRID_START_HOUR) * 60 + now.getMinutes();
                            if (minutesSince8 < 0 || minutesSince8 > (GRID_END_HOUR - GRID_START_HOUR) * 60) return null;
                            const topPx = (minutesSince8 / 60) * HOUR_HEIGHT_REM;
                            return (
                              <div className="absolute left-0 right-0 z-20 pointer-events-none" style={{ top: `${topPx}rem` }}>
                                <div className="flex items-center">
                                  <div className="w-2.5 h-2.5 bg-alert rounded-full -ml-1 shadow-md" />
                                  <div className="flex-1 h-[2px] bg-alert/60" />
                                </div>
                              </div>
                            );
                          })()}

                          {/* Render real sessions */}
                          {daySessions.map((session, eIdx) => {
                            const start = new Date(session.startsAt);
                            const hour = start.getHours();
                            const minute = start.getMinutes();
                            const minutesSince8 = (hour - GRID_START_HOUR) * 60 + minute;
                            
                            // Skip sessions outside grid range
                            if (minutesSince8 < 0 || hour >= GRID_END_HOUR) return null;

                            const topRem = (minutesSince8 / 60) * HOUR_HEIGHT_REM;
                            const durationMin = session.durationMinutes || 50;
                            const heightRem = (durationMin / 60) * HOUR_HEIGHT_REM;
                            const isCancelled = session.status === 'cancelled';

                            return (
                              <div
                                key={session.id || eIdx}
                                className={`absolute left-1.5 right-1.5 rounded-2xl shadow-float z-10 transition-all cursor-pointer border group
                                  ${isCancelled 
                                    ? 'bg-neutral-100 border-neutral-200 opacity-50' 
                                    : 'bg-primary text-white border-primary-hover border-b-2 hover:-translate-y-0.5 hover:shadow-lg'
                                  }`}
                                style={{ top: `${topRem}rem`, height: `${Math.max(heightRem, 3)}rem` }}
                                title={`${session.patientAlias || 'Client'} – ${session.type || 'Session'}`}
                              >
                                <div className="p-2.5 h-full flex flex-col justify-between overflow-hidden">
                                  <div className="flex items-center gap-1 text-[10px] font-bold tracking-wide opacity-80">
                                    {getTypeIcon(session.type)}
                                    <span>
                                      {start.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                                    </span>
                                  </div>
                                  <p className="font-bold text-[12px] truncate leading-tight mt-0.5">
                                    {session.patientAlias || 'Client'}
                                  </p>
                                  {isCancelled && (
                                    <span className="text-[10px] font-bold text-alert">Cancelled</span>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* ─── Right Sidebar ─── */}
        <div className="space-y-6">
          {/* Today's Sessions Detail */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <Card hover={false} className="p-6">
              <h3 className="text-lg font-bold text-neutral-900 tracking-tight mb-1">Today's Sessions</h3>
              <p className="text-[13px] font-medium text-neutral-400 mb-5">
                {now.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
              </p>

              {isLoading ? (
                <div className="py-8 flex flex-col items-center gap-3">
                  <div className="w-8 h-8 border-3 border-primary/20 border-t-primary rounded-full animate-spin" />
                </div>
              ) : todaySessions.length === 0 ? (
                <div className="py-10 text-center bg-surface-tinted rounded-2xl border border-dashed border-neutral-200">
                  <CalendarIcon size={28} className="text-neutral-300 mx-auto mb-3" />
                  <p className="text-neutral-500 font-medium text-sm">No sessions today</p>
                  <p className="text-neutral-400 text-[12px] mt-1">Enjoy your free time!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {todaySessions.map((session) => {
                    const start = new Date(session.startsAt);
                    return (
                      <div key={session.id} className="flex items-start gap-3 p-3.5 rounded-2xl bg-surface-tinted border border-neutral-100 hover:border-primary-light transition-colors group">
                        <Avatar name={session.patientAlias || 'Client'} size="sm" />
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-[14px] text-neutral-900 truncate">{session.patientAlias || 'Client'}</p>
                          <div className="flex items-center gap-1.5 text-[12px] font-medium text-neutral-500 mt-0.5">
                            {getTypeIcon(session.type)}
                            <span>{start.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</span>
                            {session.type && <span className="text-neutral-300">·</span>}
                            {session.type && <span className="capitalize">{session.type}</span>}
                          </div>
                          <div className="mt-2">
                            <JoinSessionButton
                              startsAt={session.startsAt}
                              sessionId={session.id}
                              role="professional"
                              size="sm"
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          </motion.div>

          {/* Availability */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            <Card hover={false} className="p-6 relative overflow-hidden group">
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-accent/5 rounded-full blur-2xl pointer-events-none group-hover:bg-accent/10 transition-colors duration-500" />
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-5">
                  <div className="p-2.5 bg-accent-light/40 rounded-xl border border-accent/10">
                    <Settings2 size={18} className="text-accent" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-neutral-900 tracking-tight">Availability</h3>
                    <p className="text-[12px] font-medium text-neutral-400">Manage working hours</p>
                  </div>
                </div>
                <div className="py-6 px-4 text-center bg-gradient-to-b from-surface-tinted to-surface rounded-2xl border border-neutral-200/60 shadow-inner-soft">
                  <p className="text-neutral-500 font-medium text-sm mb-4">
                    {availabilities.length} active schedule rule{availabilities.length !== 1 ? 's' : ''}
                  </p>
                  <Button variant="primary" size="md" className="w-full justify-center shadow-md hover:shadow-lg transition-shadow" onClick={() => setIsManageModalOpen(true)}>
                    Manage Schedule
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* Manage Availability Modal */}
      <ManageAvailabilityModal 
        isOpen={isManageModalOpen} 
        onClose={() => setIsManageModalOpen(false)} 
        availabilities={availabilities}
        onAdd={addAvailability}
        onDelete={deleteAvailability}
        professionalId={user?.uid}
      />
    </div>
  );
};

const ManageAvailabilityModal = ({ isOpen, onClose, availabilities, onAdd, onDelete, professionalId }) => {
  const [dayOfWeek, setDayOfWeek] = useState(1);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');
  const [slotDuration, setSlotDuration] = useState(50);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleAdd = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onAdd({
        professionalId,
        dayOfWeek: Number(dayOfWeek),
        startTime,
        endTime,
        slotDuration: Number(slotDuration),
        breakMinutes: 10,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        isActive: true
      });
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1A1A1A]/40 backdrop-blur-sm p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }} 
        animate={{ opacity: 1, scale: 1 }} 
        className="bg-surface rounded-3xl shadow-float max-w-lg w-full overflow-hidden border border-neutral-200"
      >
        <div className="px-6 py-5 border-b border-neutral-200 bg-surface-tinted flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-neutral-900 tracking-tight">Manage Availability</h2>
            <p className="text-sm font-medium text-neutral-500">Define your weekly recurring schedule</p>
          </div>
          <button onClick={onClose} className="p-2 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 rounded-full transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        <div className="p-6 max-h-[60vh] overflow-y-auto space-y-6">
          <form onSubmit={handleAdd} className="space-y-4 bg-surface-tinted p-5 rounded-2xl border border-neutral-200">
            <h3 className="text-sm font-bold text-neutral-900 tracking-wider uppercase mb-2">Add New Rule</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-xs font-bold text-neutral-500 mb-1.5 uppercase">Day of Week</label>
                <select 
                  value={dayOfWeek} 
                  onChange={(e) => setDayOfWeek(e.target.value)}
                  className="w-full bg-surface border border-neutral-200 rounded-xl px-4 py-2.5 text-sm font-medium text-neutral-900 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                >
                  {DAY_LABELS.map((day, idx) => (
                    <option key={idx} value={idx}>{day}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-neutral-500 mb-1.5 uppercase">Start Time</label>
                <input 
                  type="time" 
                  value={startTime} 
                  onChange={(e) => setStartTime(e.target.value)}
                  required
                  className="w-full bg-surface border border-neutral-200 rounded-xl px-4 py-2.5 text-sm font-medium text-neutral-900 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-neutral-500 mb-1.5 uppercase">End Time</label>
                <input 
                  type="time" 
                  value={endTime} 
                  onChange={(e) => setEndTime(e.target.value)}
                  required
                  className="w-full bg-surface border border-neutral-200 rounded-xl px-4 py-2.5 text-sm font-medium text-neutral-900 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-bold text-neutral-500 mb-1.5 uppercase">Slot Duration (mins)</label>
                <input 
                  type="number" 
                  min="15" 
                  step="5"
                  value={slotDuration} 
                  onChange={(e) => setSlotDuration(e.target.value)}
                  required
                  className="w-full bg-surface border border-neutral-200 rounded-xl px-4 py-2.5 text-sm font-medium text-neutral-900 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>
            </div>
            <Button type="submit" variant="primary" className="w-full justify-center mt-2" disabled={isSubmitting}>
              {isSubmitting ? 'Adding...' : 'Add Rule'}
            </Button>
          </form>

          <div>
            <h3 className="text-sm font-bold text-neutral-900 tracking-wider uppercase mb-3">Current Rules</h3>
            {availabilities.length === 0 ? (
              <p className="text-sm font-medium text-neutral-500 text-center py-4">No availability rules set yet.</p>
            ) : (
              <div className="space-y-2">
                {availabilities.sort((a, b) => a.dayOfWeek - b.dayOfWeek).map((avail) => (
                  <div key={avail.id} className="flex items-center justify-between p-3.5 bg-surface border border-neutral-200 rounded-xl hover:border-primary-light transition-colors">
                    <div>
                      <p className="text-[14px] font-bold text-neutral-900">
                        {DAY_LABELS[avail.dayOfWeek]} <span className="text-neutral-400 font-medium">·</span> {avail.startTime} - {avail.endTime}
                      </p>
                      <p className="text-[12px] font-medium text-neutral-500 mt-0.5">
                        {avail.slotDuration}m slots · {avail.breakMinutes}m break
                      </p>
                    </div>
                    <button 
                      onClick={() => onDelete(avail.id)}
                      className="p-2 text-neutral-400 hover:text-alert-coral hover:bg-alert-coral-light/50 rounded-lg transition-all"
                      title="Delete Rule"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Calendar;
