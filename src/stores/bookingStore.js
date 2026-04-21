import { create } from 'zustand'

const SESSIONS = [
  { id: 's1', proName: 'Dr. Aisha Raza', proSpecialty: 'Anxiety & Trauma', date: '2026-04-10', time: '3:00 PM', duration: 50, status: 'upcoming', type: 'Video', amount: 4500 },
  { id: 's2', proName: 'Dr. Omar Shaikh', proSpecialty: 'Depression & CBT', date: '2026-04-14', time: '11:00 AM', duration: 60, status: 'upcoming', type: 'Text', amount: 3800 },
  { id: 's3', proName: 'Dr. Aisha Raza', proSpecialty: 'Anxiety & Trauma', date: '2026-04-03', time: '3:00 PM', duration: 50, status: 'completed', rating: 5, note: 'Great session on breathing techniques.', amount: 4500 },
  { id: 's4', proName: 'Dr. Omar Shaikh', proSpecialty: 'Depression & CBT', date: '2026-03-28', time: '11:00 AM', duration: 60, status: 'completed', rating: 4, note: 'Discussed CBT worksheets.', amount: 3800 },
  { id: 's5', proName: 'Dr. Priya Menon', proSpecialty: 'Grief & Loss', date: '2026-03-20', time: '2:30 PM', duration: 45, status: 'completed', rating: 5, note: null, amount: 3200 },
  { id: 's6', proName: 'Dr. Aisha Raza', proSpecialty: 'Anxiety & Trauma', date: '2026-03-12', time: '3:00 PM', duration: 50, status: 'cancelled', amount: 0 },
]

export const useBookingStore = create((set) => ({
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
