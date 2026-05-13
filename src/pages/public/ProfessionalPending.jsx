import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Clock, RefreshCw, LogOut, Shield } from 'lucide-react'
import { useAuthStore } from '../../stores/authStore'

export default function ProfessionalPending() {
  const navigate = useNavigate()
  const { user, refreshUserStatus, logout, isAuthenticated } = useAuthStore()
  const [isRefreshing, setIsRefreshing] = useState(false)

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/signin', { replace: true })
    }
  }, [isAuthenticated, navigate])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      const result = await refreshUserStatus()
      if (result?.redirectTo) {
        navigate(result.redirectTo, { replace: true })
      }
    } catch (error) {
      console.error("Error refreshing status:", error)
    } finally {
      setIsRefreshing(false)
    }
  }

  const handleLogout = async () => {
    await logout()
    navigate('/signin', { replace: true })
  }

  if (!isAuthenticated) return null

  return (
    <div className="min-h-screen bg-lilac-50 flex items-center justify-center p-6 font-sans">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }} 
        animate={{ opacity: 1, scale: 1 }} 
        className="w-full max-w-md bg-white p-10 rounded-[2.5rem] shadow-soft border border-lilac-100 relative overflow-hidden text-center"
      >
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-violet-400 via-plum-400 to-sage-400" />
        
        <div className="w-16 h-16 bg-amber-50 text-amber-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-inner">
          <Clock size={32} />
        </div>
        
        <h1 className="text-[28px] font-bold text-text-main mb-3 tracking-tight">Application under review</h1>
        
        <p className="text-text-muted text-[15px] font-medium leading-relaxed mb-6">
          Hi {user?.name || user?.alias}, your professional account has been successfully submitted and is currently waiting for admin review. You will gain access to your workspace once approved.
        </p>

        <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-700 rounded-full font-bold text-sm mb-8">
          <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
          Pending Review
        </div>

        <div className="space-y-4">
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={handleRefresh}
            disabled={isRefreshing}
            className={`w-full py-4 bg-violet-600 text-white rounded-2xl font-bold text-[16px] hover:bg-violet-700 shadow-soft transition-colors flex items-center justify-center gap-3 ${isRefreshing ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            <RefreshCw size={20} className={isRefreshing ? 'animate-spin' : ''} />
            {isRefreshing ? 'Checking status...' : 'Refresh status'}
          </motion.button>

          <button 
            onClick={handleLogout}
            className="w-full py-4 text-[15px] text-text-muted hover:text-text-main font-semibold flex items-center justify-center gap-2 transition-colors"
          >
            <LogOut size={18} />
            Sign out
          </button>
        </div>
      </motion.div>
    </div>
  )
}
