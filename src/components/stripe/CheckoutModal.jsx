import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Shield, X, CreditCard, CheckCircle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Elements } from '@stripe/react-stripe-js'
import { stripePromise } from '../../lib/stripe'
import Button from '../ui/Button'
import Input from '../ui/Input'

function CheckoutForm({ pro, onClose }) {
  const navigate = useNavigate()
  const [processing, setProcessing] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    setProcessing(true)
    
    // Simulate API call to Stripe and Firestore backend
    setTimeout(() => {
      setProcessing(false)
      setSuccess(true)
      setTimeout(() => {
        onClose()
        navigate('/patient/chat')
      }, 2000)
    }, 2000)
  }

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-20 h-20 bg-sage-50 rounded-full flex items-center justify-center mb-6"
        >
          <CheckCircle size={40} className="text-sage-500" />
        </motion.div>
        <h3 className="text-2xl font-bold text-text-main mb-2">Payment Secured</h3>
        <p className="text-text-muted">You are now securely connected to {pro?.name || 'your professional'}. An encrypted channel has been established.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-lilac-50 p-6 rounded-2xl border border-lilac-100 flex items-center gap-4">
        <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center flex-shrink-0">
          <CreditCard className="text-violet-600" />
        </div>
        <div>
          <p className="text-text-muted text-[13px] font-bold uppercase tracking-wider mb-0.5">Total Amount</p>
          <p className="text-2xl font-bold text-text-main">$120.00 <span className="text-[15px] font-medium text-text-muted">/ session</span></p>
        </div>
      </div>

      <div className="space-y-4">
        <Input label="Name on Card" placeholder="Alias or Real Name" required />
        <Input label="Card Number" placeholder="•••• •••• •••• ••••" required type="text" />
        <div className="grid grid-cols-2 gap-4">
          <Input label="Expiry (MM/YY)" placeholder="12/25" required />
          <Input label="CVC" placeholder="•••" required type="password" />
        </div>
      </div>

      <div className="flex items-center gap-2 text-[12px] font-medium text-text-muted bg-[#F8F7FA] p-4 rounded-xl">
        <Shield size={14} className="text-violet-600 flex-shrink-0" />
        Payments are processed securely by Stripe. Your billing details are never stored on our servers to maintain absolute anonymity.
      </div>

      <motion.button
        type="submit"
        disabled={processing}
        whileTap={{ scale: 0.98 }}
        className="w-full bg-violet-600 text-white py-4 rounded-2xl font-bold hover:bg-violet-700 shadow-soft transition-colors flex items-center justify-center"
      >
        {processing ? (
          <span className="flex items-center gap-2">Processing Payment...</span>
        ) : (
          `Pay $120.00 Securely`
        )}
      </motion.button>
    </form>
  )
}

export default function CheckoutModal({ isOpen, onClose, pro }) {
  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center px-4 font-sans">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-text-main/20 backdrop-blur-sm"
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-float p-8 z-10"
        >
          <button
            onClick={onClose}
            className="absolute top-6 right-6 w-10 h-10 bg-surface-warm rounded-full flex items-center justify-center text-text-muted hover:text-text-main transition-colors"
          >
            <X size={20} />
          </button>

          <h2 className="text-[28px] font-bold text-text-main tracking-tight mb-2">Book Session</h2>
          <p className="text-text-muted font-medium mb-8">Secure your appointment with {pro?.name}.</p>

          <Elements stripe={stripePromise}>
            <CheckoutForm pro={pro} onClose={onClose} />
          </Elements>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
