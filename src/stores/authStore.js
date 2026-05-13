import { create } from 'zustand'
import { auth, db, googleProvider } from '../lib/firebase'
import {
  onAuthStateChanged,
  signOut,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendEmailVerification
} from 'firebase/auth'
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore'
import { generateKeyPair } from '../lib/crypto'

const getDefaultRouteForUser = (user) => {
  if (!user) return '/signin'

  if (user.role === 'admin') return '/admin'
  if (user.role === 'patient') return '/patient'

  if (user.role === 'professional') {
    const status = user.approvalStatus || (user.verified ? 'approved' : 'pending')

    if (status === 'approved') return '/pro'
    if (status === 'rejected') return '/professional-rejected'
    return '/professional-pending'
  }

  return '/signin'
}

export const useAuthStore = create((set, get) => ({
  user: null,
  pendingUser: null,
  role: null,
  approvalStatus: null,
  isAuthenticated: false,
  needsEmailVerification: false,
  isLoading: false,
  authInitialized: false,
  _googleSignInInProgress: false,

  initializeAuth: () => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        if (get()._googleSignInInProgress) {
          set({ authInitialized: true });
          return;
        }

        // Check for unverified email accounts
        const isPasswordAccount = firebaseUser.providerData.some(p => p.providerId === 'password');
        if (isPasswordAccount && !firebaseUser.emailVerified) {
          set({
            user: firebaseUser,
            needsEmailVerification: true,
            isAuthenticated: false,
            authInitialized: true
          });
          return;
        }

        try {
          const adminDoc = await getDoc(doc(db, 'admin_access', firebaseUser.uid));
          if (adminDoc.exists() && adminDoc.data().isActive && adminDoc.data().email === firebaseUser.email) {
            const adminData = adminDoc.data();
            set({
              user: { uid: firebaseUser.uid, email: firebaseUser.email, ...adminData, role: 'admin' },
              role: 'admin',
              approvalStatus: 'approved',
              isAuthenticated: true,
              needsEmailVerification: false,
              pendingUser: null,
              authInitialized: true
            });
            return;
          }

          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            let userData = userDoc.data();
            let approvalStatus = userData.approvalStatus || 'approved'; // Default patient to approved

            if (userData.role === 'professional') {
              const proDoc = await getDoc(doc(db, 'professionals', firebaseUser.uid));
              if (proDoc.exists()) {
                const proData = proDoc.data();
                userData = { ...userData, ...proData };
                approvalStatus = userData.approvalStatus || proData.approvalStatus || (proData.verified ? 'approved' : 'pending');
              } else {
                approvalStatus = 'pending';
              }
            }

            set({
              user: { uid: firebaseUser.uid, email: firebaseUser.email, ...userData, approvalStatus },
              role: userData.role,
              approvalStatus,
              isAuthenticated: true,
              needsEmailVerification: false,
              pendingUser: null,
              authInitialized: true
            });
          } else {
            // New user missing Firestore doc
            const defaultAlias = firebaseUser.displayName || firebaseUser.email.split('@')[0];
            const pendingUser = { uid: firebaseUser.uid, email: firebaseUser.email, defaultAlias };
            set({
              user: null,
              pendingUser,
              isAuthenticated: false,
              needsEmailVerification: false,
              authInitialized: true
            });
          }
        } catch (error) {
          console.error("Auth rehydration error:", error);
          set({ user: null, role: null, approvalStatus: null, isAuthenticated: false, authInitialized: true });
        }
      } else {
        set({ user: null, role: null, approvalStatus: null, pendingUser: null, isAuthenticated: false, needsEmailVerification: false, authInitialized: true });
      }
    });
    return unsubscribe;
  },

  register: async (email, password) => {
    set({ isLoading: true });
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await sendEmailVerification(userCredential.user);

      set({
        user: userCredential.user,
        needsEmailVerification: true,
        isAuthenticated: false,
        isLoading: false
      });
      return { needsEmailVerification: true };
    } catch (error) {
      set({ isLoading: false });
      console.error("Registration error:", error.message);
      throw error;
    }
  },

  login: async (email, password) => {
    set({ isLoading: true });
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      if (!firebaseUser.emailVerified) {
        set({
          user: firebaseUser,
          needsEmailVerification: true,
          isAuthenticated: false,
          isLoading: false
        });
        return { needsEmailVerification: true };
      }

      const uid = firebaseUser.uid;

      const adminDoc = await getDoc(doc(db, 'admin_access', uid));
      if (adminDoc.exists() && adminDoc.data().isActive && adminDoc.data().email === email) {
        const adminData = adminDoc.data();
        const user = { uid, email, ...adminData, role: 'admin' };
        set({
          user,
          role: 'admin',
          approvalStatus: 'approved',
          isAuthenticated: true,
          needsEmailVerification: false,
          pendingUser: null,
          isLoading: false
        });
        return { user, redirectTo: '/admin' };
      }

      const userDoc = await getDoc(doc(db, 'users', uid));

      if (userDoc.exists()) {
        let userData = userDoc.data();
        let approvalStatus = userData.approvalStatus || 'approved';

        if (userData.role === 'professional') {
          const proDoc = await getDoc(doc(db, 'professionals', uid));
          if (proDoc.exists()) {
            const proData = proDoc.data();
            userData = { ...userData, ...proData };
            approvalStatus = userData.approvalStatus || proData.approvalStatus || (proData.verified ? 'approved' : 'pending');
          } else {
            approvalStatus = 'pending';
          }
        }

        const user = { uid, email, ...userData, approvalStatus };
        set({
          user,
          role: userData.role,
          approvalStatus,
          isAuthenticated: true,
          needsEmailVerification: false,
          pendingUser: null,
          isLoading: false
        });
        return { user, redirectTo: getDefaultRouteForUser(user) };
      } else {
        const defaultAlias = email.split('@')[0];
        const pendingUser = { uid, email, defaultAlias };
        set({
          user: null,
          pendingUser,
          isAuthenticated: false,
          needsEmailVerification: false,
          isLoading: false
        });
        return { pendingUser };
      }
    } catch (error) {
      set({ isLoading: false });
      console.error("Login Error:", error.message);
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

      const adminDoc = await getDoc(doc(db, 'admin_access', uid));
      if (adminDoc.exists() && adminDoc.data().isActive && adminDoc.data().email === email) {
        const adminData = adminDoc.data();
        const user = { uid, email, ...adminData, role: 'admin' };
        set({ user, role: 'admin', approvalStatus: 'approved', isAuthenticated: true, needsEmailVerification: false, pendingUser: null, isLoading: false, _googleSignInInProgress: false });
        return { user, redirectTo: '/admin' };
      }

      const userDocRef = doc(db, 'users', uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        let userData = userDoc.data();
        let approvalStatus = userData.approvalStatus || 'approved';

        if (userData.role === 'professional') {
          const proDoc = await getDoc(doc(db, 'professionals', uid));
          if (proDoc.exists()) {
            const proData = proDoc.data();
            userData = { ...userData, ...proData };
            approvalStatus = userData.approvalStatus || proData.approvalStatus || (proData.verified ? 'approved' : 'pending');
          } else {
            approvalStatus = 'pending';
          }
        }
        
        const user = { uid, email, ...userData, approvalStatus };
        set({ user, role: userData.role, approvalStatus, isAuthenticated: true, needsEmailVerification: false, pendingUser: null, isLoading: false, _googleSignInInProgress: false });
        return { user, redirectTo: getDefaultRouteForUser(user) };
      } else {
        const defaultAlias = firebaseUser.displayName || email.split('@')[0];
        const pendingUser = { uid, email, defaultAlias };
        set({ user: null, pendingUser, isAuthenticated: false, needsEmailVerification: false, isLoading: false, _googleSignInInProgress: false });
        return { pendingUser };
      }
    } catch (error) {
      set({ isLoading: false, _googleSignInInProgress: false });
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
      const keys = generateKeyPair();

      const approvalStatus = role === 'professional' ? 'pending' : 'approved';

      await setDoc(doc(db, 'users', uid), {
        email,
        alias,
        role,
        approvalStatus,
        onboardingComplete: true,
        publicKey: keys.publicKey,
        createdAt: new Date().toISOString()
      });

      if (role === 'professional') {
        await setDoc(doc(db, 'professionals', uid), {
          uid,
          userId: uid,
          professionalId: uid,
          name: alias,
          email,
          role: "professional",
          approvalStatus: "pending",
          verified: false,
          specialties: [],
          languages: ['English'],
          rating: 5.0,
          reviewCount: 0,
          sessionCount: 0,
          about: '',
          publicKey: keys.publicKey,
          submittedAt: new Date().toISOString(),
          reviewedAt: null,
          reviewedBy: null,
          rejectionReason: "",
          createdAt: new Date().toISOString()
        });
      }

      localStorage.setItem(`SHARE_SECRET_${uid}`, keys.secretKey);

      const user = { uid, email, alias, role, approvalStatus, publicKey: keys.publicKey };
      set({ user, role, approvalStatus, pendingUser: null, isAuthenticated: true, isLoading: false })
      return { user, redirectTo: getDefaultRouteForUser(user) };
    } catch (error) {
      set({ isLoading: false });
      console.error("Onboarding Error:", error.message);
      throw error;
    }
  },

  refreshUserStatus: async () => {
    const currentUser = auth.currentUser;
    if (!currentUser) return null;

    try {
      const uid = currentUser.uid;
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (!userDoc.exists()) return null;

      let userData = userDoc.data();
      let approvalStatus = userData.approvalStatus || 'approved';

      if (userData.role === 'professional') {
        const proDoc = await getDoc(doc(db, 'professionals', uid));
        if (proDoc.exists()) {
          const proData = proDoc.data();
          userData = { ...userData, ...proData };
          approvalStatus = userData.approvalStatus || proData.approvalStatus || (proData.verified ? 'approved' : 'pending');
        } else {
          approvalStatus = 'pending';
        }
      }

      const user = { uid, email: currentUser.email, ...userData, approvalStatus };
      set({ user, role: userData.role, approvalStatus });
      return { user, redirectTo: getDefaultRouteForUser(user) };
    } catch (error) {
      console.error("Error refreshing user status:", error);
      return null;
    }
  },

  logout: async () => {
    try {
      await signOut(auth);
      set({ user: null, role: null, approvalStatus: null, pendingUser: null, isAuthenticated: false, needsEmailVerification: false })
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
      // Strip protected fields to prevent accidental overwrites
      const safeUpdates = { ...updates };
      const protectedFields = ['role', 'approvalStatus', 'verified', 'reviewedAt', 'reviewedBy', 'rejectionReason', 'onboardingComplete'];
      protectedFields.forEach(field => delete safeUpdates[field]);

      await updateDoc(doc(db, 'users', user.uid), {
        ...safeUpdates,
        updatedAt: new Date().toISOString()
      });

      if (user.role === 'professional') {
        await updateDoc(doc(db, 'professionals', user.uid), safeUpdates);
      }

      set((state) => ({ user: { ...state.user, ...safeUpdates } }));
      return true;
    } catch (error) {
      console.error("Error updating profile:", error);
      return false;
    }
  }
}))

export default useAuthStore;
