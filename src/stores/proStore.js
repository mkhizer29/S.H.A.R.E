import { create } from 'zustand'
import { db } from '../lib/firebase'
import { collection, getDocs, getDoc, doc, updateDoc, setDoc, query, orderBy } from 'firebase/firestore'

export const useProStore = create((set) => ({
  professionals: [],
  isLoading: false,
  error: null,

  fetchProfessionals: async () => {
    set({ isLoading: true, error: null })
    try {
      const q = query(collection(db, 'professionals'), orderBy('rating', 'desc'))
      const snapshot = await getDocs(q)
      const pros = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      set({ professionals: pros, isLoading: false })
    } catch (error) {
      console.error('Error fetching professionals:', error)
      set({ error: error.message, isLoading: false })
    }
  },

  fetchProById: async (id) => {
    try {
      const proDoc = await getDoc(doc(db, 'professionals', id))
      if (proDoc.exists()) {
        return { id: proDoc.id, ...proDoc.data() }
      }
      return null
    } catch (error) {
      console.error('Error fetching pro by id:', error)
      return null
    }
  },

  updateProProfile: async (id, updates) => {
    set({ isLoading: true, error: null })
    try {
      const proRef = doc(db, 'professionals', id)
      const proDoc = await getDoc(proRef)
      
      if (proDoc.exists()) {
        await updateDoc(proRef, updates)
      } else {
        // If profile doesn't exist yet, create it
        await setDoc(proRef, {
          ...updates,
          createdAt: new Date().toISOString(),
          rating: 5.0,
          reviewCount: 0,
          sessionCount: 0,
          verified: false
        })
      }
      
      set((state) => ({
        professionals: state.professionals.map(p => p.id === id ? { ...p, ...updates } : p),
        isLoading: false
      }))
      return true
    } catch (error) {
      console.error('Error updating pro profile:', error)
      set({ error: error.message, isLoading: false })
      return false
    }
  }
}))
