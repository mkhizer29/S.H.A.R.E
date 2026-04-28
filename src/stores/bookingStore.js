import { create } from 'zustand'
import { db } from '../lib/firebase'
import { collection, query, where, getDocs, orderBy, doc, updateDoc, onSnapshot } from 'firebase/firestore'

// Remove mock SESSIONS data

export const useBookingStore = create((set, get) => ({
  sessions: [],
  isLoading: false,
  error: null,

  _unsubscribe: null,

  loadBookings: (userId, role = 'patient') => {
    if (!userId) return;
    
    // Cleanup existing listener
    const { _unsubscribe } = get();
    if (_unsubscribe) _unsubscribe();

    set({ isLoading: true, error: null });
    
    console.log(`[BookingStore] Subscribing to bookings for ${role}: ${userId}`);
    const filterField = role === 'professional' ? 'professionalId' : 'patientId';
    const q = query(
      collection(db, 'bookings'),
      where(filterField, '==', userId)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const bookings = snapshot.docs.map(doc => {
        const data = doc.data();
        // Convert Firestore timestamps to ISO strings for store consistency
        const processed = { ...data };
        Object.keys(processed).forEach(key => {
          if (processed[key] && typeof processed[key].toDate === 'function') {
            processed[key] = processed[key].toDate().toISOString();
          }
        });
        return { id: doc.id, ...processed };
      });
      
      console.log(`[BookingStore] Received ${bookings.length} bookings`);
      set({ sessions: bookings, isLoading: false });
    }, (error) => {
      console.error("[BookingStore] Subscription error:", error);
      set({ error: error.message, isLoading: false });
    });

    set({ _unsubscribe: unsubscribe });
  },

  cancelSession: async (id) => {
    try {
      await updateDoc(doc(db, 'bookings', id), { status: 'cancelled' });
    } catch (error) {
      console.error("[BookingStore] Cancel error:", error);
    }
  },

  rateSession: async (id, rating) => {
    try {
      await updateDoc(doc(db, 'bookings', id), { rating });
    } catch (error) {
      console.error("[BookingStore] Rate error:", error);
    }
  },

  getUpcoming: () => get().sessions
    .filter((s) => s.status === 'upcoming')
    .sort((a, b) => new Date(a.startsAt) - new Date(b.startsAt)),

  getPast: () => get().sessions
    .filter((s) => s.status !== 'upcoming')
    .sort((a, b) => new Date(b.startsAt) - new Date(a.startsAt)),

  /** Find the next upcoming booking between a specific patient and professional */
  getNextBookingForPair: (patientId, professionalId) => {
    if (!patientId || !professionalId) return null;
    return get().sessions
      .filter(s =>
        s.status === 'upcoming' &&
        s.patientId === patientId &&
        s.professionalId === professionalId
      )
      .sort((a, b) => new Date(a.startsAt) - new Date(b.startsAt))[0] || null;
  },
}))
