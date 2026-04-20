import { motion } from 'framer-motion'

export default function Card({ children, className = '', hover = true, onClick, glass = false }) {
  const baseStyle = glass 
    ? 'bg-white/70 backdrop-blur-xl border border-white shadow-soft rounded-3xl'
    : 'bg-surface border border-neutral-200 shadow-soft rounded-3xl'

  return (
    <motion.div
      onClick={onClick}
      whileHover={hover ? { y: -4, boxShadow: '0 12px 32px rgba(139, 120, 230, 0.08)' } : {}}
      transition={{ duration: 0.3 }}
      className={`${baseStyle} ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      {children}
    </motion.div>
  )
}
