import { create } from 'zustand';
import { db } from '../lib/firebase';
import { collection, query, where, onSnapshot, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';

export const useAvailabilityStore = create((set, get) => ({
  availabilities: [],
  isLoading: false,
  error: null,
  _unsubscribe: null,

  loadAvailability: (professionalId) => {
    if (!professionalId) return;

    const { _unsubscribe } = get();
    if (_unsubscribe) _unsubscribe();

    set({ isLoading: true, error: null });

    const q = query(
      collection(db, 'availability'),
      where('professionalId', '==', professionalId)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const availabilities = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      set({ availabilities, isLoading: false });
    }, (error) => {
      console.error("[AvailabilityStore] Subscription error:", error);
      set({ error: error.message, isLoading: false });
    });

    set({ _unsubscribe: unsubscribe });
  },

  addAvailability: async (data) => {
    try {
      await addDoc(collection(db, 'availability'), {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error("[AvailabilityStore] Add error:", error);
      throw error;
    }
  },

  updateAvailability: async (id, data) => {
    try {
      await updateDoc(doc(db, 'availability', id), {
        ...data,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error("[AvailabilityStore] Update error:", error);
      throw error;
    }
  },

  deleteAvailability: async (id) => {
    try {
      await deleteDoc(doc(db, 'availability', id));
    } catch (error) {
      console.error("[AvailabilityStore] Delete error:", error);
      throw error;
    }
  }
}));
