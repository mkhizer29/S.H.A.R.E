import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Shield, X, CreditCard, CheckCircle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Elements } from '@stripe/react-stripe-js'
import { stripePromise } from '../../lib/stripe'
import { db } from '../../lib/firebase'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { useAuthStore } from '../../stores/authStore'
import Button from '../ui/Button'
import Input from '../ui/Input'

function CheckoutForm({ pro, onClose }) {
  const navigate = useNavigate()
  const [processing, setProcessing] = useState(false)
  const [success, setSuccess] = useState(false)
  const [method, setMethod] = useState('card') // 'card' or 'bank'

  const handleSubmit = async (e) => {
    e.preventDefault()
    setProcessing(true)
    
    try {
      const { user } = useAuthStore.getState();
      
      if (!user) {
        throw new Error("You must be signed in to book a session.");
      }

      // 1. Create the booking object
      const bookingData = {
        patientId: user.uid,
        patientAlias: user.alias || user.name || 'Anonymous',
        professionalId: pro.id || pro.uid || 'demo-pro',
        proName: pro.name,
        proSpecialty: pro.specialties?.join(', ') || pro.specialty || 'Professional',
        startsAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Default to tomorrow for demo
        duration: 50,
        status: 'upcoming',
        type: 'Video',
        amount: pro.pricePerSession || 3000,
        currency: pro.currency || 'PKR',
        createdAt: serverTimestamp()
      }

      // 2. Write to Firestore
      await addDoc(collection(db, 'bookings'), bookingData);

      setProcessing(false)
      setSuccess(true)
      
      // Delay navigation so user sees the success state
      setTimeout(() => {
        onClose()
        navigate('/patient/bookings')
      }, 2000)
    } catch (error) {
      console.error("Payment/Booking Error:", error);
      setProcessing(false);
      alert(error.message || "There was an error processing your booking. Please try again.");
    }
  }

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-6"
        >
          <CheckCircle size={40} className="text-green-500" />
        </motion.div>
        <h3 className="text-2xl font-bold text-neutral-900 mb-2">Connection Secured</h3>
        <p className="text-neutral-500">Your session with {pro?.name} is confirmed. A secure, encrypted channel has been established for your privacy.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Price Display */}
      <div className="bg-primary-light/40 p-6 rounded-[24px] border border-primary-light flex items-center gap-4">
        <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center flex-shrink-0 font-bold text-primary">
          {pro?.currency || 'PKR'}
        </div>
        <div>
          <p className="text-neutral-500 text-[13px] font-bold uppercase tracking-wider mb-0.5">Total Amount</p>
          <p className="text-2xl font-bold text-neutral-900">{pro?.currency || 'PKR'} {pro?.pricePerSession?.toLocaleString() || '3,000'} <span className="text-[15px] font-medium text-neutral-400">/ session</span></p>
        </div>
      </div>

      {/* Method Selection */}
      <div className="flex p-1 bg-surface-tinted rounded-2xl">
        <button
          onClick={() => setMethod('card')}
          className={`flex-1 py-3 text-[14px] font-bold rounded-xl transition-all ${method === 'card' ? 'bg-white text-primary shadow-sm' : 'text-neutral-500 hover:text-neutral-900'}`}
        >
          Credit/Debit Card
        </button>
        <button
          onClick={() => setMethod('bank')}
          className={`flex-1 py-3 text-[14px] font-bold rounded-xl transition-all ${method === 'bank' ? 'bg-white text-primary shadow-sm' : 'text-neutral-500 hover:text-neutral-900'}`}
        >
          Online Transfer
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {method === 'card' ? (
          <div className="space-y-4">
            <Input label="Name on Card" placeholder="Optional for Anonymity" required />
            <Input label="Card Number" placeholder="•••• •••• •••• ••••" required type="text" />
            <div className="grid grid-cols-2 gap-4">
              <Input label="Expiry (MM/YY)" placeholder="12/25" required />
              <Input label="CVC" placeholder="•••" required type="password" />
            </div>
          </div>
        ) : (
          <div className="space-y-4 bg-surface-tinted p-6 rounded-[24px] border border-neutral-200">
            <h4 className="text-[14px] font-bold text-neutral-900 uppercase tracking-wide mb-2">Our Bank Details</h4>
            <div className="space-y-3">
              <div>
                <p className="text-[11px] font-bold text-neutral-400 uppercase">Bank Name</p>
                <p className="font-semibold text-neutral-800">Habib Bank Limited (HBL)</p>
              </div>
              <div>
                <p className="text-[11px] font-bold text-neutral-400 uppercase">Account Title</p>
                <p className="font-semibold text-neutral-800">SHARE Mental Health Pvt.</p>
              </div>
              <div>
                <p className="text-[11px] font-bold text-neutral-400 uppercase">Account Number / IBAN</p>
                <p className="font-mono font-bold text-primary select-all cursor-pointer" title="Click to copy">PK24 HABB 0001 2345 6789 0123</p>
              </div>
            </div>
            <p className="text-[12px] font-medium text-neutral-500 pt-2 italic">
              Please upload a screenshot of the receipt in the chat once connected.
            </p>
          </div>
        )}

        <div className="flex items-center gap-2 text-[12px] font-medium text-neutral-500 bg-surface-tinted/50 p-4 rounded-xl border border-neutral-100">
          <Shield size={14} className="text-primary flex-shrink-0" />
          Secure & Encrypted Processing. Your billing details are processed through industry-standard gateways.
        </div>

        <Button
          type="submit"
          loading={processing}
          className="w-full py-4 !rounded-2xl font-bold transition-all shadow-float"
        >
          Confirm Payment & Connect
        </Button>
      </form>
    </div>
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
          className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-float z-10 overflow-hidden max-h-[90vh] flex flex-col"
        >
          {/* Close button - Fixed to top right */}
          <button
            onClick={onClose}
            className="absolute top-6 right-6 w-10 h-10 bg-surface-warm/80 backdrop-blur-sm rounded-full flex items-center justify-center text-text-muted hover:text-text-main transition-colors z-20"
          >
            <X size={20} />
          </button>
          
          {/* Scrollable content area */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
            <h2 className="text-[28px] font-bold text-text-main tracking-tight mb-2 pr-10">Book Session</h2>
            <p className="text-text-muted font-medium mb-8">Secure your appointment with {pro?.name}.</p>
  
            <Elements stripe={stripePromise}>
              <CheckoutForm pro={pro} onClose={onClose} />
            </Elements>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
