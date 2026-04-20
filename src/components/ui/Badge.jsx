export default function Badge({ children, variant = 'primary', icon, className = '' }) {
  const variants = {
    primary: 'bg-primary-light/50 text-primary-hover border border-primary-light',
    accent: 'bg-accent-light/50 text-accent-hover border border-accent-light',
    alert: 'bg-alert-light text-alert border border-alert-light',
    neutral: 'bg-surface-tinted text-neutral-500 border border-neutral-200',
    // Fallbacks for older mapped usage:
    teal: 'bg-accent-light/50 text-accent-hover border border-accent-light',
    purple: 'bg-primary-light/50 text-primary-hover border border-primary-light',
    coral: 'bg-alert-light text-alert border border-alert-light',
    gray: 'bg-surface-tinted text-neutral-500 border border-neutral-200',
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[13px] font-semibold tracking-wide ${variants[variant]} ${className}`}>
      {icon && <span className="w-3.5 h-3.5 flex items-center justify-center">{icon}</span>}
      {children}
    </span>
  )
}
