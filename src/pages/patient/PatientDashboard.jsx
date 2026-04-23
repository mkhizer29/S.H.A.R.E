import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Calendar, MessageSquare, Users, TrendingUp, ChevronRight, Clock, Sparkles, Shield } from 'lucide-react'
import { useAuthStore } from '../../stores/authStore'
import { useMoodStore } from '../../stores/moodStore'
import { useBookingStore } from '../../stores/bookingStore'
import { useChatStore } from '../../stores/chatStore'
import MoodCheckIn from '../../components/MoodCheckIn'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Avatar from '../../components/ui/Avatar'
import JoinSessionButton from '../../components/JoinSessionButton'

const MOOD_EMOJIS = { 1: '😔', 2: '😟', 3: '😐', 4: '🙂', 5: '😊' }
const MOOD_COLORS = { 1: 'text-alert', 2: 'text-orange-400', 3: 'text-neutral-500', 4: 'text-primary', 5: 'text-primary-hover' }

export default function PatientDashboard() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { openModal, checkedToday, todayScore, getWeeklyAverage, history } = useMoodStore()
  const { sessions, loadBookings, isLoading } = useBookingStore()
  const { conversations } = useChatStore()

  const upcoming = sessions.filter((s) => s.status === 'upcoming').slice(0, 2)
  const unreadCount = conversations.reduce((sum, c) => sum + c.unread, 0)
  const weeklyAvg = getWeeklyAverage()
  const recentMoods = history.slice(-7)

  useEffect(() => {
    if (user?.uid) {
      loadBookings(user.uid)
    }
  }, [user?.uid, loadBookings])

  useEffect(() => {
    if (!checkedToday) {
      const timer = setTimeout(() => openModal(), 800)
      return () => clearTimeout(timer)
    }
  }, [checkedToday, openModal])

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      <MoodCheckIn />

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="space-y-1">
        <p className="text-neutral-500 text-[15px] font-medium">Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'} 👋</p>
        <h1 className="text-3xl font-bold text-neutral-900 tracking-tight">{user?.alias || 'WillowDream'}</h1>
        <p className="text-neutral-500 text-[15px]">Here's your wellbeing overview for today.</p>
      </motion.div>

      {/* Mood prompt (if not done) */}
      {!checkedToday && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          onClick={openModal}
          className="p-5 bg-gradient-to-r from-primary to-primary-hover rounded-[24px] shadow-float flex items-center gap-4 cursor-pointer group hover:-translate-y-1 transition-transform"
        >
          <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center">
            <Sparkles size={24} className="text-white" />
          </div>
          <div className="flex-1">
            <p className="text-white font-semibold text-lg">How are you feeling today?</p>
            <p className="text-primary-light text-sm font-medium">Take 5 seconds for your daily mood check-in</p>
          </div>
          <ChevronRight size={24} className="text-white/60 group-hover:translate-x-1 transition-transform" />
        </motion.div>
      )}

      {/* Stats strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Mood Today', value: checkedToday ? MOOD_EMOJIS[todayScore] : '—', sub: checkedToday ? ['Very Low','Low','Okay','Good','Great'][todayScore-1] : 'Not checked', color: checkedToday ? MOOD_COLORS[todayScore] : 'text-neutral-400' },
          { label: 'Weekly Avg', value: weeklyAvg, sub: 'out of 5.0', color: 'text-primary' },
          { label: 'Upcoming', value: upcoming.length, sub: upcoming.length === 1 ? 'session' : 'sessions', color: 'text-primary' },
          { label: 'Unread', value: unreadCount, sub: unreadCount === 1 ? 'message' : 'messages', color: unreadCount > 0 ? 'text-alert' : 'text-neutral-400' },
        ].map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.08 }}
          >
            <Card hover={true} className="p-5 flex flex-col justify-center h-full">
              <p className="text-[13px] font-semibold text-neutral-500 uppercase tracking-wider mb-1">{s.label}</p>
              <p className={`text-3xl font-bold ${s.color} mb-1`}>{s.value}</p>
              <p className="text-[13px] font-medium text-neutral-500">{s.sub}</p>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Upcoming sessions */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.2 }} className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xl font-bold text-neutral-900 tracking-tight">Upcoming Sessions</h2>
            <button onClick={() => navigate('/patient/bookings')} className="text-[14px] font-semibold text-primary hover:text-primary-hover transition-colors">View all →</button>
          </div>
          {upcoming.length === 0 ? (
            <Card hover={false} className="p-8 text-center bg-surface-tinted border-dashed">
              {isLoading ? (
                <div className="py-4 flex flex-col items-center gap-3">
                  <div className="w-8 h-8 border-3 border-primary/30 border-t-primary rounded-full animate-spin" />
                  <p className="text-sm font-medium text-neutral-400 animate-pulse">Syncing sessions...</p>
                </div>
              ) : (
                <>
                  <Calendar size={36} className="text-neutral-400 mx-auto mb-4" />
                  <p className="text-[15px] font-medium text-neutral-500">No upcoming sessions</p>
                  <Button variant="primary" size="md" className="mt-6 font-semibold" onClick={() => navigate('/patient/directory')}>Find a Professional</Button>
                </>
              )}
            </Card>
          ) : (
            <div className="space-y-4">
              {upcoming.map((s) => (
                <Card key={s.id} className="p-5">
                  <div className="flex items-center gap-4">
                    <Avatar name={s.proName} size="md" />
                    <div className="flex-1 min-w-0">
                      <p className="text-[16px] font-semibold text-neutral-900 truncate">{s.proName}</p>
                      <p className="text-[14px] font-medium text-neutral-500">{s.proSpecialty}</p>
                    </div>
                    <Badge variant="primary">{s.type}</Badge>
                  </div>
                  <div className="flex items-center justify-between mt-4 bg-surface-tinted p-3 rounded-xl">
                    <div className="flex items-center gap-2 text-[14px] font-medium text-neutral-500">
                      <Clock size={16} className="text-primary" />
                      <span>
                        {new Date(s.startsAt).toLocaleDateString([], { month: 'short', day: 'numeric' })} at {' '}
                        {new Date(s.startsAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <JoinSessionButton 
                      startsAt={s.startsAt} 
                      sessionId={s.id} 
                      role="patient"
                      size="sm"
                    />
                  </div>
                </Card>
              ))}
            </div>
          )}
        </motion.div>

        {/* Recent messages */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.25 }} className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xl font-bold text-neutral-900 tracking-tight">Recent Messages</h2>
            <button onClick={() => navigate('/patient/chat')} className="text-[14px] font-semibold text-primary hover:text-primary-hover transition-colors">View all →</button>
          </div>
          <div className="space-y-4">
            {conversations.slice(0, 3).map((conv) => (
              <Card key={conv.id} className="p-5 cursor-pointer" onClick={() => navigate('/patient/chat')}>
                <div className="flex items-start gap-4">
                  <Avatar name={conv.proName} size="md" />
                  <div className="flex-1 min-w-0 pt-0.5">
                    <div className="flex justify-between items-center mb-1.5">
                      <p className="text-[15px] font-bold text-neutral-900 truncate">{conv.proName}</p>
                      <span className="text-[12px] font-semibold text-neutral-400 flex-shrink-0 ml-2">{conv.lastTime}</span>
                    </div>
                    <p className="text-[14px] font-medium text-neutral-500 truncate">{conv.lastMessage}</p>
                  </div>
                  {conv.unread > 0 && (
                    <span className="w-6 h-6 bg-alert rounded-full text-white text-[12px] font-bold flex items-center justify-center flex-shrink-0 shadow-sm">
                      {conv.unread}
                    </span>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </motion.div>

        {/* Mood trend */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.3 }} className="md:col-span-2 space-y-4">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xl font-bold text-neutral-900 tracking-tight">Mood This Week</h2>
            <button onClick={() => navigate('/patient/mood')} className="text-[14px] font-semibold text-primary hover:text-primary-hover transition-colors">Full history →</button>
          </div>
          <Card hover={false} className="p-6 md:p-8">
            <div className="flex items-end justify-between gap-3 h-28">
              {recentMoods.map((m, i) => (
                <div key={m.id} className="flex-1 flex flex-col items-center gap-2">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${(m.score / 5) * 96}px` }}
                    transition={{ delay: i * 0.05, duration: 0.6, ease: "easeOut" }}
                    className="w-full max-w-[48px] rounded-t-xl"
                    style={{
                      background: m.score >= 4 ? '#8B78E6' : m.score === 3 ? '#C4BAF0' : '#E5989B',
                      opacity: 0.5 + (i / recentMoods.length) * 0.5,
                    }}
                  />
                  <span className="text-[11px] font-semibold text-neutral-400">{m.date.slice(5)}</span>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Quick actions */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.35 }} className="space-y-4">
        <h2 className="text-xl font-bold text-neutral-900 tracking-tight px-1">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Find a Pro', icon: Users, to: '/patient/directory', color: 'bg-primary-light text-primary hover:bg-primary-light/80' },
            { label: 'Open Chat', icon: MessageSquare, to: '/patient/chat', color: 'bg-accent-light text-accent-hover hover:bg-accent-light/80' },
            { label: 'My Sessions', icon: Calendar, to: '/patient/bookings', color: 'bg-surface text-neutral-600 border border-neutral-200 hover:bg-surface-tinted' },
            { label: 'Mood Journal', icon: TrendingUp, to: '/patient/mood', color: 'bg-primary-light text-primary hover:bg-primary-light/80' },
          ].map((a) => (
            <motion.button
              key={a.label}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate(a.to)}
              className={`p-5 rounded-2xl flex flex-col items-center gap-3 ${a.color} transition-all`}
            >
              <a.icon size={24} />
              <span className="text-[14px] font-bold tracking-wide">{a.label}</span>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Privacy badge */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="flex justify-center items-center gap-2 text-[13px] font-medium text-neutral-400 bg-surface-tinted py-3 px-4 rounded-full max-w-fit mx-auto border border-neutral-200">
        <Shield size={14} className="text-accent-hover" />
        <span>All your data is end-to-end encrypted. We can never read your messages.</span>
      </motion.div>
    </div>
  )
}
