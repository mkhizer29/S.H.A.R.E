import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { XCircle, LogOut, Mail } from 'lucide-react'
import { useAuthStore } from '../../stores/authStore'

export default function ProfessionalRejected() {
  const navigate = useNavigate()
  const { user, logout, isAuthenticated } = useAuthStore()

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/signin', { replace: true })
    }
  }, [isAuthenticated, navigate])

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
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-alert via-rose-400 to-orange-400" />
        
        <div className="w-16 h-16 bg-alert-light text-alert rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-inner">
          <XCircle size={32} />
        </div>
        
        <h1 className="text-[28px] font-bold text-text-main mb-3 tracking-tight">Application not approved</h1>
        
        <p className="text-text-muted text-[15px] font-medium leading-relaxed mb-6">
          Hi {user?.name || user?.alias}, unfortunately your application to join SHARE as a professional was not approved at this time.
        </p>

        {user?.rejectionReason && (
          <div className="bg-alert-light text-alert p-4 rounded-2xl text-sm font-medium mb-8 text-left border border-alert/10">
            <strong className="block mb-1 text-alert">Reason provided:</strong>
            {user.rejectionReason}
          </div>
        )}

        <div className="space-y-4 mt-8">
          <a
            href="mailto:support@share.example.com?subject=Professional%20Application%20Inquiry"
            className="w-full py-4 bg-violet-600 text-white rounded-2xl font-bold text-[16px] hover:bg-violet-700 shadow-soft transition-colors flex items-center justify-center gap-3"
          >
            <Mail size={20} />
            Contact support
          </a>

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
