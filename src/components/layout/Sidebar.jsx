import { NavLink, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Shield, Home, Users, MessageSquare, Calendar, BarChart2,
  Settings, LogOut, Star, Banknote, AlertTriangle, CheckSquare,
  Sliders, UserCheck, User
} from 'lucide-react'
import { useAuthStore } from '../../stores/authStore'

const NAV_ITEMS = {
  patient: [
    { to: '/patient', icon: Home, label: 'Home', end: true },
    { to: '/patient/directory', icon: Users, label: 'Find a Pro' },
    { to: '/patient/chat', icon: MessageSquare, label: 'Messages' },
    { to: '/patient/bookings', icon: Calendar, label: 'Sessions' },
    { to: '/patient/mood', icon: Star, label: 'Mood Journal' },
    { to: '/patient/settings', icon: Settings, label: 'Settings' },
  ],
  professional: [
    { to: '/pro', icon: Home, label: 'Dashboard', end: true },
    { to: '/pro/inbox', icon: MessageSquare, label: 'Inbox' },
    { to: '/pro/calendar', icon: Calendar, label: 'Calendar' },
    { to: '/pro/manage-schedule', icon: CheckSquare, label: 'Schedule' },
    { to: '/pro/clients', icon: Users, label: 'Clients' },
    { to: '/pro/revenue', icon: Banknote, label: 'Revenue' },
    { to: '/pro/profile', icon: User, label: 'Profile' },
  ],
  admin: [
    { to: '/admin', icon: Home, label: 'Overview', end: true },
    { to: '/admin/verification', icon: CheckSquare, label: 'Verification' },
    { to: '/admin/analytics', icon: BarChart2, label: 'Analytics' },
    { to: '/admin/crisis', icon: AlertTriangle, label: 'Crisis Monitor' },
    { to: '/admin/revenue', icon: Banknote, label: 'Revenue' },
    { to: '/admin/moderation', icon: UserCheck, label: 'Moderation' },
    { to: '/admin/config', icon: Sliders, label: 'Configuration' },
  ],
}

export default function Sidebar() {
  const { role, logout } = useAuthStore()
  const navigate = useNavigate()
  const items = NAV_ITEMS[role] || []

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <aside className="sidebar w-[260px] h-screen bg-surface border-r border-neutral-200 flex flex-col pt-2">
      {/* Logo */}
      <div className="px-6 py-6 pb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-light rounded-[14px] flex items-center justify-center">
            <Shield size={20} className="text-primary" />
          </div>
          <span className="text-xl font-semibold text-neutral-900 tracking-tight">SHARE</span>
        </div>
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-4 overflow-y-auto space-y-1">
        <div className="mb-4 ml-3 text-[11px] font-bold tracking-wider text-neutral-500 uppercase">Menu</div>
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) => `flex items-center gap-3.5 px-4 py-3.5 rounded-[16px] text-[15px] font-medium transition-all group ${isActive
                ? 'bg-primary-light text-primary shadow-soft border border-primary-light'
                : 'text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900'
              }`}
          >
            {({ isActive }) => (
              <>
                <item.icon size={20} className={`transition-colors ${isActive ? 'text-primary' : 'text-neutral-500 group-hover:text-primary'}`} />
                <span>{item.label}</span>
                {isActive && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="ml-auto w-1.5 h-1.5 rounded-full bg-primary"
                  />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="p-6 mt-auto">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-4 py-3 rounded-[16px] text-[15px] font-medium text-neutral-500 hover:bg-alert-light hover:text-alert transition-all"
        >
          <LogOut size={20} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  )
}
