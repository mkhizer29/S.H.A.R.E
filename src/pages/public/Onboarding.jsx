import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Check, Shield, AlertCircle, LogOut } from 'lucide-react'
import { useAuthStore } from '../../stores/authStore'
import Input from '../../components/ui/Input'

export default function Onboarding() {
  const navigate = useNavigate()
  const { completeOnboarding, isLoading, pendingUser, logout } = useAuthStore()
  
  const [alias, setAlias] = useState('')
  const [selectedRole, setSelectedRole] = useState('patient')
  const [error, setError] = useState('')

  useEffect(() => {
    if (pendingUser?.defaultAlias) {
      setAlias(pendingUser.defaultAlias)
    }
  }, [pendingUser])

  // If somehow they arrive here without a pending user, send them away
  if (!pendingUser) {
    return (
      <div className="min-h-screen bg-lilac-50 flex items-center justify-center p-6">
         <p>Redirecting...</p>
      </div>
    )
  }

  const handleOnboardingSubmit = async (e) => {
    e.preventDefault()
    setError('')
    
    if (!alias.trim()) {
      setError('Please choose an alias or name.')
      return
    }

    try {
      const result = await completeOnboarding(alias.trim(), selectedRole)
      navigate(result.redirectTo, { replace: true })
    } catch (err) {
      setError(err.message || 'Failed to complete profile. Please try again.')
    }
  }

  const handleLogout = async () => {
    await logout()
    navigate('/signin', { replace: true })
  }

  return (
    <div className="min-h-screen bg-lilac-50 flex items-center justify-center p-6 font-sans">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }} 
        animate={{ opacity: 1, scale: 1 }} 
        className="w-full max-w-md bg-white p-10 rounded-[2.5rem] shadow-soft border border-lilac-100 relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-violet-400 via-plum-400 to-sage-400" />
        
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-violet-100 text-violet-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-inner">
            <Shield size={32} />
          </div>
          <h1 className="text-3xl font-bold text-text-main mb-3 tracking-tight">Complete your profile</h1>
          <p className="text-text-muted text-[15px] font-medium leading-relaxed">
            Welcome, {pendingUser.email}. Please set up your identity on SHARE.
          </p>
        </div>

        {error && (
          <div className="bg-alert-light text-alert p-4 rounded-xl flex items-center gap-3 mb-6 text-[14px] font-medium border border-alert/10 text-left">
            <AlertCircle size={18} className="flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleOnboardingSubmit} className="space-y-6">
          <Input
            label="Choose a Pseudonym (Alias)"
            placeholder="e.g. WillowDream42"
            value={alias}
            onChange={(e) => setAlias(e.target.value)}
            type="text"
            disabled={isLoading}
          />

          <div className="space-y-3">
            <label className="text-[13px] font-bold text-neutral-400 uppercase tracking-wide ml-1">Account Type</label>
            <div className="grid grid-cols-1 gap-3">
              <button
                type="button"
                onClick={() => setSelectedRole('patient')}
                className={`p-4 rounded-2xl border-2 text-left transition-all ${
                  selectedRole === 'patient' 
                    ? 'border-violet-500 bg-violet-50 ring-4 ring-violet-500/10' 
                    : 'border-neutral-200 bg-white hover:border-violet-200 hover:bg-neutral-50'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={`font-bold ${selectedRole === 'patient' ? 'text-violet-700' : 'text-neutral-900'}`}>Patient</span>
                  {selectedRole === 'patient' && <Check size={18} className="text-violet-600" />}
                </div>
                <p className="text-sm font-medium text-text-muted">I want support from professionals.</p>
              </button>

              <button
                type="button"
                onClick={() => setSelectedRole('professional')}
                className={`p-4 rounded-2xl border-2 text-left transition-all ${
                  selectedRole === 'professional' 
                    ? 'border-violet-500 bg-violet-50 ring-4 ring-violet-500/10' 
                    : 'border-neutral-200 bg-white hover:border-violet-200 hover:bg-neutral-50'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={`font-bold ${selectedRole === 'professional' ? 'text-violet-700' : 'text-neutral-900'}`}>Professional</span>
                  {selectedRole === 'professional' && <Check size={18} className="text-violet-600" />}
                </div>
                <p className="text-sm font-medium text-text-muted">I want to provide support. Requires admin approval.</p>
              </button>
            </div>
          </div>

          <motion.button
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={isLoading}
            className={`w-full py-4 bg-violet-600 text-white rounded-2xl font-bold text-[16px] hover:bg-violet-700 shadow-soft transition-colors mt-2 flex items-center justify-center gap-3 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {isLoading && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
            {isLoading 
              ? (selectedRole === 'professional' ? 'Submitting application...' : 'Generating keys...') 
              : (selectedRole === 'professional' ? 'Submit for Review' : 'Complete Registration')}
          </motion.button>
        </form>

        <button 
          onClick={handleLogout}
          className="mt-8 text-[14px] text-text-muted hover:text-text-main font-semibold flex items-center justify-center gap-2 mx-auto transition-colors"
        >
          <LogOut size={16} />
          Cancel and sign out
        </button>
      </motion.div>
    </div>
  )
}
