import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'

export default function Modal({ isOpen, onClose, title, children, size = 'md' }) {
  const widths = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-2xl',
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={onClose}
            className="absolute inset-0 bg-neutral-900/40 backdrop-blur-md"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className={`relative w-full ${widths[size]} bg-surface rounded-[32px] shadow-float border border-neutral-200 overflow-hidden`}
          >
            <div className="flex items-center justify-between p-6 sm:p-8 border-b border-neutral-100">
              <h3 className="text-xl font-semibold text-neutral-900 tracking-tight">{title}</h3>
              <button
                onClick={onClose}
                className="w-10 h-10 flex items-center justify-center rounded-full text-neutral-500 hover:bg-primary-light hover:text-primary transition-colors"
                title="Close"
              >
                <X size={20} strokeWidth={2.5} />
              </button>
            </div>
            <div className="p-6 sm:p-8">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
