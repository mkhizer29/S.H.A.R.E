import { create } from 'zustand'
import { db } from '../lib/firebase'
import { collection, query, where, getDocs, orderBy, doc, updateDoc } from 'firebase/firestore'

// Remove mock SESSIONS data

export const useBookingStore = create((set, get) => ({
  sessions: [],
  isLoading: false,
  error: null,

  loadBookings: async (userId, role = 'patient') => {
    if (!userId) return;
    set({ isLoading: true, error: null });
    try {
      const filterField = role === 'professional' ? 'professionalId' : 'patientId';
      const q = query(
        collection(db, 'bookings'),
        where(filterField, '==', userId),
        orderBy('startsAt', 'desc')
      );
      const snapshot = await getDocs(q);
      const bookings = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      set({ sessions: bookings, isLoading: false });
    } catch (error) {
      console.error("Error loading bookings:", error);
      set({ error: error.message, isLoading: false });
    }
  },

  cancelSession: async (id) => {
    try {
      await updateDoc(doc(db, 'bookings', id), { status: 'cancelled' });
      set((state) => ({
        sessions: state.sessions.map((s) => s.id === id ? { ...s, status: 'cancelled' } : s),
      }))
    } catch (error) {
      console.error("Error cancelling session:", error);
    }
  },

  rateSession: async (id, rating) => {
    try {
      await updateDoc(doc(db, 'bookings', id), { rating });
      set((state) => ({
        sessions: state.sessions.map((s) => s.id === id ? { ...s, rating } : s),
      }))
    } catch (error) {
      console.error("Error rating session:", error);
    }
  },

  getUpcoming: () => get().sessions.filter((s) => s.status === 'upcoming'),
  getPast: () => get().sessions.filter((s) => s.status === 'completed' || s.status === 'cancelled'),
}))
