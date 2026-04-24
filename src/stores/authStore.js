import { create } from 'zustand'
import { auth, db } from '../lib/firebase'
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged, signOut } from 'firebase/auth'
import { doc, setDoc, getDoc } from 'firebase/firestore'
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
  authInitialized: false,

  initializeAuth: () => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            set({ 
              user: { uid: firebaseUser.uid, email: firebaseUser.email, ...userData },
              role: userData.role,
              isAuthenticated: true,
              authInitialized: true
            });
          } else {
            console.warn("User authenticated but profile document missing in Firestore.");
            set({ user: null, role: null, isAuthenticated: false, authInitialized: true });
          }
        } catch (error) {
          console.error("Auth rehydration error:", error);
          set({ user: null, role: null, isAuthenticated: false, authInitialized: true });
        }
      } else {
        set({ user: null, role: null, isAuthenticated: false, authInitialized: true });
      }
    });
    return unsubscribe;
  },

  login: async (email, password) => {
    set({ isLoading: true })
    try {
      // Attempt real Firebase Auth
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const uid = userCredential.user.uid;

      // Fetch user profile and role from Firestore
      const userDoc = await getDoc(doc(db, 'users', uid));
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const user = { uid, email, ...userData };
        set({ 
          user, 
          role: userData.role, 
          isAuthenticated: true, 
          isLoading: false 
        })
        return user;
      } else {
        // Firebase user exists but Firestore doc is missing
        console.error(`No Firestore document found for UID: ${uid}`);
        set({ isLoading: false });
        throw new Error("Your user profile is missing. Please contact support or sign up again.");
      }
    } catch (error) {
      set({ isLoading: false });
      console.error("Login Error:", error.message);
      throw error; // Propagate to UI
    }
  },

  demoLogin: async (role) => {
    set({ isLoading: true })
    return new Promise((resolve) => {
      setTimeout(() => {
        const user = DEMO_USERS[role] || DEMO_USERS['patient']
        set({ user, role, isAuthenticated: true, isLoading: false })
        resolve(user)
      }, 600)
    })
  },

  register: async (email, password, alias, role) => {
    set({ isLoading: true })
    try {
      // 1. Create Firebase Auth User
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const uid = userCredential.user.uid;

      // 2. Generate E2E Crypto Keys for the user locally
      const keys = generateKeyPair();

      // 3. Store the Public Key and role in Firestore openly
      await setDoc(doc(db, 'users', uid), {
        email,
        alias,
        role,
        publicKey: keys.publicKey,
        createdAt: new Date().toISOString()
      });

      // 4. If professional, initialize their public profile
      if (role === 'professional') {
        await setDoc(doc(db, 'professionals', uid), {
          name: alias, // Alias serves as Full Name for pros in signup
          email,
          role,
          specialties: [],
          languages: ['English'],
          rating: 5.0,
          reviewCount: 0,
          sessionCount: 0,
          verified: false,
          about: '',
          publicKey: keys.publicKey, // Shared for E2E chat handshake
          createdAt: new Date().toISOString()
        });
      }

      // Keep SecretKey locally
      localStorage.setItem(`SHARE_SECRET_${uid}`, keys.secretKey);

      set({ user: { uid, email, alias, role }, role, isAuthenticated: true, isLoading: false })
    } catch (error) {
      set({ isLoading: false });
      console.error("Registration Error:", error.message);
      throw error;
    }
  },

  logout: async () => {
    try {
      await signOut(auth);
      set({ user: null, role: null, isAuthenticated: false })
    } catch (error) {
      console.error("Logout error:", error);
    }
  },

  updateUser: (updates) => {
    set((state) => ({ user: { ...state.user, ...updates } }))
  },
}))

export default useAuthStore;
