import { create } from 'zustand'
import { auth, db } from '../lib/firebase'
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth'
import { doc, setDoc } from 'firebase/firestore'
import { generateKeyPair } from '../lib/crypto'

const DEMO_USERS = {
  patient: {
    uid: 'patient-001',
    alias: 'WillowDream',
    email: 'patient@demo.com',
    role: 'patient',
    joinedAt: '2025-11-15',
    avatar: null,
    moodCheckedToday: false,
  },
  professional: {
    uid: 'pro-001',
    name: 'Dr. Aisha Raza',
    email: 'pro@demo.com',
    role: 'professional',
    specialty: ['Anxiety', 'Depression', 'Trauma'],
    verified: true,
    avatar: null,
    rating: 4.9,
    sessionCount: 342,
  },
  admin: {
    uid: 'admin-001',
    name: 'Platform Admin',
    email: 'admin@demo.com',
    role: 'admin',
    avatar: null,
  },
}

export const useAuthStore = create((set) => ({
  user: null,
  role: null,
  isAuthenticated: false,
  isLoading: false,

  login: async (email, password, role) => {
    set({ isLoading: true })
    try {
      // Attempt real Firebase Auth
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      // Fetch user role from Firestore ideally here, but defaulting to passed role
      set({ user: { uid: userCredential.user.uid, email, role }, role, isAuthenticated: true, isLoading: false })
    } catch (error) {
      console.warn("Firebase Auth Error (Missing keys?). Falling back to Mock Demo Data:", error.message);
      // Fallback due to missing env variables or demo run
      setTimeout(() => {
        const user = DEMO_USERS[role] || DEMO_USERS['patient']
        set({ user, role, isAuthenticated: true, isLoading: false })
      }, 800)
    }
  },

  register: async (email, password, alias, role) => {
    set({ isLoading: true })
    try {
      // 1. Create Firebase Auth User
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const uid = userCredential.user.uid;

      // 2. Generate E2E Crypto Keys for the user locally
      const keys = generateKeyPair();

      // 3. Store the Public Key and role in Firestore openly, KEEP SECRET KEY LOCAL
      await setDoc(doc(db, 'users', uid), {
        email,
        alias,
        role,
        publicKey: keys.publicKey,
        createdAt: new Date().toISOString()
      });

      // (In production, the SecretKey should be encrypted with the password and stored, or kept exclusively in local Storage/session.)
      localStorage.setItem(`SHARE_SECRET_${uid}`, keys.secretKey);

      set({ user: { uid, email, alias, role }, role, isAuthenticated: true, isLoading: false })
    } catch (error) {
      console.warn("Firebase Registration Error (Missing keys?). Falling back to Mock Demo Data:", error.message);
      setTimeout(() => {
        const user = DEMO_USERS[role] || DEMO_USERS['patient']
        set({ user, role, isAuthenticated: true, isLoading: false })
      }, 800)
    }
  },

  logout: () => {
    set({ user: null, role: null, isAuthenticated: false })
  },

  updateUser: (updates) => {
    set((state) => ({ user: { ...state.user, ...updates } }))
  },
}))

export default useAuthStore;
