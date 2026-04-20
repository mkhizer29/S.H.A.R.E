import { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate, Link } from 'react-router-dom'
import { Shield, User, Briefcase, Lock, ChevronRight, Zap } from 'lucide-react'
import { useAuthStore } from '../../stores/authStore'
import Input from '../../components/ui/Input'

const DEMO_ACCOUNTS = [
  { role: 'patient', label: 'Patient Demo', desc: 'Browse, chat, book sessions', color: 'border-violet-200 bg-lilac-50 text-violet-700 hover:border-violet-600', icon: User },
  { role: 'professional', label: 'Professional Demo', desc: 'Inbox, calendar, revenue', color: 'border-sage-200 bg-sage-50 hover:border-sage-500 text-sage-600', icon: Briefcase },
  { role: 'admin', label: 'Admin Demo', desc: 'All 6 admin modules', color: 'border-plum-200 bg-plum-50 hover:border-plum-500 text-plum-600', icon: Lock },
]

export default function SignIn() {
  const navigate = useNavigate()
  const { login, isLoading } = useAuthStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleDemoLogin = async (role) => {
    await login('demo@demohub.com', 'password123', role)
    if (role === 'patient') navigate('/patient')
    else if (role === 'professional') navigate('/pro')
    else navigate('/admin')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    await login(email, password, 'patient') // default fallback role for direct signin mock
    navigate('/patient')
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
          <h2 className="text-4xl lg:text-5xl font-semibold mb-6 tracking-tight leading-[1.1]">Welcome<br/>back.</h2>
          <p className="text-violet-100 text-lg leading-relaxed mb-10 font-medium max-w-sm">
            Your anonymity is preserved. Your sessions are encrypted. You're safe here.
          </p>
          {['256-bit encryption', 'Zero-knowledge architecture', 'No real names required'].map((item) => (
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
      <div className="flex-1 flex items-center justify-center px-6 py-12 relative overflow-hidden">
        {/* Soft background glows for right side */}
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

          <h1 className="text-[32px] font-semibold text-text-main mb-3 tracking-tight">Sign in</h1>
          <p className="text-text-muted text-[15px] font-medium mb-10">
            Don't have an account? <Link to="/signup" className="text-violet-600 font-bold hover:underline">Sign up free</Link>
          </p>

          <form onSubmit={handleSubmit} className="space-y-5 mb-8">
            <Input
              label="Email or Alias"
              placeholder="e.g. WillowDream42"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="text"
            />
            <Input
              label="Password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
            />
            <motion.button
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-violet-600 text-white rounded-2xl font-bold text-[16px] hover:bg-violet-700 shadow-soft transition-colors mt-2"
            >
              {isLoading ? 'Decrypting & Signing in...' : 'Sign In'}
            </motion.button>
          </form>

          {/* Demo divider */}
          <div className="relative mb-8 mt-2">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-lilac-200" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-lilac-50 px-4 text-[13px] uppercase font-bold tracking-wider text-text-muted flex items-center gap-2">
                <Zap size={14} className="text-sage-500" />
                Demo Accounts
              </span>
            </div>
          </div>

          {/* Demo accounts */}
          <div className="space-y-4">
            {DEMO_ACCOUNTS.map((acc) => (
              <motion.button
                key={acc.role}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleDemoLogin(acc.role)}
                disabled={isLoading}
                className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all shadow-sm ${acc.color} ${isLoading ? 'opacity-50' : ''}`}
              >
                <div className="w-10 h-10 bg-white/70 backdrop-blur rounded-[12px] flex items-center justify-center flex-shrink-0">
                  <acc.icon size={20} />
                </div>
                <div className="text-left">
                  <p className="text-[15px] font-bold tracking-tight">{acc.label}</p>
                  <p className="text-[13px] font-medium opacity-80">{acc.desc}</p>
                </div>
                <ChevronRight size={18} className="ml-auto opacity-50" />
              </motion.button>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
