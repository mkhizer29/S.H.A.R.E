import { create } from 'zustand'

const MOOD_LABELS = { 1: 'Very Low', 2: 'Low', 3: 'Okay', 4: 'Good', 5: 'Great' }
const MOOD_EMOJIS = { 1: '😔', 2: '😟', 3: '😐', 4: '🙂', 5: '😊' }

const generateHistory = () => {
  const entries = []
  const now = new Date()
  for (let i = 29; i >= 1; i--) {
    const date = new Date(now)
    date.setDate(date.getDate() - i)
    const score = Math.floor(Math.random() * 3) + 2 + (i < 10 ? 1 : 0)
    entries.push({
      id: `mood-${i}`,
      score: Math.min(5, score),
      label: MOOD_LABELS[Math.min(5, score)],
      emoji: MOOD_EMOJIS[Math.min(5, score)],
      date: date.toISOString().split('T')[0],
      note: i % 7 === 0 ? 'After therapy session' : null,
    })
  }
  return entries
}

export const useMoodStore = create((set, get) => ({
  history: generateHistory(),
  checkedToday: false,
  todayScore: null,
  showModal: false,

  openModal: () => set({ showModal: true }),
  closeModal: () => set({ showModal: false }),

  submitMood: (score) => {
    const today = new Date().toISOString().split('T')[0]
    const entry = {
      id: `mood-today`,
      score,
      label: MOOD_LABELS[score],
      emoji: MOOD_EMOJIS[score],
      date: today,
      note: null,
    }
    set((state) => ({
      history: [...state.history, entry],
      checkedToday: true,
      todayScore: score,
      showModal: false,
    }))
  },

  getWeeklyAverage: () => {
    const { history } = get()
    const last7 = history.slice(-7)
    if (!last7.length) return 0
    return (last7.reduce((sum, e) => sum + e.score, 0) / last7.length).toFixed(1)
  },

  getChartData: () => {
    const { history } = get()
    return history.slice(-14).map((e) => ({
      date: e.date.slice(5),
      score: e.score,
      emoji: e.emoji,
    }))
  },

  MOOD_EMOJIS,
  MOOD_LABELS,
}))
