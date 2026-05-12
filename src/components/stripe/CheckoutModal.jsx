import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  AlertCircle,
  Calendar as CalendarIcon,
  CheckCircle,
  Clock,
  CreditCard,
  Shield,
  X
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import {
  collection,
  doc,
  getDocs,
  query,
  runTransaction,
  serverTimestamp,
  where
} from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { db, storage } from '../../lib/firebase'
import { useAuthStore } from '../../stores/authStore'
import { useChatStore } from '../../stores/chatStore'
import { getAvailableSlots, resolveProId } from '../../utils/slotUtils'
import { createNotification } from '../../stores/notificationStore'

const ACTIVE_BOOKING_STATUSES = new Set(['upcoming', 'confirmed', 'active', 'in_progress'])

const buildBookingId = (professionalId, startsAt) => {
  const iso = new Date(startsAt).toISOString().replace(/[^a-zA-Z0-9]/g, '_')
  return `booking_${professionalId}_${iso}`
}

const getSpecialtyLabel = (pro) => {
  if (Array.isArray(pro?.specialties) && pro.specialties.length > 0) {
    return pro.specialties.join(', ')
  }
  return pro?.specialties || pro?.title || 'Specialist'
}

function CheckoutForm({ pro, onClose }) {
  const navigate = useNavigate()
  const [processing, setProcessing] = useState(false)
  const [success, setSuccess] = useState(false)
  const [method, setMethod] = useState('bank')
  const [availableDays, setAvailableDays] = useState([])
  const [selectedSlot, setSelectedSlot] = useState(null)
  const [loadingSlots, setLoadingSlots] = useState(true)
  const [slotError, setSlotError] = useState(null)
  const [resolvedProId, setResolvedProId] = useState(null)
  const [proofFile, setProofFile] = useState(null)

  useEffect(() => {
    let alive = true

    async function loadData() {
      setLoadingSlots(true)
      setSlotError(null)
      setSelectedSlot(null)

      try {
        const canonicalUid = await resolveProId(pro)
        if (!alive) return
        setResolvedProId(canonicalUid)

        // Try to load slots, but catch and handle permission errors gracefully
        try {
          const days = await getAvailableSlots({ ...pro, uid: canonicalUid }, 14)
          if (!alive) return
          setAvailableDays(days)
          setSlotError(null)
        } catch (slotErr) {
          console.warn('[CheckoutModal] Slot load warning:', slotErr)
          if (!alive) return
          setSlotError(slotErr?.message?.includes('permission') 
            ? 'This professional\'s availability is currently restricted. They may need to finalize their profile setup.' 
            : (slotErr?.message || 'No available slots found.'))
          setAvailableDays([])
        }
      } catch (error) {
        console.error('[CheckoutModal] Fatal error:', error)
        if (!alive) return
        setSlotError('Could not initialize booking. Please try another professional.')
      } finally {
        if (alive) setLoadingSlots(false)
      }
    }

    loadData()

    return () => {
      alive = false
    }
  }, [pro])

  const selectableSlotCount = useMemo(
    () =>
      availableDays.reduce(
        (count, day) => count + day.slots.filter((slot) => !slot.isBooked).length,
        0
      ),
    [availableDays]
  )

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!selectedSlot) {
      alert('Please select an available time slot first.')
      return
    }

    if (!proofFile) {
      alert('Please upload a proof of transfer to confirm your booking.')
      return
    }

    setProcessing(true)

    try {
      const { user } = useAuthStore.getState()
      if (!user?.uid) {
        throw new Error('You must be signed in to book a session.')
      }
      console.log('[CheckoutModal] Step 1: User verified', user.uid)

      const canonicalProId = resolvedProId || (await resolveProId(pro))
      if (!canonicalProId) {
        throw new Error('Could not resolve professional identity. Please try again.')
      }
      console.log('[CheckoutModal] Step 2: Pro resolved', canonicalProId)

      console.log('[CheckoutModal] Step 3: Fetching latest slots...')
      const latestDays = await getAvailableSlots({ ...pro, uid: canonicalProId }, 14)
      console.log('[CheckoutModal] Step 3: Done, got', latestDays.length, 'days')

      const selectedStillFree = latestDays.some((day) =>
        day.slots.some(
          (slot) =>
            slot.startsAt.getTime() === selectedSlot.startsAt.getTime() && slot.isBooked === false
        )
      )

      if (!selectedStillFree) {
        throw new Error('This time slot was just booked by someone else. Please select another.')
      }

      const startsAtIso = new Date(selectedSlot.startsAt).toISOString()
      const bookingId = buildBookingId(canonicalProId, startsAtIso)

      const proofId = `proof_${Date.now()}_${Math.floor(Math.random() * 1000000)}`
      let fileUrl = ''
      
      try {
        const storageRef = ref(storage, `payment_proofs/${proofId}`)
        await uploadBytes(storageRef, proofFile)
        fileUrl = await getDownloadURL(storageRef)
      } catch (err) {
        console.error('[CheckoutModal] Storage upload failed:', err)
        throw new Error('Failed to upload payment proof. Please try again.')
      }

      const specialty = getSpecialtyLabel(pro)
      const bookingData = {
        patientId: user.uid,
        patientAlias: user.alias || user.name || 'Anonymous',
        professionalId: canonicalProId,
        proName: pro?.name || 'Specialist',
        proSpecialty: specialty,
        startsAt: startsAtIso,
        duration: Number(selectedSlot.duration || 50),
        status: 'upcoming',
        paymentStatus: 'pending',
        type: 'Video',
        amount: Number(pro?.pricePerSession || 3000),
        currency: pro?.currency || 'PKR',
        paymentMethod: 'bank_transfer',
        paymentProofId: proofId, 
        createdAt: serverTimestamp()
      }

      const proofDataDoc = {
        bookingId,
        patientId: user.uid,
        professionalId: canonicalProId,
        amount: Number(pro?.pricePerSession || 3000),
        currency: pro?.currency || 'PKR',
        method: 'bank_transfer',
        fileUrl,
        status: 'pending',
        createdAt: serverTimestamp()
      }

      const bookingRef = doc(db, 'bookings', bookingId)
      const proofRef = doc(db, 'payment_proofs', proofId)

      console.log('[CheckoutModal] Step 4: Running booking transaction...', bookingId)
      await runTransaction(db, async (transaction) => {
        const existingBooking = await transaction.get(bookingRef)

        if (existingBooking.exists()) {
          const existingData = existingBooking.data()
          console.log('[CheckoutModal] Step 4: Existing booking found, status:', existingData.status, 'patientId:', existingData.patientId)
          if (ACTIVE_BOOKING_STATUSES.has(existingData.status)) {
            throw new Error('This time slot has already been booked. Please choose another.')
          }
        }

        transaction.set(bookingRef, bookingData)
        transaction.set(proofRef, proofDataDoc)
      })
      console.log('[CheckoutModal] Step 4: Booking transaction SUCCESS')

      try {
        console.log('[CheckoutModal] Step 5: Creating conversation...')
        await useChatStore
          .getState()
          .ensureConversation({ ...pro, uid: canonicalProId, professionalId: canonicalProId })
        console.log('[CheckoutModal] Step 5: Conversation done')
      } catch (conversationError) {
        console.error('[CheckoutModal] Step 5: Conversation bootstrap failed:', conversationError)
      }

      // 3. Create Notifications
      try {
        console.log('[CheckoutModal] Step 6: Creating notifications...')
        // Notification for Professional
        await createNotification({
          userId: canonicalProId,
          actorId: user.uid,
          actorName: user.alias || user.name || 'Anonymous',
          type: 'booking',
          entityType: 'booking',
          entityId: bookingId,
          title: 'New Session Request',
          body: `You have a new session scheduled with ${user.alias || user.name} on ${new Date(selectedSlot.startsAt).toLocaleDateString()}. Payment proof uploaded.`,
          link: '/pro/calendar'
        });

        // Notification for Patient
        await createNotification({
          userId: user.uid,
          actorId: user.uid,
          actorName: user.alias || user.name || 'Anonymous',
          type: 'booking',
          entityType: 'booking',
          entityId: bookingId,
          title: 'Booking Confirmed',
          body: `Your session with ${pro?.name} is confirmed for ${new Date(selectedSlot.startsAt).toLocaleString()}.`,
          link: '/patient/bookings'
        });
        console.log('[CheckoutModal] Step 6: Notifications done')
      } catch (notifError) {
        console.error('[CheckoutModal] Step 6: Notification failed:', notifError)
      }

      setSuccess(true)
      setProcessing(false)

      setTimeout(() => {
        onClose()
        navigate('/patient/bookings')
      }, 1600)
    } catch (error) {
      console.error('[CheckoutModal] BOOKING FAILED at step:', error)
      console.error('[CheckoutModal] Error code:', error?.code, 'Message:', error?.message)
      setProcessing(false)
      alert(error?.message || 'There was an error processing your booking. Please try again.')
    }
  }

  if (success) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-[28px] border border-primary-light bg-white p-8 text-center"
      >
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary-light">
          <CheckCircle className="h-8 w-8 text-primary" />
        </div>
        <h3 className="mb-2 text-2xl font-bold text-neutral-900">Connection Secured</h3>
        <p className="text-neutral-600">
          Your session with <span className="font-semibold">{pro?.name}</span> is confirmed.
        </p>
      </motion.div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="rounded-[28px] border border-neutral-200 bg-surface p-5">
        <div className="mb-3 flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-lg font-bold text-primary shadow-sm">
            {pro?.currency || 'PKR'}
          </div>
          <div>
            <div className="text-xs font-bold uppercase tracking-[0.18em] text-neutral-400">
              Total Amount
            </div>
            <div className="text-3xl font-bold text-neutral-900">
              {pro?.currency || 'PKR'} {Number(pro?.pricePerSession || 3000).toLocaleString()}
              <span className="ml-1 text-base font-medium text-neutral-500">/ session</span>
            </div>
          </div>
        </div>
      </div>

      <div>
        <div className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-[0.16em] text-neutral-500">
          <CalendarIcon className="h-4 w-4 text-primary" />
          Select Appointment Time
        </div>

        {loadingSlots ? (
          <div className="rounded-[24px] border border-neutral-200 bg-neutral-50 p-6 text-center text-neutral-500">
            Finding available slots...
          </div>
        ) : slotError ? (
          <div className="rounded-[24px] border border-red-200 bg-red-50 p-5 text-sm text-red-700">
            <div className="mb-1 flex items-center gap-2 font-semibold">
              <AlertCircle className="h-4 w-4" />
              Loading Error
            </div>
            <p>{slotError}</p>
          </div>
        ) : selectableSlotCount === 0 ? (
          <div className="rounded-[24px] border border-neutral-200 bg-neutral-50 p-6 text-center">
            <div className="mb-2 text-sm font-semibold text-neutral-700">
              No available slots this week
            </div>
            <div className="text-sm text-neutral-500">Please check back later or contact support.</div>
          </div>
        ) : (
          <div className="space-y-4">
            {availableDays.map((day) => (
              <div key={day.date.toISOString()} className="rounded-[24px] border border-neutral-200 p-4">
                <div className="mb-3 text-sm font-bold text-neutral-800">
                  {day.date.toLocaleDateString(undefined, {
                    weekday: 'long',
                    month: 'short',
                    day: 'numeric'
                  })}
                </div>

                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {day.slots.map((slot) => {
                    const isSelected =
                      selectedSlot?.startsAt.getTime() === slot.startsAt.getTime()

                    return (
                      <button
                        key={slot.startsAt.toISOString()}
                        type="button"
                        onClick={() => !slot.isBooked && setSelectedSlot(slot)}
                        disabled={slot.isBooked}
                        className={`rounded-2xl border px-3 py-3 text-sm font-bold transition-all ${slot.isBooked
                            ? 'cursor-not-allowed border-neutral-100 bg-neutral-50 text-neutral-300'
                            : isSelected
                              ? 'border-primary bg-primary text-white shadow-float-primary'
                              : 'border-neutral-200 bg-white text-neutral-700 hover:border-primary-light hover:bg-primary-light/5 hover:text-primary'
                          }`}
                      >
                        <div>{slot.startsAt.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</div>
                        <div className="mt-1 text-[11px] font-medium opacity-80">
                          {slot.duration} min
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-[22px] border border-neutral-200 bg-white p-2">
        <div className="grid grid-cols-1">
          <div
            className="rounded-xl px-4 py-3 text-sm font-bold transition bg-primary text-white shadow-float-primary text-center"
          >
            Online Bank Transfer
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="rounded-[24px] border border-neutral-200 bg-surface p-5 text-sm text-neutral-700">
          <div className="mb-2 font-bold text-neutral-900">Our Bank Details</div>
          <div className="space-y-1">
            <div>Habib Bank Limited (HBL)</div>
            <div>SHARE Mental Health Pvt.</div>
            <div>PK24 HABB 0001 2345 6789 0123</div>
          </div>
        </div>

        <div className="rounded-[24px] border border-neutral-200 bg-white p-5 border-dashed">
          <label className="cursor-pointer block text-center">
            <span className="mb-3 block text-sm font-bold text-neutral-500 uppercase tracking-wider">Upload Transfer Proof</span>
            <div className="flex flex-col items-center gap-2">
              <div className="p-4 bg-primary-light/30 rounded-full text-primary">
                <Shield className="w-6 h-6" />
              </div>
              <span className="text-[14px] font-medium text-neutral-600">
                {proofFile ? proofFile.name : "Click to select screenshot/receipt"}
              </span>
              <input 
                type="file" 
                className="hidden" 
                accept="image/*,.pdf" 
                onChange={(e) => setProofFile(e.target.files[0])}
              />
            </div>
          </label>
        </div>
      </div>

      <div className="flex items-start gap-2 rounded-2xl border border-neutral-200 bg-neutral-50 p-4 text-sm text-neutral-600">
        <Shield className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
        <span>Secure and encrypted processing. Your billing details are processed through industry-standard gateways.</span>
      </div>

      <button
        type="submit"
        disabled={processing || !selectedSlot || !proofFile}
        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-5 py-4 text-sm font-bold text-white shadow-float-primary transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {processing ? (
          <>
            <Clock className="h-4 w-4 animate-spin" />
            Securing your booking...
          </>
        ) : (
          <>
            <CreditCard className="h-4 w-4" />
            Confirm Transfer & Connect
          </>
        )}
      </button>
    </form>
  )
}

export default function CheckoutModal({ isOpen, onClose, pro }) {
  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        key="checkout-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[90] flex items-center justify-center bg-neutral-950/40 p-4 backdrop-blur-sm"
      >
        <motion.div
          initial={{ opacity: 0, y: 18, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 18, scale: 0.98 }}
          className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-[32px] border border-neutral-200 bg-white shadow-2xl"
        >
          <button
            type="button"
            onClick={onClose}
            className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-full text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-900"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="border-b border-neutral-200 px-8 py-7">
            <h2 className="text-4xl font-bold text-neutral-900">Book Session</h2>
            <p className="mt-2 text-neutral-600">
              Secure your appointment with {pro?.name || 'this professional'}.
            </p>
          </div>

          <div className="p-8">
            <CheckoutForm pro={pro} onClose={onClose} />
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}