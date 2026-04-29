import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Shield, X, CreditCard, CheckCircle, Calendar as CalendarIcon, Clock, ChevronRight, AlertCircle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Elements } from '@stripe/react-stripe-js'
import { stripePromise } from '../../lib/stripe'
import { db } from '../../lib/firebase'
import { collection, addDoc, serverTimestamp, query, where, getDocs, doc, runTransaction } from 'firebase/firestore'
import { useAuthStore } from '../../stores/authStore'
import { useChatStore } from '../../stores/chatStore'
import { getAvailableSlots, resolveProId } from '../../utils/slotUtils'
import Button from '../ui/Button'
import Input from '../ui/Input'

function CheckoutForm({ pro, onClose }) {
  const navigate = useNavigate()
  const [processing, setProcessing] = useState(false)
  const [success, setSuccess] = useState(false)
  const [method, setMethod] = useState('card') // 'card' or 'bank'
  const [availableDays, setAvailableDays] = useState([])
  const [selectedSlot, setSelectedSlot] = useState(null)
  const [loadingSlots, setLoadingSlots] = useState(true)
  const [slotError, setSlotError] = useState(null)
  const [resolvedProId, setResolvedProId] = useState(null)

  useEffect(() => {
    async function loadData() {
      setLoadingSlots(true);
      setSlotError(null);
      try {
        const uid = await resolveProId(pro);
        setResolvedProId(uid);
        if (uid) {
          const days = await getAvailableSlots(pro);
          setAvailableDays(days);
        } else {
          setSlotError("Could not identify this professional. Please try another.");
        }
      } catch (err) {
        console.error("Error loading slots:", err);
        setSlotError("Failed to load availability. Please try refreshing or contact support.");
      } finally {
        setLoadingSlots(false);
      }
    }
    loadData();
  }, [pro]);

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!selectedSlot) {
      alert("Please select an available time slot first.");
      return;
    }

    setProcessing(true)
    
    try {
      const { user } = useAuthStore.getState();
      
      if (!user) {
        throw new Error("You must be signed in to book a session.");
      }

      // Re-resolve ID to be absolutely sure we have the canonical UID
      const canonicalProId = resolvedProId || (await resolveProId(pro));
      if (!canonicalProId) {
        throw new Error("Could not resolve professional identity. Please try again.");
      }

      // 0. Double-check if the slot is STILL available in Firestore
      console.log('[Checkout] Re-checking slot availability for:', canonicalProId);
      const currentSlots = await getAvailableSlots(pro);
      const isStillAvailable = currentSlots.some(day => 
        day.slots.some(slot => !slot.isBooked && slot.startsAt.getTime() === selectedSlot.startsAt.getTime())
      );

      if (!isStillAvailable) {
        throw new Error("This time slot was just booked by someone else. Please select another time.");
      }

      const specialty = Array.isArray(pro.specialties) ? pro.specialties.join(', ') : (pro.specialties || pro.title || 'Specialist')

      // 1. Create the booking object with canonical UID
      const bookingData = {
        patientId: user.uid,
        patientAlias: user.alias || user.name || 'Anonymous',
        professionalId: canonicalProId,
        proName: pro.name || 'Specialist',
        proSpecialty: specialty,
        startsAt: selectedSlot.startsAt.toISOString(),
        duration: selectedSlot.duration || 50,
        status: 'upcoming',
        type: 'Video',
        amount: pro.pricePerSession || 3000,
        currency: pro.currency || 'PKR',
        createdAt: serverTimestamp()
      }

      console.log('[Checkout] Creating real booking in Firestore with collision check:', bookingData);

      // 2. Write to Firestore with collision check
      // We use a transaction to ensure atomicity
      await runTransaction(db, async (transaction) => {
        // Query for existing upcoming bookings for this professional at this exact time
        const q = query(
          collection(db, 'bookings'),
          where('professionalId', '==', canonicalProId),
          where('startsAt', '==', bookingData.startsAt),
          where('status', '==', 'upcoming')
        );
        const snapshot = await getDocs(q);
        
        if (!snapshot.empty) {
          throw new Error("Conflict: This slot was just confirmed for another patient.");
        }

        // Proceed to create booking
        const newBookingRef = doc(collection(db, 'bookings'));
        transaction.set(newBookingRef, bookingData);
      });

      // 3. Ensure a conversation exists for the chat system
      await useChatStore.getState().ensureConversation(pro);

      setProcessing(false)
      setSuccess(true)
      
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

      {/* Slot Selection */}
      <div className="space-y-4">
        <h4 className="text-[14px] font-bold text-neutral-900 uppercase tracking-wide flex items-center gap-2">
          <CalendarIcon size={16} className="text-primary" />
          Select Appointment Time
        </h4>

        {loadingSlots ? (
          <div className="py-8 flex flex-col items-center gap-3 bg-surface-tinted rounded-[24px] border border-dashed border-neutral-200">
            <div className="w-8 h-8 border-3 border-primary/20 border-t-primary rounded-full animate-spin" />
            <p className="text-neutral-400 font-medium text-xs">Finding available slots...</p>
          </div>
        ) : slotError ? (
          <div className="py-8 px-6 text-center bg-red-50 rounded-[24px] border border-dashed border-red-200">
            <AlertCircle size={24} className="text-red-400 mx-auto mb-2" />
            <p className="text-red-600 font-bold text-sm">Loading Error</p>
            <p className="text-red-500 text-xs mt-1">{slotError}</p>
          </div>
        ) : availableDays.length === 0 ? (
          <div className="py-8 px-6 text-center bg-surface-tinted rounded-[24px] border border-dashed border-neutral-200">
            <AlertCircle size={24} className="text-neutral-300 mx-auto mb-2" />
            <p className="text-neutral-500 font-medium text-sm">No available slots this week</p>
            <p className="text-neutral-400 text-xs mt-1">Please check back later or contact support.</p>
          </div>
        ) : (
          <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
            {availableDays.map((day) => (
              <div key={day.date.toISOString()} className="space-y-2">
                <p className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest px-1">
                  {day.date.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {day.slots.map((slot) => {
                    const isSelected = selectedSlot?.startsAt.getTime() === slot.startsAt.getTime();
                    const isBooked = slot.isBooked;

                    return (
                      <button
                        key={slot.startsAt.toISOString()}
                        type="button"
                        onClick={() => !isBooked && setSelectedSlot(slot)}
                        disabled={isBooked}
                        className={`py-3 px-2 rounded-2xl text-[13px] font-bold transition-all border
                          ${isBooked
                            ? 'bg-neutral-50 border-neutral-100 text-neutral-300 cursor-not-allowed'
                            : isSelected
                              ? 'bg-primary border-primary text-white shadow-float-primary'
                              : 'bg-white border-neutral-200 text-neutral-700 hover:border-primary-light hover:bg-primary-light/5 hover:text-primary'
                          }`}
                      >
                        {slot.startsAt.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                        {isBooked && <span className="block text-[9px] mt-0.5 opacity-60">Booked</span>}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Method Selection */}
      <div className="flex p-1 bg-surface-tinted rounded-2xl">
        <button
          type="button"
          onClick={() => setMethod('card')}
          className={`flex-1 py-3 text-[14px] font-bold rounded-xl transition-all ${method === 'card' ? 'bg-white text-primary shadow-sm' : 'text-neutral-500 hover:text-neutral-900'}`}
        >
          Credit/Debit Card
        </button>
        <button
          type="button"
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
