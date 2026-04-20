export default function Avatar({ name, size = 'md', online = false, className = '' }) {
  const initials = name
    ? name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
    : '?'

  const sizes = {
    xs: 'w-8 h-8 text-xs',
    sm: 'w-10 h-10 text-sm',
    md: 'w-12 h-12 text-base',
    lg: 'w-16 h-16 text-xl',
    xl: 'w-24 h-24 text-3xl',
  }

  const dotSizes = {
    xs: 'w-2 h-2',
    sm: 'w-2.5 h-2.5',
    md: 'w-3 h-3 ring-2',
    lg: 'w-4 h-4 ring-2 ring-offset-1',
    xl: 'w-5 h-5 ring-2 ring-offset-2',
  }

  const colors = [
    'bg-primary text-white',
    'bg-accent hover:bg-accent-hover text-white',
    'bg-alert text-white',
    'bg-neutral-900 text-white',
  ]
  const colorIndex = name ? name.charCodeAt(0) % colors.length : 0

  return (
    <div className={`relative flex-shrink-0 ${className}`}>
      <div className={`${sizes[size]} ${colors[colorIndex]} rounded-full flex items-center justify-center font-bold tracking-wider shadow-inner-soft`}>
        {initials}
      </div>
      {online && (
        <div className={`absolute bottom-0 right-0 ${dotSizes[size]} bg-green-500 rounded-full border-2 border-surface ring-green-500/20`} />
      )}
    </div>
  )
}
