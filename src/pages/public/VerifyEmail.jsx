import { useState } from 'react'
import { motion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { Shield, Mail, ArrowRight, RefreshCw, LogOut, AlertCircle, CheckCircle } from 'lucide-react'
import { useAuthStore } from '../../stores/authStore'
import { auth, db } from '../../lib/firebase'
import { sendEmailVerification } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'

export default function VerifyEmail() {
  const { user, logout, needsEmailVerification } = useAuthStore()
  const navigate = useNavigate()
  const [resending, setResending] = useState(false)
  const [checking, setChecking] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const handleResend = async () => {
    if (!auth.currentUser) return;
    setResending(true)
    setError('')
    setMessage('')
    try {
      await sendEmailVerification(auth.currentUser)
      setMessage('Verification email sent! Please check your inbox.')
    } catch (err) {
      if (err.code === 'auth/too-many-requests') {
        setError('Please wait a moment before requesting another email.')
      } else {
        setError(err.message || 'Failed to resend email. Try again later.')
      }
    } finally {
      setResending(false)
    }
  }

  const handleCheckVerified = async () => {
    if (!auth.currentUser) return;
    setChecking(true)
    setError('')
    setMessage('')
    try {
      await auth.currentUser.reload()
      if (auth.currentUser.emailVerified) {
        // User verified email successfully. Check Firestore for onboarding status.
        const uid = auth.currentUser.uid;
        const userDoc = await getDoc(doc(db, 'users', uid));
        
        if (userDoc.exists()) {
          // Fully onboarded
          let userData = userDoc.data();
          useAuthStore.setState({ 
            user: { uid, email: auth.currentUser.email, ...userData }, 
            role: userData.role, 
            isAuthenticated: true, 
            needsEmailVerification: false,
            pendingUser: null
          });
          navigate(userData.role === 'patient' ? '/patient' : '/pro', { replace: true })
        } else {
          // Needs onboarding
          const defaultAlias = auth.currentUser.displayName || auth.currentUser.email.split('@')[0];
          useAuthStore.setState({ 
            user: null,
            pendingUser: { uid, email: auth.currentUser.email, defaultAlias },
            isAuthenticated: false,
            needsEmailVerification: false
          });
          navigate('/onboarding', { replace: true })
        }
      } else {
        setError('Your email has not been verified yet. Please check your inbox.')
      }
    } catch (err) {
      setError(err.message || 'Error checking verification status.')
    } finally {
      setChecking(false)
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
        className="w-full max-w-md bg-white p-10 rounded-[2.5rem] shadow-soft border border-lilac-100 text-center relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-violet-400 via-plum-400 to-sage-400" />
        
        <div className="w-20 h-20 bg-violet-100 text-violet-600 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-inner">
          <Mail size={40} />
        </div>
        
        <h2 className="text-3xl font-bold text-text-main mb-4 tracking-tight">Verify your email</h2>
        <p className="text-text-muted mb-8 leading-relaxed">
          We've sent a verification link to <strong className="text-text-main">{user?.email || auth.currentUser?.email || 'your email'}</strong>. 
          Please verify your email to secure your account and continue.
        </p>

        {error && (
          <div className="bg-alert-light text-alert p-4 rounded-xl flex items-center gap-3 mb-6 text-[14px] font-medium border border-alert/10 text-left">
            <AlertCircle size={18} className="flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {message && (
          <div className="bg-sage-50 text-sage-700 p-4 rounded-xl flex items-center gap-3 mb-6 text-[14px] font-medium border border-sage-200 text-left">
            <CheckCircle size={18} className="flex-shrink-0" />
            <span>{message}</span>
          </div>
        )}

        <div className="space-y-4">
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={handleCheckVerified}
            disabled={checking}
            className={`w-full py-4 bg-violet-600 text-white rounded-2xl font-bold text-[16px] hover:bg-violet-700 shadow-soft transition-colors flex items-center justify-center gap-3 ${checking ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {checking ? <RefreshCw size={20} className="animate-spin" /> : <ArrowRight size={20} />}
            {checking ? 'Checking...' : "I've Verified My Email"}
          </motion.button>
          
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={handleResend}
            disabled={resending}
            className={`w-full py-4 bg-white border-2 border-lilac-200 text-text-main rounded-2xl font-bold text-[15px] hover:border-violet-300 hover:bg-violet-50/50 shadow-sm transition-all flex items-center justify-center gap-3 ${resending ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {resending && <span className="w-4 h-4 border-2 border-violet-300 border-t-violet-600 rounded-full animate-spin" />}
            {resending ? 'Sending...' : 'Resend Verification Email'}
          </motion.button>
        </div>

        <button 
          onClick={handleLogout}
          className="mt-8 text-[14px] text-text-muted hover:text-text-main font-semibold flex items-center justify-center gap-2 mx-auto transition-colors"
        >
          <LogOut size={16} />
          Sign in with a different account
        </button>
      </motion.div>
    </div>
  )
}
