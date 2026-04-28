import { useState } from 'react'
import { motion } from 'framer-motion'
import { Calendar, Clock, Star, X, ChevronRight, CheckCircle, AlertCircle, MessageSquare } from 'lucide-react'
import { useBookingStore } from '../../stores/bookingStore'
import { useChatStore } from '../../stores/chatStore'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import Avatar from '../../components/ui/Avatar'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import JoinSessionButton from '../../components/JoinSessionButton'
import { useAuthStore } from '../../stores/authStore'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const STATUS_CONFIG = {
  upcoming: { badge: 'teal', label: 'Upcoming', icon: Clock },
  completed: { badge: 'gray', label: 'Completed', icon: CheckCircle },
  cancelled: { badge: 'coral', label: 'Cancelled', icon: AlertCircle },
}

export default function Bookings() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { sessions, cancelSession, loadBookings, isLoading, getUpcoming, getPast, error } = useBookingStore()
  const { ensureConversation, setActiveConv } = useChatStore()
  const [tab, setTab] = useState('upcoming')
  const [cancelId, setCancelId] = useState(null)

  useEffect(() => {
    if (user?.uid) {
      loadBookings(user.uid, 'patient')
    }
  }, [user?.uid, loadBookings])

  const displayed = tab === 'upcoming' ? getUpcoming() : getPast()

  const [isConnecting, setIsConnecting] = useState(false)

  const handleMessage = async (s) => {
    if (isConnecting) return
    setIsConnecting(true)
    
    console.log('[Bookings] Connecting to pro:', s.proName, s.professionalId)
    try {
      const convId = await ensureConversation({
        uid: s.professionalId,
        name: s.proName,
        title: s.proSpecialty
      })
      
      if (convId) {
        setActiveConv(convId)
        navigate('/patient/chat')
      } else {
        console.error('[Bookings] Failed to get convId')
      }
    } catch (e) {
      console.error('[Bookings] Error in handleMessage:', e)
    } finally {
      setIsConnecting(false)
    }
  }

  const handleCancel = () => {
    if (cancelId) {
      cancelSession(cancelId)
      setCancelId(null)
    }
  }

  return (
    <div className="p-6 md:p-8 max-w-3xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="font-display text-3xl text-text-primary mb-1">My Sessions</h1>
        <p className="text-text-secondary text-sm">{getUpcoming().length} upcoming session{getUpcoming().length !== 1 ? 's' : ''} scheduled</p>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-sage-light/60 rounded-xl mb-6 w-fit">
        {['upcoming', 'history'].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${tab === t ? 'bg-white text-brand-teal shadow-card' : 'text-text-muted hover:text-text-secondary'}`}
          >
            {t === 'upcoming' ? 'Upcoming' : 'History'}
          </button>
        ))}
      </div>

      {error && (
        <div className="mb-6 p-4 bg-alert/10 border border-alert/20 rounded-2xl text-alert text-sm font-medium">
          Failed to load bookings: {error}
        </div>
      )}

      {/* Sessions list */}
      <div className="space-y-4">
        {isLoading ? (
          <Card hover={false} className="p-12 text-center">
            <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4" />
            <p className="text-text-secondary font-medium animate-pulse">Loading your sessions...</p>
          </Card>
        ) : displayed.length === 0 ? (
          <Card hover={false} className="p-12 text-center">
            <Calendar size={40} className="text-text-muted mx-auto mb-4" />
            <p className="font-display text-xl text-text-primary mb-2">No {tab === 'upcoming' ? 'upcoming' : 'past'} sessions</p>
            <p className="text-text-secondary text-sm mb-4">
              {tab === 'upcoming' ? 'Browse our directory to book your first session.' : 'Your session history will appear here.'}
            </p>
          </Card>
        ) : displayed.map((s, i) => {
          const cfg = STATUS_CONFIG[s.status]
          return (
            <motion.div
              key={s.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
            >
              <Card className="p-5">
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <Avatar name={s.proName} size="md" />
                    <div>
                      <p className="font-medium text-text-primary">{s.proName}</p>
                      <p className="text-xs text-text-muted">{s.proSpecialty}</p>
                    </div>
                  </div>
                  <Badge variant={cfg.badge}>{cfg.label}</Badge>
                </div>

                <div className="grid grid-cols-3 gap-4 py-3 border-y border-border-subtle mb-4">
                  <div>
                    <p className="text-xs text-text-muted mb-0.5">Date</p>
                    <p className="text-sm font-medium text-text-primary">
                      {new Date(s.startsAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-text-muted mb-0.5">Time</p>
                    <p className="text-sm font-medium text-text-primary">
                      {new Date(s.startsAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-text-muted mb-0.5">Duration</p>
                    <p className="text-sm font-medium text-text-primary">{s.duration} min</p>
                  </div>
                </div>

                {s.status === 'completed' && s.rating && (
                  <div className="flex items-center gap-1 mb-3">
                    <p className="text-xs text-text-muted mr-1">Your rating:</p>
                    {[...Array(5)].map((_, j) => (
                      <Star key={j} size={13} className={j < s.rating ? 'text-yellow-400 fill-yellow-400' : 'text-border-subtle'} />
                    ))}
                  </div>
                )}

                {s.note && (
                  <p className="text-xs text-text-secondary italic bg-sage-light/50 rounded-lg px-3 py-2 mb-3">"{s.note}"</p>
                )}

                {s.status === 'upcoming' && (
                  <div className="flex gap-3">
                    <JoinSessionButton 
                      startsAt={s.startsAt} 
                      sessionId={s.id} 
                      role="patient" 
                      size="sm" 
                    />
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleMessage(s)}
                      disabled={isConnecting}
                      className="flex items-center gap-2"
                    >
                      <MessageSquare size={14} />
                      {isConnecting ? 'Connecting...' : 'Message'}
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setCancelId(s.id)}>Cancel</Button>
                  </div>
                )}
              </Card>
            </motion.div>
          )
        })}
      </div>

      {/* Cancel modal */}
      <Modal isOpen={!!cancelId} onClose={() => setCancelId(null)} title="Cancel Session?">
        <p className="text-text-secondary text-sm mb-6">Are you sure you want to cancel this session? You may be charged a late cancellation fee.</p>
        <div className="flex gap-3">
          <Button variant="danger" onClick={handleCancel} className="flex-1">Yes, Cancel</Button>
          <Button variant="secondary" onClick={() => setCancelId(null)} className="flex-1">Keep Session</Button>
        </div>
      </Modal>
    </div>
  )
}
