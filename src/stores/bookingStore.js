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
      console.log(`[BookingStore] Loading bookings for ${role}: ${userId}`);
      const filterField = role === 'professional' ? 'professionalId' : 'patientId';
      const q = query(
        collection(db, 'bookings'),
        where(filterField, '==', userId)
      );
      
      const snapshot = await getDocs(q);
      console.log(`[BookingStore] Found ${snapshot.docs.length} bookings`);
      
      const bookings = snapshot.docs.map(doc => {
        const data = doc.data();
        console.log(`[BookingStore] Booking ${doc.id}:`, data);
        Object.keys(data).forEach(key => {
          if (data[key] && typeof data[key].toDate === 'function') {
            data[key] = data[key].toDate().toISOString();
          }
        });
        return { id: doc.id, ...data };
      });
      set({ sessions: bookings, isLoading: false });
    } catch (error) {
      console.error("[BookingStore] Error loading bookings from Firestore:", error);
      // If it's an index error, the error message will contain the link to create it
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

  getUpcoming: () => get().sessions
    .filter((s) => s.status === 'upcoming')
    .sort((a, b) => new Date(a.startsAt) - new Date(b.startsAt)), // Closest first

  getPast: () => get().sessions
    .filter((s) => s.status !== 'upcoming')
    .sort((a, b) => new Date(b.startsAt) - new Date(a.startsAt)), // Most recent first
}))
