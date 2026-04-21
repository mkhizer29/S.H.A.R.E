import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useMoodStore } from '../stores/moodStore'
import { Sparkles } from 'lucide-react'
import Button from './ui/Button'

const MOODS = [
  { score: 1, emoji: '😔', label: 'Very Low', color: '#E5989B' },
  { score: 2, emoji: '😟', label: 'Low', color: '#E8904A' },
  { score: 3, emoji: '😐', label: 'Okay', color: '#6D6875' },
  { score: 4, emoji: '🙂', label: 'Good', color: '#8B78E6' },
  { score: 5, emoji: '😊', label: 'Great', color: '#6855B8' },
]

export default function MoodCheckIn() {
  const { showModal, closeModal, submitMood } = useMoodStore()
  const [selected, setSelected] = useState(null)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = () => {
    if (!selected) return
    submitMood(selected)
    setSubmitted(true)
    setTimeout(() => {
      setSubmitted(false)
      setSelected(null)
    }, 1500)
  }

  return (
    <AnimatePresence>
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeModal}
            className="absolute inset-0 bg-neutral-900/40 backdrop-blur-md"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 32 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: 'spring', damping: 24, stiffness: 280 }}
            className="relative bg-surface rounded-[32px] p-8 sm:p-10 max-w-[400px] w-full shadow-float border border-neutral-200 text-center"
          >
            {!submitted ? (
              <>
                <div className="w-14 h-14 bg-primary-light rounded-2xl flex items-center justify-center mx-auto mb-5">
                  <Sparkles size={26} className="text-primary" />
                </div>
                <h3 className="text-2xl font-bold text-neutral-900 tracking-tight mb-2">How are you feeling?</h3>
                <p className="text-[15px] font-medium text-neutral-500 mb-8">A quick check-in helps us support you better.</p>

                <div className="flex justify-between px-1 mb-8">
                  {MOODS.map((m) => (
                    <motion.button
                      key={m.score}
                      className={`flex flex-col items-center gap-2 p-3 rounded-[18px] transition-all border-2 border-transparent ${selected === m.score
                          ? 'bg-primary-light border-primary shadow-inner-soft -translate-y-2'
                          : 'hover:bg-neutral-100 hover:-translate-y-1'
                        }`}
                      onClick={() => setSelected(m.score)}
                      whileHover={{ scale: selected === m.score ? 1 : 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <span className="text-3xl">{m.emoji}</span>
                      <span className={`text-[11px] font-bold tracking-wide uppercase ${selected === m.score ? 'text-primary' : 'text-neutral-400'}`}>
                        {m.label}
                      </span>
                    </motion.button>
                  ))}
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={closeModal}
                    className="flex-1 py-3.5 text-[15px] font-semibold text-neutral-400 hover:text-neutral-900 transition-colors"
                  >
                    Skip for now
                  </button>
                  <Button
                    onClick={handleSubmit}
                    disabled={!selected}
                    className="flex-1"
                  >
                    Log Mood
                  </Button>
                </div>
              </>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-10"
              >
                <div className="text-6xl mb-6">
                  {MOODS.find((m) => m.score === selected)?.emoji}
                </div>
                <h3 className="text-2xl font-bold text-primary tracking-tight mb-2">Logged!</h3>
                <p className="text-[15px] font-medium text-neutral-500">Thank you for checking in. We're here for you.</p>
              </motion.div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
