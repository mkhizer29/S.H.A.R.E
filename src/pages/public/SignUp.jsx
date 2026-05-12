import { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import { Shield, ChevronRight, AlertCircle } from 'lucide-react'
import { useAuthStore } from '../../stores/authStore'
import Input from '../../components/ui/Input'

export default function SignUp() {
  const navigate = useNavigate()
  const location = useLocation()
  const { register, signInWithGoogle, isLoading } = useAuthStore()
  
  const [googleLoading, setGoogleLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const from = location.state?.from?.pathname || null

  const handleEmailSubmit = async (e) => {
    e.preventDefault()
    setError('')
    
    if (!email || !password) {
      setError('Please enter both email and password.')
      return
    }

    try {
      const result = await register(email, password)
      if (result.needsEmailVerification) {
        navigate('/verify-email', { replace: true })
      }
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.')
    }
  }

  const handleGoogleSignIn = async () => {
    setError('')
    setGoogleLoading(true)
    try {
      const result = await signInWithGoogle()
      if (result.pendingUser) {
        navigate('/onboarding', { replace: true })
      } else if (result.user) {
        const state = useAuthStore.getState()
        const target = from || (state.role === 'patient' ? '/patient' : state.role === 'professional' ? '/pro' : '/admin')
        navigate(target, { replace: true })
      }
    } catch (err) {
      if (err) setError(err.message || 'Google sign-in failed. Please try again.')
    } finally {
      setGoogleLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-lilac-50 flex font-sans">
      {/* Left panel */}
      <div className="hidden lg:flex flex-col justify-center px-16 bg-violet-600 w-[480px] flex-shrink-0 relative overflow-hidden">
        <div className="absolute top-0 right-[-10%] w-64 h-64 bg-plum-500/40 rounded-full blur-[80px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-48 h-48 bg-sage-400/40 rounded-full blur-[60px]" />
        <div className="relative z-10 text-white">
          <Link to="/" className="flex items-center gap-3 mb-16 group">
            <div className="w-10 h-10 bg-white/20 rounded-[12px] flex items-center justify-center backdrop-blur-md group-hover:scale-105 transition-transform">
              <Shield size={20} className="text-white" />
            </div>
            <span className="text-2xl font-bold tracking-tight">SHARE</span>
          </Link>
          <h2 className="text-4xl lg:text-5xl font-semibold mb-6 tracking-tight leading-[1.1]">Join<br/>us today.</h2>
          <p className="text-violet-100 text-lg leading-relaxed mb-10 font-medium max-w-sm">
            Experience secure, pseudonymous mental health support. Your privacy is our priority.
          </p>
          {['End-to-end encrypted chat', 'Verified local professionals', 'Pseudonymous accounts'].map((item) => (
            <div key={item} className="flex items-center gap-3 mb-4">
              <div className="w-6 h-6 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm">
                <ChevronRight size={12} className="text-white" />
              </div>
              <span className="text-violet-100 font-medium text-[15px]">{item}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 relative">
        <div className="absolute top-10 right-10 w-96 h-96 bg-violet-200/20 rounded-full blur-[100px] pointer-events-none" />
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md relative z-10"
        >
          {/* Mobile logo */}
          <Link to="/" className="flex items-center gap-3 mb-10 lg:hidden group">
            <div className="w-10 h-10 bg-violet-100 rounded-[12px] flex items-center justify-center group-hover:scale-105 transition-transform">
              <Shield size={20} className="text-violet-600" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-text-main">SHARE</span>
          </Link>

          <h1 className="text-[32px] font-semibold text-text-main mb-3 tracking-tight">Create an account</h1>
          <p className="text-text-muted text-[15px] font-medium mb-8">
            Already have an account? <Link to="/signin" className="text-violet-600 font-bold hover:underline">Sign in</Link>
          </p>

          {error && (
            <motion.div 
              initial={{ opacity: 0, x: -10 }} 
              animate={{ opacity: 1, x: 0 }}
              className="bg-alert-light text-alert p-4 rounded-xl flex items-center gap-3 mb-6 text-[14px] font-medium border border-alert/10"
            >
              <AlertCircle size={18} />
              {error}
            </motion.div>
          )}

          <form onSubmit={handleEmailSubmit} className="space-y-5 mb-8">
            <Input
              label="Email address"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              disabled={isLoading}
            />
            <Input
              label="Password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              disabled={isLoading}
            />
            
            <motion.button
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isLoading}
              className={`w-full py-4 bg-violet-600 text-white rounded-2xl font-bold text-[16px] hover:bg-violet-700 shadow-soft transition-colors mt-2 flex items-center justify-center gap-3 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {isLoading && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
              {isLoading ? 'Creating account...' : 'Sign Up'}
            </motion.button>
          </form>

          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-lilac-200" />
            <span className="text-[13px] font-semibold text-text-muted tracking-wide uppercase">or</span>
            <div className="flex-1 h-px bg-lilac-200" />
          </div>

          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={handleGoogleSignIn}
            disabled={isLoading || googleLoading}
            className={`w-full py-4 bg-white border-2 border-lilac-200 text-text-main rounded-2xl font-bold text-[15px] hover:border-violet-300 hover:bg-violet-50/50 shadow-sm transition-all flex items-center justify-center gap-3 ${
              googleLoading ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            {googleLoading ? (
              <span className="w-4 h-4 border-2 border-violet-300 border-t-violet-600 rounded-full animate-spin" />
            ) : (
              <svg width="20" height="20" viewBox="0 0 48 48">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                <path fill="#FBBC05" d="M10.53 28.59a14.5 14.5 0 0 1 0-9.18l-7.98-6.19a24.04 24.04 0 0 0 0 21.56l7.98-6.19z"/>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
              </svg>
            )}
            {googleLoading ? 'Connecting...' : 'Continue with Google'}
          </motion.button>

          <p className="text-center mt-8 text-[12px] text-text-muted font-medium px-4">
            By signing in, you agree to our Terms of Service and Privacy Policy.
          </p>
        </motion.div>
      </div>
    </div>
  )
}
