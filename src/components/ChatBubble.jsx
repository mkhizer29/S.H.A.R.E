import { motion } from 'framer-motion'
import { useAuthStore } from '../stores/authStore'

export default function ChatBubble({ message, index }) {
  const { user } = useAuthStore()
  const isSent = message.senderId === user?.uid

  const formatTime = (ts) => {
    if (!ts) return 'Just now'
    if (typeof ts === 'string') return ts // For backward compat
    if (ts.toDate) return ts.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    return 'Just now'
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: index * 0.03, duration: 0.3 }}
      className={`flex ${isSent ? 'justify-end' : 'justify-start'} mb-3`}
    >
      <div 
        className={`max-w-[75%] px-5 py-3 shadow-sm ${
          isSent 
            ? 'bg-primary text-white rounded-[24px] rounded-br-[8px]' 
            : 'bg-surface border border-neutral-200 text-neutral-900 rounded-[24px] rounded-bl-[8px]'
        }`}
      >
        <p className="text-[15px] font-medium leading-relaxed">{message.text}</p>
        <div className={`flex items-center gap-1.5 mt-1.5 ${isSent ? 'justify-end' : 'justify-start'}`}>
          <span className={`text-[11px] font-semibold ${isSent ? 'text-primary-light' : 'text-neutral-400'}`}>
            {formatTime(message.timestamp || message.time)}
          </span>
          {isSent && (
            <span className={`text-[12px] font-bold text-primary-light`}>
              ✓
            </span>
          )}
        </div>
      </div>
    </motion.div>
  )
}
