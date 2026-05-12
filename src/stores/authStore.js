import { create } from 'zustand'
import { auth, db, googleProvider } from '../lib/firebase'
import { onAuthStateChanged, signOut, signInWithPopup, sendSignInLinkToEmail, isSignInWithEmailLink, signInWithEmailLink } from 'firebase/auth'
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore'
import { generateKeyPair } from '../lib/crypto'


export const useAuthStore = create((set, get) => ({
  user: null,
  pendingUser: null,
  role: null,
  isAuthenticated: false,
  isLoading: false,
  authInitialized: false,
  _googleSignInInProgress: false,

  initializeAuth: () => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // If Google sign-in is in progress, skip — signInWithGoogle will handle state
        if (get()._googleSignInInProgress) {
          set({ authInitialized: true });
          return;
        }

        try {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            let userData = userDoc.data();
            
            // Sync verification status for professionals
            if (userData.role === 'professional') {
              const proDoc = await getDoc(doc(db, 'professionals', firebaseUser.uid));
              if (proDoc.exists()) {
                userData = { ...userData, ...proDoc.data() };
              }
            }

            set({ 
              user: { uid: firebaseUser.uid, email: firebaseUser.email, ...userData },
              role: userData.role,
              isAuthenticated: true,
              authInitialized: true
            });
          } else {
            // Doc may not exist yet for brand-new Google users — wait briefly and retry once
            await new Promise(r => setTimeout(r, 1500));
            const retryDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
            if (retryDoc.exists()) {
              let userData = retryDoc.data();
              if (userData.role === 'professional') {
                const proDoc = await getDoc(doc(db, 'professionals', firebaseUser.uid));
                if (proDoc.exists()) {
                  userData = { ...userData, ...proDoc.data() };
                }
              }
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

  sendEmailLinkSignIn: async (email) => {
    set({ isLoading: true });
    try {
      const actionCodeSettings = {
        url: 'https://share-platform-2a6a2.web.app/signin',
        handleCodeInApp: true,
      };
      await sendSignInLinkToEmail(auth, email, actionCodeSettings);
      window.localStorage.setItem('emailForSignIn', email);
      set({ isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      console.error("Error sending email link:", error);
      throw error;
    }
  },

  completeEmailLinkSignIn: async (email, href) => {
    set({ isLoading: true });
    try {
      if (!isSignInWithEmailLink(auth, href)) {
        throw new Error("Invalid sign-in link.");
      }
      
      const result = await signInWithEmailLink(auth, email, href);
      window.localStorage.removeItem('emailForSignIn');
      
      const firebaseUser = result.user;
      const uid = firebaseUser.uid;
      
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) {
        let userData = userDoc.data();
        if (userData.role === 'professional') {
          const proDoc = await getDoc(doc(db, 'professionals', uid));
          if (proDoc.exists()) {
            userData = { ...userData, ...proDoc.data() };
          }
        }
        const user = { uid, email: firebaseUser.email, ...userData };
        set({ user, role: userData.role, isAuthenticated: true, isLoading: false });
        return { user };
      } else {
        const defaultAlias = email.split('@')[0];
        const pendingUser = { uid, email: firebaseUser.email, defaultAlias };
        set({ pendingUser, isAuthenticated: false, isLoading: false });
        return { pendingUser };
      }
    } catch (error) {
      set({ isLoading: false });
      console.error("Error completing email link sign-in:", error);
      throw error;
    }
  },

  signInWithGoogle: async () => {
    set({ isLoading: true, _googleSignInInProgress: true });
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const firebaseUser = result.user;
      const uid = firebaseUser.uid;
      const email = firebaseUser.email;

      // Check if user already exists in Firestore
      const userDocRef = doc(db, 'users', uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        // Returning Google user — load existing profile
        let userData = userDoc.data();

        if (userData.role === 'professional') {
          const proDoc = await getDoc(doc(db, 'professionals', uid));
          if (proDoc.exists()) {
            userData = { ...userData, ...proDoc.data() };
          }
        }

        const user = { uid, email, ...userData };
        set({ user, role: userData.role, isAuthenticated: true, isLoading: false, _googleSignInInProgress: false });
        return user;
      } else {
        // First-time Google user — set pending state for onboarding
        const defaultAlias = firebaseUser.displayName || email.split('@')[0];
        const pendingUser = { uid, email, defaultAlias };
        set({ pendingUser, isAuthenticated: false, isLoading: false, _googleSignInInProgress: false });
        return { pendingUser };
      }
    } catch (error) {
      set({ isLoading: false, _googleSignInInProgress: false });
      // User closed popup or other error
      if (error.code !== 'auth/popup-closed-by-user') {
        console.error('Google Sign-In Error:', error.message);
        throw error;
      }
    }
  },

  completeOnboarding: async (alias, role) => {
    set({ isLoading: true })
    try {
      const { pendingUser } = get();
      if (!pendingUser) throw new Error("No pending user found to onboard.");
      
      const { uid, email } = pendingUser;

      // 1. Generate E2E Crypto Keys for the user locally
      const keys = generateKeyPair();

      // 2. Store the Public Key and role in Firestore openly
      await setDoc(doc(db, 'users', uid), {
        email,
        alias,
        role,
        publicKey: keys.publicKey,
        createdAt: new Date().toISOString()
      });

      // 3. If professional, initialize their public profile
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

      const user = { uid, email, alias, role, publicKey: keys.publicKey };
      set({ user, role, pendingUser: null, isAuthenticated: true, isLoading: false })
      return user;
    } catch (error) {
      set({ isLoading: false });
      console.error("Onboarding Error:", error.message);
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

  updateProfile: async (updates) => {
    const { user } = get();
    if (!user?.uid) return false;

    try {
      await updateDoc(doc(db, 'users', user.uid), {
        ...updates,
        updatedAt: new Date().toISOString()
      });

      // If professional, also update their professional profile
      if (user.role === 'professional') {
        await updateDoc(doc(db, 'professionals', user.uid), updates);
      }

      set((state) => ({ user: { ...state.user, ...updates } }));
      return true;
    } catch (error) {
      console.error("Error updating profile:", error);
      return false;
    }
  }
}))

export default useAuthStore;
