import { create } from 'zustand'

const now = new Date()
const tenMinsFromNow = new Date(now.getTime() + 10 * 60000).toISOString()
const oneHourAgo = new Date(now.getTime() - 60 * 60000).toISOString()
const yesterday = new Date(now.getTime() - 86400000).toISOString()
const nextWeek = new Date(now.getTime() + 7 * 86400000).toISOString()

const SESSIONS = [
  { id: 's0', proName: 'Dr. Sarah Jenkins', proSpecialty: 'Ph.D, Licensed Psychologist', startsAt: tenMinsFromNow, duration: 50, status: 'upcoming', type: 'Voice Session', amount: 4500 },
  { id: 's1', proName: 'Dr. Aisha Raza', proSpecialty: 'Anxiety & Trauma', startsAt: nextWeek, duration: 50, status: 'upcoming', type: 'Video', amount: 4500 },
  { id: 's2', proName: 'Dr. Omar Shaikh', proSpecialty: 'Depression & CBT', startsAt: yesterday, duration: 60, status: 'upcoming', type: 'Text', amount: 3800 },
  { id: 's3', proName: 'Dr. Aisha Raza', proSpecialty: 'Anxiety & Trauma', startsAt: oneHourAgo, duration: 50, status: 'completed', rating: 5, note: 'Great session on breathing techniques.', amount: 4500 },
  { id: 's4', proName: 'Dr. Omar Shaikh', proSpecialty: 'Depression & CBT', startsAt: yesterday, duration: 60, status: 'completed', rating: 4, note: 'Discussed CBT worksheets.', amount: 3800 },
]

export const useBookingStore = create((set, get) => ({
  sessions: SESSIONS,

  cancelSession: (id) => {
    set((state) => ({
      sessions: state.sessions.map((s) => s.id === id ? { ...s, status: 'cancelled' } : s),
    }))
  },

  rateSession: (id, rating) => {
    set((state) => ({
      sessions: state.sessions.map((s) => s.id === id ? { ...s, rating } : s),
    }))
  },

  getUpcoming: () => get().sessions.filter((s) => s.status === 'upcoming'),
  getPast: () => get().sessions.filter((s) => s.status === 'completed' || s.status === 'cancelled'),
}))
