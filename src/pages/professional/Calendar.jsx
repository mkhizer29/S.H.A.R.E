import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  MessageSquare,
  Phone,
  Settings2,
  Trash2,
  Video,
  FileText
} from 'lucide-react'
import { useAuthStore } from '../../stores/authStore'
import { useBookingStore } from '../../stores/bookingStore'
import { useAvailabilityStore } from '../../stores/availabilityStore'
import ProofModal from '../../components/ui/ProofModal'

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const GRID_START_HOUR = 8
const GRID_END_HOUR = 19
const HOUR_HEIGHT_REM = 5

const addDays = (date, amount) => {
  const next = new Date(date)
  next.setDate(next.getDate() + amount)
  return next
}

const startOfWeek = (date) => {
  const next = new Date(date)
  next.setHours(0, 0, 0, 0)
  next.setDate(next.getDate() - next.getDay())
  return next
}

const isSameDay = (a, b) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate()

const dateKey = (date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const shortDate = (date) =>
  date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric'
  })

const toDate = (value) => {
  if (!value) return null
  if (value instanceof Date) return value
  if (typeof value?.toDate === 'function') return value.toDate()
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

const getSessionDuration = (session) => Number(session.duration || session.durationMinutes || 50)

const getTypeIcon = (type) => {
  const normalized = String(type || '').toLowerCase()
  if (normalized.includes('video')) return <Video className="h-3.5 w-3.5" />
  if (normalized.includes('audio') || normalized.includes('phone') || normalized.includes('call')) {
    return <Phone className="h-3.5 w-3.5" />
  }
  return <MessageSquare className="h-3.5 w-3.5" />
}

const buildAvailabilitySegments = (day, dayAvailabilities, daySessions) => {
  const sessionRanges = daySessions
    .filter((session) => session.status !== 'cancelled')
    .map((session) => {
      const start = toDate(session.startsAt)
      if (!start) return null

      const end = new Date(start.getTime() + getSessionDuration(session) * 60_000)

      return {
        start: start.getTime(),
        end: end.getTime()
      }
    })
    .filter(Boolean)

  const freeSegments = []

  dayAvailabilities.forEach((availability) => {
    const [startHour, startMinute] = String(availability.startTime || '09:00')
      .split(':')
      .map(Number)
    const [endHour, endMinute] = String(availability.endTime || '17:00')
      .split(':')
      .map(Number)

    if (
      Number.isNaN(startHour) ||
      Number.isNaN(startMinute) ||
      Number.isNaN(endHour) ||
      Number.isNaN(endMinute)
    ) {
      return
    }

    const rangeStart = new Date(day)
    rangeStart.setHours(startHour, startMinute, 0, 0)

    const rangeEnd = new Date(day)
    rangeEnd.setHours(endHour, endMinute, 0, 0)

    let segments = [{ start: rangeStart.getTime(), end: rangeEnd.getTime() }]

    sessionRanges.forEach((sessionRange) => {
      const nextSegments = []

      segments.forEach((segment) => {
        if (sessionRange.end <= segment.start || sessionRange.start >= segment.end) {
          nextSegments.push(segment)
          return
        }

        if (sessionRange.start > segment.start) {
          nextSegments.push({ start: segment.start, end: sessionRange.start })
        }

        if (sessionRange.end < segment.end) {
          nextSegments.push({ start: sessionRange.end, end: segment.end })
        }
      })

      segments = nextSegments
    })

    segments.forEach((segment) => {
      if (segment.end > segment.start) {
        freeSegments.push({
          ...availability,
          segmentStart: new Date(segment.start),
          segmentEnd: new Date(segment.end)
        })
      }
    })
  })

  return freeSegments
}

const hours = Array.from({ length: GRID_END_HOUR - GRID_START_HOUR }, (_, index) => GRID_START_HOUR + index)

const Calendar = () => {
  const { user } = useAuthStore()
  const { sessions, loadBookings, isLoading } = useBookingStore()
  const {
    availabilities,
    loadAvailability,
    isLoading: availabilityLoading
  } = useAvailabilityStore()

  const navigate = useNavigate()
  const [weekOffset, setWeekOffset] = useState(0)
  const [selectedProof, setSelectedProof] = useState(null)
  const [isProofModalOpen, setIsProofModalOpen] = useState(false)

  useEffect(() => {
    if (!user?.uid) return

    loadBookings(user.uid, 'professional')
    loadAvailability(user.uid)
  }, [user?.uid, loadBookings, loadAvailability])

  const now = new Date()
  const weekStart = useMemo(() => addDays(startOfWeek(now), weekOffset * 7), [weekOffset])
  const weekDays = useMemo(
    () => Array.from({ length: 7 }, (_, index) => addDays(weekStart, index)),
    [weekStart]
  )

  const headerTitle = useMemo(() => {
    const first = weekDays[0]
    const last = weekDays[6]
    return `${shortDate(first)} – ${shortDate(last)}, ${last.getFullYear()}`
  }, [weekDays])

  const weekEnd = useMemo(() => addDays(weekStart, 7), [weekStart])

  const weekSessions = useMemo(() => {
    return sessions
      .filter((session) => {
        const start = toDate(session.startsAt)
        return start && start >= weekStart && start < weekEnd
      })
      .sort((a, b) => new Date(a.startsAt) - new Date(b.startsAt))
  }, [sessions, weekStart, weekEnd])

  const sessionsByDate = useMemo(() => {
    const map = new Map()

    weekSessions.forEach((session) => {
      const start = toDate(session.startsAt)
      if (!start) return

      const key = dateKey(start)
      if (!map.has(key)) map.set(key, [])
      map.get(key).push(session)
    })

    return map
  }, [weekSessions])

  const todaySessions = useMemo(
    () =>
      sessions
        .filter((session) => {
          const start = toDate(session.startsAt)
          return start && isSameDay(start, now) && session.status === 'upcoming'
        })
        .sort((a, b) => new Date(a.startsAt) - new Date(b.startsAt)),
    [sessions]
  )

  const upcomingCount = sessions.filter((session) => session.status === 'upcoming').length
  const thisWeekCount = weekSessions.filter((session) => session.status === 'upcoming').length

  const timezoneLabel = Intl.DateTimeFormat().resolvedOptions().timeZone

  return (
    <>
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold text-neutral-900">Calendar</h1>
          <p className="mt-2 text-sm text-neutral-500">
            {thisWeekCount} session{thisWeekCount !== 1 ? 's' : ''} this week · {todaySessions.length} today
          </p>
        </div>

        <div className="rounded-full border border-primary-light bg-primary-light/40 px-4 py-2 text-sm font-bold text-primary">
          <CalendarIcon className="mr-2 inline h-4 w-4" />
          {upcomingCount} upcoming
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-[32px] border border-neutral-200 bg-white shadow-card"
        >
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-200 px-7 py-6">
            <div>
              <h2 className="text-2xl font-bold text-neutral-900">{headerTitle}</h2>
              <p className="mt-1 text-sm text-neutral-500">{timezoneLabel}</p>
            </div>

            <div className="flex items-center gap-2">
              {weekOffset !== 0 && (
                <button
                  type="button"
                  onClick={() => setWeekOffset(0)}
                  className="rounded-xl border border-primary-light bg-primary-light/20 px-4 py-2 text-sm font-bold text-primary transition hover:bg-primary-light/30"
                >
                  Back to today
                </button>
              )}
              <button
                type="button"
                onClick={() => setWeekOffset((current) => current - 1)}
                className="flex h-11 w-11 items-center justify-center rounded-xl border border-neutral-200 text-neutral-500 transition hover:border-primary-light hover:bg-primary-light/10 hover:text-primary"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={() => setWeekOffset(0)}
                className="rounded-xl border border-neutral-200 px-5 py-2 text-sm font-bold text-neutral-700 transition hover:border-primary-light hover:bg-primary-light/10 hover:text-primary"
              >
                Today
              </button>
              <button
                type="button"
                onClick={() => setWeekOffset((current) => current + 1)}
                className="flex h-11 w-11 items-center justify-center rounded-xl border border-neutral-200 text-neutral-500 transition hover:border-primary-light hover:bg-primary-light/10 hover:text-primary"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <div className="min-w-[1120px]">
              <div className="grid grid-cols-[90px_repeat(7,minmax(140px,1fr))] border-b border-neutral-200">
                <div className="border-r border-neutral-200 px-4 py-5 text-xs font-bold uppercase tracking-[0.18em] text-neutral-400">
                  {timezoneLabel.split('/').pop()?.replace('_', ' ')}
                </div>

                {weekDays.map((day) => {
                  const today = isSameDay(day, now)
                  return (
                    <div
                      key={dateKey(day)}
                      className="border-r border-neutral-200 px-3 py-4 text-center last:border-r-0"
                    >
                      <div className="text-xs font-bold uppercase tracking-[0.18em] text-neutral-400">
                        {DAY_LABELS[day.getDay()]}
                      </div>
                      <div
                        className={`mt-2 inline-flex h-10 w-10 items-center justify-center rounded-full text-lg font-bold ${today ? 'bg-primary text-white shadow-float-primary' : 'text-neutral-900'
                          }`}
                      >
                        {day.getDate()}
                      </div>
                    </div>
                  )
                })}
              </div>

              {isLoading || availabilityLoading ? (
                <div className="px-6 py-10 text-center text-neutral-500">Loading schedule…</div>
              ) : (
                <div className="grid grid-cols-[90px_repeat(7,minmax(140px,1fr))]">
                  <div className="relative border-r border-neutral-200">
                    {hours.map((hour) => (
                      <div
                        key={hour}
                        className="flex items-start justify-end border-b border-dashed border-neutral-100 pr-3 pt-1 text-[11px] font-semibold text-neutral-400"
                        style={{ height: `${HOUR_HEIGHT_REM}rem` }}
                      >
                        {new Date(2000, 0, 1, hour).toLocaleTimeString([], {
                          hour: 'numeric'
                        })}
                      </div>
                    ))}
                  </div>

                  {weekDays.map((day) => {
                    const key = dateKey(day)
                    const daySessions = sessionsByDate.get(key) || []
                    const dayAvailabilities = availabilities.filter(
                      (availability) =>
                        Number(availability.dayOfWeek) === day.getDay() && availability.isActive
                    )

                    const freeSegments = buildAvailabilitySegments(day, dayAvailabilities, daySessions)
                    const isToday = isSameDay(day, now)

                    return (
                      <div key={key} className="relative border-r border-neutral-200 last:border-r-0">
                        {hours.map((hour) => (
                          <div
                            key={`${key}-${hour}`}
                            className="border-b border-dashed border-neutral-100"
                            style={{ height: `${HOUR_HEIGHT_REM}rem` }}
                          />
                        ))}

                        {freeSegments.map((segment) => {
                          const start = segment.segmentStart
                          const end = segment.segmentEnd

                          const startMinutes =
                            (start.getHours() - GRID_START_HOUR) * 60 + start.getMinutes()
                          const endMinutes =
                            (end.getHours() - GRID_START_HOUR) * 60 + end.getMinutes()

                          if (endMinutes <= 0 || startMinutes >= (GRID_END_HOUR - GRID_START_HOUR) * 60) {
                            return null
                          }

                          const clampedStart = Math.max(startMinutes, 0)
                          const clampedEnd = Math.min(
                            endMinutes,
                            (GRID_END_HOUR - GRID_START_HOUR) * 60
                          )

                          const topRem = (clampedStart / 60) * HOUR_HEIGHT_REM
                          const heightRem = ((clampedEnd - clampedStart) / 60) * HOUR_HEIGHT_REM

                          if (heightRem < 0.35) return null

                          return (
                            <div
                              key={`${segment.id}-${segment.segmentStart.toISOString()}`}
                              className="absolute left-2 right-2 overflow-hidden rounded-[26px] border border-primary-light bg-primary-light/15 px-3 py-3"
                              style={{ top: `${topRem}rem`, height: `${heightRem}rem` }}
                            >
                              <div className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-primary">
                                Available
                              </div>
                              <div className="mt-1 text-xs font-semibold text-primary/80">
                                {start.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })} –{' '}
                                {end.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                              </div>
                            </div>
                          )
                        })}

                        {isToday && (() => {
                          const minutesSinceStart =
                            (now.getHours() - GRID_START_HOUR) * 60 + now.getMinutes()

                          if (
                            minutesSinceStart < 0 ||
                            minutesSinceStart > (GRID_END_HOUR - GRID_START_HOUR) * 60
                          ) {
                            return null
                          }

                          const topRem = (minutesSinceStart / 60) * HOUR_HEIGHT_REM

                          return (
                            <div
                              className="absolute left-0 right-0 z-20"
                              style={{ top: `${topRem}rem` }}
                            >
                              <div className="absolute -left-1.5 h-3 w-3 rounded-full bg-red-400" />
                              <div className="h-[2px] w-full bg-red-300" />
                            </div>
                          )
                        })()}

                        {daySessions.map((session) => {
                          const start = toDate(session.startsAt)
                          if (!start) return null

                          const minutesSinceStart =
                            (start.getHours() - GRID_START_HOUR) * 60 + start.getMinutes()

                          if (
                            minutesSinceStart < 0 ||
                            minutesSinceStart >= (GRID_END_HOUR - GRID_START_HOUR) * 60
                          ) {
                            return null
                          }

                          const duration = getSessionDuration(session)
                          const topRem = (minutesSinceStart / 60) * HOUR_HEIGHT_REM
                          const heightRem = Math.max((duration / 60) * HOUR_HEIGHT_REM, 1.1)

                          return (
                            <div
                              key={session.id}
                              className={`absolute left-2 right-2 z-10 rounded-[24px] px-3 py-3 shadow-sm ${session.status === 'cancelled'
                                ? 'border border-red-200 bg-red-50 text-red-700'
                                : 'border border-primary bg-primary text-white shadow-float-primary'
                                }`}
                              style={{ top: `${topRem}rem`, height: `${heightRem}rem` }}
                            >
                              <div className="mb-1 flex items-center gap-1 text-[11px] font-bold uppercase tracking-[0.14em] opacity-90">
                                {getTypeIcon(session.type)}
                                {start.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                              </div>
                              <div className="truncate text-sm font-bold">
                                {session.patientAlias || 'Client'}
                              </div>
                              <div className="mt-1 flex items-center justify-between gap-1 truncate text-xs opacity-90">
                                <span>{session.type || 'Session'}</span>
                                {session.paymentProof && (
                                  <div 
                                    className="flex items-center gap-1 bg-white/20 px-1.5 py-0.5 rounded-md cursor-pointer hover:bg-white/30 transition-colors"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedProof(session);
                                      setIsProofModalOpen(true);
                                    }}
                                  >
                                    <FileText size={12} strokeWidth={2.5} />
                                    <span className="text-[10px] font-bold uppercase">Proof</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </motion.div>

        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, x: 14 }}
            animate={{ opacity: 1, x: 0 }}
            className="rounded-[32px] border border-neutral-200 bg-white p-6 shadow-card"
          >
            <h3 className="text-2xl font-bold text-neutral-900">Today&apos;s Sessions</h3>
            <p className="mt-1 text-sm text-neutral-500">
              {now.toLocaleDateString(undefined, {
                weekday: 'long',
                month: 'long',
                day: 'numeric'
              })}
            </p>

            <div className="mt-5 space-y-4">
              {todaySessions.length === 0 ? (
                <div className="rounded-[24px] border border-neutral-200 bg-neutral-50 p-8 text-center">
                  <CalendarIcon className="mx-auto h-8 w-8 text-neutral-300" />
                  <div className="mt-3 text-sm font-semibold text-neutral-700">No sessions today</div>
                  <div className="mt-1 text-sm text-neutral-500">Enjoy your free time!</div>
                </div>
              ) : (
                todaySessions.map((session) => {
                  const start = toDate(session.startsAt)
                  return (
                    <div
                      key={session.id}
                      className="rounded-[24px] border border-neutral-200 bg-surface p-5"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-light text-sm font-bold text-primary">
                          {(session.patientAlias || 'C').slice(0, 2).toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="truncate font-bold text-neutral-900">
                            {session.patientAlias || 'Client'}
                          </div>
                          <div className="mt-1 flex items-center gap-2 text-sm text-neutral-500">
                            {getTypeIcon(session.type)}
                            <span>
                              {start?.toLocaleTimeString([], {
                                hour: 'numeric',
                                minute: '2-digit'
                              })}
                            </span>
                            {session.type ? <span>· {session.type}</span> : null}
                          </div>
                        </div>
                        {session.paymentProof && (
                          <button 
                            onClick={() => {
                              setSelectedProof(session);
                              setIsProofModalOpen(true);
                            }}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary-light text-primary hover:bg-primary-light/80 transition-all text-[11px] font-bold"
                          >
                            <FileText size={14} strokeWidth={2.5} />
                            <span>PROOF</span>
                          </button>
                        )}
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 14 }}
            animate={{ opacity: 1, x: 0 }}
            className="rounded-[32px] border border-neutral-200 bg-white p-6 shadow-card"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-light/20 text-primary">
                <Settings2 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-neutral-900">Availability</h3>
                <p className="text-sm text-neutral-500">Manage working hours</p>
              </div>
            </div>

            <div className="mt-5 rounded-[24px] border border-neutral-200 bg-surface p-5">
              <div className="text-center text-neutral-700">
                <span className="font-bold">{availabilities.length}</span> active schedule rule
                {availabilities.length !== 1 ? 's' : ''}
              </div>

              <button
                type="button"
                onClick={() => navigate('/pro/manage-schedule')}
                className="mt-5 flex w-full items-center justify-center rounded-2xl bg-primary px-5 py-4 text-sm font-bold text-white shadow-float-primary transition hover:opacity-95"
              >
                Manage Schedule
              </button>
            </div>
          </motion.div>
        </div>
      </div>
      <ProofModal 
        isOpen={isProofModalOpen} 
        onClose={() => setIsProofModalOpen(false)} 
        proofData={selectedProof?.paymentProof}
        sessionData={selectedProof}
      />
    </>
  )
}

export default Calendar
