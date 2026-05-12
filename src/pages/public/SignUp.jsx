import { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate, Link } from 'react-router-dom'
import { Shield, User, Briefcase, ChevronRight, Check } from 'lucide-react'
import { useAuthStore } from '../../stores/authStore'
import Input from '../../components/ui/Input'

const ROLE_OPTIONS = [
  { role: 'patient', label: 'I need support', desc: 'Browse professionals, book sessions, chat anonymously', icon: User, color: 'border-lilac-200 bg-white', activeColor: 'border-violet-600 bg-violet-50' },
  { role: 'professional', label: 'I\'m a professional', desc: 'Join as a specialist, counsellor, or psychiatrist', icon: Briefcase, color: 'border-lilac-200 bg-white', activeColor: 'border-sage-500 bg-sage-50' },
]

export default function SignUp() {
  const navigate = useNavigate()
  const { register, signInWithGoogle, isLoading } = useAuthStore()
  const [googleLoading, setGoogleLoading] = useState(false)
  const [selectedRole, setSelectedRole] = useState('patient')
  const [alias, setAlias] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await register(email, password, alias, selectedRole)
      if (selectedRole === 'patient') navigate('/patient')
      else navigate('/pro')
    } catch (error) {
      console.error('Signup error:', error)
      alert(error.message || 'Failed to create account. Please try again.')
    }
  }

  const handleGoogleSignUp = async () => {
    setGoogleLoading(true)
    try {
      await signInWithGoogle()
      const state = useAuthStore.getState()
      if (state.role === 'patient') navigate('/patient')
      else if (state.role === 'professional') navigate('/pro')
      else navigate('/admin')
    } catch (err) {
      if (err) alert(err.message || 'Google sign-up failed. Please try again.')
    } finally {
      setGoogleLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F8F7FA] font-sans flex items-center justify-center px-6 py-16 relative">
      {/* Background ambient light */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-violet-200/30 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[0%] left-[-10%] w-[400px] h-[400px] bg-sage-200/20 rounded-full blur-[100px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg relative z-10 bg-white/60 backdrop-blur-xl p-8 md:p-12 rounded-[3rem] shadow-float border border-white"
      >
        <Link to="/" className="flex items-center gap-3 mb-10 group w-max">
          <div className="w-10 h-10 bg-violet-100 rounded-[12px] flex items-center justify-center group-hover:scale-105 transition-transform">
            <Shield size={20} className="text-violet-600" />
          </div>
          <span className="text-2xl font-bold tracking-tight text-text-main">SHARE</span>
        </Link>

        <h1 className="text-[32px] font-semibold text-text-main mb-3 tracking-tight">Create your account</h1>
        <p className="text-text-muted text-[15px] font-medium mb-10">
          Already have one? <Link to="/signin" className="text-violet-600 font-bold hover:underline">Sign in</Link>
        </p>

        {/* Role selection */}
        <p className="text-[13px] uppercase tracking-widest font-bold text-text-muted mb-4">I am joining as...</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {ROLE_OPTIONS.map((r) => {
            const isSelected = selectedRole === r.role
            return (
              <motion.button
                key={r.role}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setSelectedRole(r.role)}
                className={`p-5 rounded-[24px] border-2 text-left transition-all ${
                  isSelected ? r.activeColor : r.color + ' hover:border-lilac-300'
                }`}
              >
                <div className="flex items-center justify-between mb-3 text-text-main">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isSelected ? 'bg-white shadow-sm' : 'bg-lilac-50'}`}>
                    <r.icon size={18} className={isSelected ? 'text-text-main' : 'text-text-muted'} />
                  </div>
                  {isSelected && <div className="w-6 h-6 bg-text-main rounded-full flex items-center justify-center"><Check size={14} className="text-white" /></div>}
                </div>
                <p className={`text-[15px] font-bold mb-1 tracking-tight text-text-main`}>{r.label}</p>
                <p className={`text-[13px] font-medium leading-relaxed ${isSelected ? 'text-text-main/80' : 'text-text-muted'}`}>{r.desc}</p>
              </motion.button>
            )
          })}
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label={selectedRole === 'patient' ? 'Choose a Pseudonym (Alias)' : 'Full Name'}
            placeholder={selectedRole === 'patient' ? 'e.g. WillowDream42' : 'Dr. Your Name'}
            value={alias}
            onChange={(e) => setAlias(e.target.value)}
          />
          {selectedRole === 'patient' && (
            <p className="text-[13px] font-medium text-sage-600 bg-sage-50 p-3 rounded-xl border border-sage-100 flex gap-2 items-start mt-2">
              <span className="text-lg leading-none">💡</span> 
              <span>This alias is what the platform uses. Your real identity is never exposed.</span>
            </p>
          )}
          <Input
            label="Email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
          />
          <Input
            label="Password"
            placeholder="Min. 8 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
          />

          <div className="flex items-start gap-3 text-[13px] font-medium text-text-muted pt-4">
            <input type="checkbox" className="mt-1 accent-violet-600 w-4 h-4" required />
            <span className="leading-relaxed">I agree to the <a href="#" className="text-violet-600 font-bold hover:underline">Terms of Service</a> and <a href="#" className="text-violet-600 font-bold hover:underline">Privacy Policy</a>. I understand my data is end-to-end encrypted.</span>
          </div>

          <motion.button
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={isLoading}
            className="w-full py-4 bg-violet-600 text-white rounded-2xl font-bold text-[16px] hover:bg-violet-700 shadow-soft transition-colors mt-6 flex justify-center items-center gap-2"
          >
            {isLoading ? 'Generating cryptographic keys...' : 'Create Account — Free'}
            {!isLoading && <ChevronRight size={18} />}
          </motion.button>
        </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-lilac-200" />
            <span className="text-[13px] font-semibold text-text-muted tracking-wide uppercase">or</span>
            <div className="flex-1 h-px bg-lilac-200" />
          </div>

          {/* Google Sign-Up Button */}
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={handleGoogleSignUp}
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
            {googleLoading ? 'Connecting...' : 'Sign up with Google'}
          </motion.button>
      </motion.div>
    </div>
  )
}
