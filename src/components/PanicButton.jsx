import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, X } from 'lucide-react'

export default function PanicButton() {
  const [showConfirm, setShowConfirm] = useState(false)

  const handleExit = () => {
    // Redirect to a neutral site and clear history
    window.location.replace('https://www.google.com')
  }

  return (
    <>
      {/* Floating Quick Exit — fixed bottom-right, always visible for patient safety */}
      <motion.button
        id="panic-button"
        className="fixed bottom-6 right-6 z-[100] flex items-center gap-2 px-4 py-2.5 bg-alert text-white text-[13px] font-bold uppercase tracking-wide rounded-full shadow-lg border-2 border-alert/30 cursor-pointer select-none"
        onClick={() => setShowConfirm(true)}
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.96 }}
        title="Quick Exit — Press to leave immediately"
        animate={{ boxShadow: ['0 4px 16px rgba(229,152,155,0.4)', '0 4px 24px rgba(229,152,155,0.7)', '0 4px 16px rgba(229,152,155,0.4)'] }}
        transition={{ duration: 2.5, repeat: Infinity }}
      >
        <AlertTriangle size={14} />
        Quick Exit
      </motion.button>

      <AnimatePresence>
        {showConfirm && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
              onClick={() => setShowConfirm(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.85, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.85 }}
              transition={{ type: 'spring', damping: 22, stiffness: 280 }}
              className="relative bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl border border-neutral-200 text-center"
            >
              <button
                onClick={() => setShowConfirm(false)}
                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-lg text-neutral-400 hover:bg-neutral-100 transition-all"
              >
                <X size={16} />
              </button>

              <div className="w-14 h-14 bg-alert/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <AlertTriangle size={24} className="text-alert" />
              </div>

              <h3 className="font-semibold text-xl text-neutral-900 mb-2">Leave Safely?</h3>
              <p className="text-sm text-neutral-500 mb-6">
                You'll be redirected to Google immediately. Your session stays secure.
              </p>

              <div className="flex flex-col gap-3">
                <motion.button
                  whileTap={{ scale: 0.96 }}
                  onClick={handleExit}
                  className="w-full py-3 text-base font-bold bg-alert text-white rounded-2xl hover:bg-alert/90 transition-colors"
                >
                  Leave Now → Google
                </motion.button>
                <button
                  onClick={() => setShowConfirm(false)}
                  className="text-sm text-neutral-400 hover:text-neutral-600 transition-colors"
                >
                  Stay — I'm safe
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}
