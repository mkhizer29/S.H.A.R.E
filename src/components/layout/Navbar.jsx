import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Shield, Menu, X } from 'lucide-react'
import { useState } from 'react'
import { useAuthStore } from '../../stores/authStore'
import Button from '../ui/Button'

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const { isAuthenticated, role, logout } = useAuthStore()
  const navigate = useNavigate()

  const handleGetStarted = () => navigate('/signup')
  const handleSignIn = () => navigate('/signin')
  const handleDashboard = () => {
    if (role === 'patient') navigate('/patient')
    else if (role === 'professional') navigate('/pro')
    else navigate('/admin')
  }

  const handleScroll = (id) => {
    if (window.location.pathname !== '/') {
      navigate('/');
      setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }), 100);
    } else {
      if (id === 'top') window.scrollTo({ top: 0, behavior: 'smooth' });
      else document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    }
    setMenuOpen(false);
  }

  return (
    <nav className="sticky top-0 left-0 right-0 z-50 bg-surface-warm/80 backdrop-blur-xl border-b border-lilac-100/50">
      <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center group">
          <img src="/logo.jpg" alt="SHARE Logo" className="h-10 object-contain group-hover:-translate-y-0.5 transition-transform mix-blend-multiply" />
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-14">
          <button onClick={() => handleScroll('top')} className="text-[20px] font-semibold text-neutral-500 hover:text-primary transition-colors">Home</button>
          <button onClick={() => handleScroll('about')} className="text-[20px] font-semibold text-neutral-500 hover:text-primary transition-colors">About</button>
          <button onClick={() => handleScroll('how-it-works')} className="text-[20px] font-semibold text-neutral-500 hover:text-primary transition-colors">How It Works</button>
          <button onClick={() => handleScroll('features')} className="text-[20px] font-semibold text-neutral-500 hover:text-primary transition-colors">Features</button>
        </div>

        {/* Actions */}
        <div className="hidden md:flex items-center gap-3">
          {isAuthenticated ? (
            <>
              <Button variant="ghost" size="md" onClick={handleDashboard} className="font-bold">Dashboard</Button>
              <Button variant="secondary" size="md" onClick={logout} className="font-bold">Sign Out</Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="md" onClick={handleSignIn} className="font-bold text-[16px]">Sign In</Button>
              <Button variant="primary" size="md" onClick={handleGetStarted} className="text-[16px] px-6">Get Started</Button>
            </>
          )}
        </div>

        {/* Mobile burger */}
        <button
          className="md:hidden p-4 rounded-xl text-neutral-500 hover:bg-primary-light hover:text-primary transition-colors"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-neutral-200 bg-surface shadow-float"
          >
            <div className="px-6 py-6 flex flex-col gap-5">
              <button onClick={() => handleScroll('top')} className="text-[20px] font-semibold text-neutral-500 text-left">Home</button>
              <button onClick={() => handleScroll('about')} className="text-[20px] font-semibold text-neutral-500 text-left">About</button>
              <button onClick={() => handleScroll('how-it-works')} className="text-[20px] font-semibold text-neutral-500 text-left">How It Works</button>
              <button onClick={() => handleScroll('features')} className="text-[20px] font-semibold text-neutral-500 text-left">Features</button>
              <div className="pt-4 flex flex-col gap-3 border-t border-neutral-200">
                {isAuthenticated ? (
                  <Button variant="primary" size="md" onClick={handleDashboard}>Dashboard</Button>
                ) : (
                  <>
                    <Button variant="ghost" size="md" onClick={handleSignIn}>Sign In</Button>
                    <Button variant="primary" size="md" onClick={handleGetStarted}>Get Started</Button>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}
