import { create } from 'zustand'
import { db } from '../lib/firebase'
import {
  collection,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  setDoc,
  query,
  orderBy
} from 'firebase/firestore'

const normalizeProfessional = (docSnap) => {
  const data = docSnap.data()
  const canonicalUid =
    data.uid ||
    data.userId ||
    data.professionalId ||
    (typeof docSnap.id === 'string' && docSnap.id.length >= 20 ? docSnap.id : null)

  return {
    id: docSnap.id,
    ...data,
    uid: canonicalUid || data.uid || data.userId || data.professionalId || null,
    userId: canonicalUid || data.userId || data.uid || data.professionalId || null,
    professionalId: canonicalUid || data.professionalId || data.uid || data.userId || null
  }
}

export const useProStore = create((set) => ({
  professionals: [],
  isLoading: false,
  error: null,

  fetchProfessionals: async () => {
    set({ isLoading: true, error: null })

    try {
      const q = query(collection(db, 'professionals'), orderBy('rating', 'desc'))
      const snapshot = await getDocs(q)
      const pros = snapshot.docs.map(normalizeProfessional)

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
        return normalizeProfessional(proDoc)
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

      const canonicalUid =
        updates.uid ||
        updates.userId ||
        updates.professionalId ||
        (typeof id === 'string' && id.length >= 20 ? id : null)

      const payload = {
        ...updates,
        ...(canonicalUid
          ? {
            uid: canonicalUid,
            userId: canonicalUid,
            professionalId: canonicalUid
          }
          : {}),
        updatedAt: new Date().toISOString()
      }

      if (proDoc.exists()) {
        await updateDoc(proRef, payload)
      } else {
        await setDoc(proRef, {
          ...payload,
          createdAt: new Date().toISOString(),
          rating: 5.0,
          reviewCount: 0,
          sessionCount: 0,
          verified: false
        })
      }

      set((state) => ({
        professionals: state.professionals.map((p) =>
          p.id === id
            ? {
              ...p,
              ...payload
            }
            : p
        ),
        isLoading: false
      }))

      return true
    } catch (error) {
      console.error('Error updating pro profile:', error)
      set({ error: error.message, isLoading: false })
      return false
    }
  },

  saveCaseNote: async (proId, patientId, content) => {
    try {
      const noteRef = doc(db, 'professionals', proId, 'notes', patientId);
      await setDoc(noteRef, {
        content,
        updatedAt: new Date().toISOString()
      });
      return true;
    } catch (error) {
      console.error('Error saving case note:', error);
      return false;
    }
  },

  fetchCaseNote: async (proId, patientId) => {
    try {
      const noteRef = doc(db, 'professionals', proId, 'notes', patientId);
      const docSnap = await getDoc(noteRef);
      if (docSnap.exists()) {
        return docSnap.data().content;
      }
      return '';
    } catch (error) {
      console.error('Error fetching case note:', error);
      return '';
    }
  }
}) )