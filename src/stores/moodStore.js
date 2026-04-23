import { create } from 'zustand'
import { db } from '../lib/firebase'
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  setDoc, 
  doc, 
  orderBy, 
  serverTimestamp 
} from 'firebase/firestore'

const MOOD_LABELS = { 1: 'Very Low', 2: 'Low', 3: 'Okay', 4: 'Good', 5: 'Great' }
const MOOD_EMOJIS = { 1: '😔', 2: '😟', 3: '😐', 4: '🙂', 5: '😊' }

export const useMoodStore = create((set, get) => ({
  history: [],
  checkedToday: false,
  todayScore: null,
  showModal: false,
  isLoading: false,
  error: null,

  openModal: () => set({ showModal: true }),
  closeModal: () => set({ showModal: false }),

  fetchMoods: async (userId) => {
    if (!userId) return
    set({ isLoading: true, error: null })
    try {
      const q = query(
        collection(db, 'moods'),
        where('userId', '==', userId)
      )
      
      const querySnapshot = await getDocs(q)
      const history = []
      querySnapshot.forEach((doc) => {
        history.push({ id: doc.id, ...doc.data() })
      })

      // Sort by date asc
      history.sort((a, b) => a.date.localeCompare(b.date))

      const today = new Date().toISOString().split('T')[0]
      const todayEntry = history.find(h => h.date === today)

      set({ 
        history, 
        checkedToday: !!todayEntry, 
        todayScore: todayEntry?.score || null,
        isLoading: false 
      })
    } catch (error) {
      console.error('Error fetching moods:', error)
      set({ error: error.message, isLoading: false })
    }
  },

  submitMood: async (score, userId) => {
    if (!userId) return
    const today = new Date().toISOString().split('T')[0]
    const entry = {
      userId,
      score,
      label: MOOD_LABELS[score],
      emoji: MOOD_EMOJIS[score],
      date: today,
      note: null,
      createdAt: serverTimestamp(),
    }

    try {
      // Use userId + date as ID to prevent duplicate entries for the same user/day
      const docId = `${userId}_${today}`
      await setDoc(doc(db, 'moods', docId), entry)
      
      set((state) => {
        const filteredHistory = state.history.filter(h => h.date !== today)
        return {
          history: [...filteredHistory, { ...entry, id: docId, createdAt: new Date().toISOString() }],
          checkedToday: true,
          todayScore: score,
          showModal: false,
        }
      })
    } catch (error) {
      console.error('Error submitting mood:', error)
      set({ error: error.message })
    }
  },

  getWeeklyAverage: () => {
    const { history } = get()
    // Sort by date desc to get the most recent ones if not already sorted
    const sorted = [...history].sort((a, b) => b.date.localeCompare(a.date))
    const last7 = sorted.slice(0, 7)
    if (!last7.length) return 0
    return (last7.reduce((sum, e) => sum + e.score, 0) / last7.length).toFixed(1)
  },

  getChartData: () => {
    const { history } = get()
    // Get last 14 days sorted by date asc
    const sorted = [...history].sort((a, b) => a.date.localeCompare(b.date))
    return sorted.slice(-14).map((e) => ({
      date: e.date.slice(5),
      score: e.score,
      emoji: e.emoji,
    }))
  },

  MOOD_EMOJIS,
  MOOD_LABELS,
}))
