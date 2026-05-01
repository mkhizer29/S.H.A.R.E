import { motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'

export default function Button({ children, variant = 'primary', size = 'md', onClick, disabled, className = '', type = 'button', icon, loading }) {
  const sizes = {
    sm: 'px-4 py-2 text-sm rounded-xl',
    md: 'px-6 py-3 text-[15px] font-medium rounded-2xl',
    lg: 'px-8 py-4 text-base font-semibold rounded-2xl',
    xl: 'px-10 py-5 text-lg font-semibold rounded-3xl',
  }

  const variants = {
    primary: 'bg-primary text-white hover:bg-primary-hover shadow-soft hover:shadow-float',
    secondary: 'bg-primary-light text-primary hover:bg-neutral-200/50',
    outline: 'border-2 border-primary-light text-primary hover:bg-primary-light',
    ghost: 'text-neutral-500 hover:text-primary hover:bg-primary-light',
    danger: 'bg-alert text-white hover:bg-red-400',
    dangerGhost: 'text-alert hover:bg-alert-light',
  }

  const isDisabled = disabled || loading

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      whileHover={{ scale: isDisabled ? 1 : 1.02 }}
      whileTap={{ scale: isDisabled ? 1 : 0.97 }}
      className={`inline-flex items-center justify-center gap-2 transition-all ${sizes[size]} ${variants[variant]} ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
    >
      {loading ? (
        <Loader2 className="w-5 h-5 animate-spin" />
      ) : (
        <>
          {icon && <span className="w-[18px] h-[18px] flex-shrink-0 flex items-center justify-center">{icon}</span>}
          {children}
        </>
      )}
    </motion.button>
  )
}
