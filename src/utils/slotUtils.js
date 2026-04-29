import {
  collection,
  query,
  where,
  getDocs,
  getDoc,
  doc,
  limit
} from 'firebase/firestore'
import { db } from '../lib/firebase'
import { useAuthStore } from '../stores/authStore'

const ACTIVE_BOOKING_STATUSES = new Set(['upcoming', 'confirmed', 'active', 'in_progress'])

const looksLikeUid = (value) =>
  typeof value === 'string' && value.length >= 20 && !value.includes(' ')

const toDate = (value) => {
  if (!value) return null
  if (value instanceof Date) return value
  if (typeof value?.toDate === 'function') return value.toDate()
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

const getBookingDurationMinutes = (booking) =>
  Number(booking.duration || booking.durationMinutes || 50)

const normalizeName = (value) => (typeof value === 'string' ? value.trim() : '')

/**
 * Resolve the canonical Firebase Auth UID for a professional.
 * We prefer explicit uid-style fields. If the directory only gives us
 * a Firestore document id, we inspect that document for uid/userId/professionalId.
 */
export const resolveProId = async (pro) => {
  if (!pro) return null

  const directCandidates = [
    pro?.uid,
    pro?.userId,
    pro?.professionalId,
    pro?.ownerUid,
    typeof pro === 'string' ? pro : pro?.id
  ].filter(Boolean)

  for (const candidate of directCandidates) {
    if (looksLikeUid(candidate)) return candidate
  }

  try {
    const docCandidate = typeof pro === 'string' ? pro : pro?.id
    if (docCandidate && typeof docCandidate === 'string') {
      const proDoc = await getDoc(doc(db, 'professionals', docCandidate))
      if (proDoc.exists()) {
        const data = proDoc.data()
        const resolved =
          data.uid ||
          data.userId ||
          data.professionalId ||
          (looksLikeUid(proDoc.id) ? proDoc.id : null)

        if (resolved) return resolved
      }
    }

    const searchName =
      normalizeName(pro?.name) ||
      normalizeName(pro?.alias) ||
      (typeof pro === 'string' ? normalizeName(pro) : '')

    if (searchName) {
      // Prioritize name query on professionals (public)
      const professionalNameQuery = query(
        collection(db, 'professionals'),
        where('name', '==', searchName),
        limit(1)
      )
      const professionalNameSnap = await getDocs(professionalNameQuery)

      if (!professionalNameSnap.empty) {
        const data = professionalNameSnap.docs[0].data()
        const resolved = data.uid || data.userId || data.professionalId || (looksLikeUid(professionalNameSnap.docs[0].id) ? professionalNameSnap.docs[0].id : null)
        if (resolved) return resolved
      }

      // Only attempt user lookup if authenticated and name query failed
      const { user } = useAuthStore.getState()
      if (user?.uid) {
        try {
          const userAliasQuery = query(collection(db, 'users'), where('alias', '==', searchName), limit(1))
          const userAliasSnap = await getDocs(userAliasQuery)
          if (!userAliasSnap.empty) return userAliasSnap.docs[0].id
        } catch (e) {
          console.warn('[resolveProId] User alias fallback failed:', e.message)
        }
      }
    }
  } catch (error) {
    console.error('[resolveProId] Resolution failed:', error)
  }

  return null
}

export const getAvailableSlots = async (pro, daysCount = 14) => {
  const resolvedId = await resolveProId(pro)
  if (!resolvedId) {
    throw new Error('Could not resolve the selected professional.')
  }

  const proId = resolvedId || (typeof pro === 'string' ? pro : pro?.id)
  if (!proId) return []

  // Fetch specifically for this professional to avoid permission/index issues
  const availabilitySnap = await getDocs(
    query(collection(db, 'availability'), where('professionalId', '==', proId))
  )
  const rules = availabilitySnap.docs
    .map((snap) => ({
      id: snap.id,
      ...snap.data()
    }))
    .filter((rule) => rule.isActive !== false)

  if (rules.length === 0) {
    return []
  }

  const now = new Date()
  const rangeStart = new Date(now)
  rangeStart.setHours(0, 0, 0, 0)

  const rangeEnd = new Date(rangeStart)
  rangeEnd.setDate(rangeEnd.getDate() + daysCount)

  // Fetch specifically for this professional and status
  const bookingsSnap = await getDocs(
    query(collection(db, 'bookings'), where('professionalId', '==', proId))
  )
  const bookings = bookingsSnap.docs
    .map((snap) => {
      const data = snap.data()
      const startsAt = toDate(data.startsAt)
      if (!startsAt) return null

      return {
        id: snap.id,
        ...data,
        startsAt,
        duration: getBookingDurationMinutes(data)
      }
    })
    .filter(Boolean)
    .filter((booking) => 
      booking.professionalId === proId && 
      ACTIVE_BOOKING_STATUSES.has(booking.status) &&
      booking.startsAt >= rangeStart && 
      booking.startsAt < rangeEnd
    )

  const days = []

  for (let offset = 0; offset < daysCount; offset += 1) {
    const currentDay = new Date(rangeStart)
    currentDay.setDate(rangeStart.getDate() + offset)
    currentDay.setHours(0, 0, 0, 0)

    const currentDayOfWeek = currentDay.getDay()
    const dayRules = rules
      .filter((rule) => Number(rule.dayOfWeek) === currentDayOfWeek && rule.isActive)
      .sort((a, b) => a.startTime.localeCompare(b.startTime))

    const daySlots = []

    for (const rule of dayRules) {
      const [startHour, startMinute] = String(rule.startTime || '09:00')
        .split(':')
        .map(Number)
      const [endHour, endMinute] = String(rule.endTime || '17:00')
        .split(':')
        .map(Number)

      if (
        Number.isNaN(startHour) ||
        Number.isNaN(startMinute) ||
        Number.isNaN(endHour) ||
        Number.isNaN(endMinute)
      ) {
        continue
      }

      const slotDuration = Number(rule.slotDuration || 50)
      const breakMinutes = Number(rule.breakMinutes || 10)

      let slotStart = new Date(currentDay)
      slotStart.setHours(startHour, startMinute, 0, 0)

      const dayEnd = new Date(currentDay)
      dayEnd.setHours(endHour, endMinute, 0, 0)

      while (slotStart < dayEnd) {
        const slotEnd = new Date(slotStart.getTime() + slotDuration * 60_000)

        if (slotEnd > dayEnd) break

        if (slotStart > now) {
          const isBooked = bookings.some((booking) => {
            const bookingStart = booking.startsAt.getTime()
            const bookingEnd = bookingStart + booking.duration * 60_000
            const slotStartMs = slotStart.getTime()
            const slotEndMs = slotEnd.getTime()

            return slotStartMs < bookingEnd && slotEndMs > bookingStart
          })

          daySlots.push({
            startsAt: new Date(slotStart),
            endsAt: new Date(slotEnd),
            duration: slotDuration,
            breakMinutes,
            isBooked
          })
        }

        slotStart = new Date(slotEnd.getTime() + breakMinutes * 60_000)
      }
    }

    if (daySlots.length > 0) {
      days.push({
        date: currentDay,
        slots: daySlots.sort((a, b) => a.startsAt - b.startsAt)
      })
    }
  }

  return days
}