import { create } from 'zustand'
import { db } from '../lib/firebase'
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs, 
  orderBy, 
  serverTimestamp, 
  doc, 
  updateDoc, 
  writeBatch 
} from 'firebase/firestore'
import { createNotification } from './notificationStore'

export const useProfileChangeRequestStore = create((set, get) => ({
  requests: [],
  myPendingRequest: null,
  isLoading: false,
  error: null,

  submitProfileChangeRequest: async ({ user, currentProfile, requestedSpecialties, requestedLanguages, requestedPricePerSession, requestedCurrency }) => {
    if (!user?.uid) return false;
    set({ isLoading: true, error: null });
    
    try {
      await addDoc(collection(db, 'professional_profile_change_requests'), {
        professionalId: user.uid,
        professionalName: currentProfile?.name || user.name || user.alias || "Professional",
        professionalEmail: user.email || "",
        requestedSpecialties: requestedSpecialties || [],
        requestedLanguages: requestedLanguages || [],
        requestedPricePerSession: Number(requestedPricePerSession),
        requestedCurrency: requestedCurrency || "PKR",
        currentSpecialties: currentProfile?.specialties || [],
        currentLanguages: currentProfile?.languages || [],
        currentPricePerSession: Number(currentProfile?.pricePerSession || 3000),
        currentCurrency: currentProfile?.currency || "PKR",
        status: "pending",
        submittedAt: serverTimestamp(),
        reviewedAt: null,
        reviewedBy: null,
        rejectionReason: ""
      });
      set({ isLoading: false });
      return true;
    } catch (error) {
      console.error('[ProfileChangeRequestStore] Error submitting request:', error);
      set({ error: error.message, isLoading: false });
      return false;
    }
  },

  fetchMyPendingRequest: async (professionalId) => {
    if (!professionalId) return;
    set({ isLoading: true, error: null });
    
    try {
      const q = query(
        collection(db, 'professional_profile_change_requests'),
        where('professionalId', '==', professionalId),
        where('status', '==', 'pending')
      );
      const snap = await getDocs(q);
      
      if (!snap.empty) {
        set({ myPendingRequest: { id: snap.docs[0].id, ...snap.docs[0].data() }, isLoading: false });
      } else {
        set({ myPendingRequest: null, isLoading: false });
      }
    } catch (error) {
      console.error('[ProfileChangeRequestStore] Error fetching my pending request:', error);
      set({ error: error.message, isLoading: false });
    }
  },

  fetchPendingRequests: async () => {
    set({ isLoading: true, error: null });
    
    try {
      let snap;
      try {
        const q = query(
          collection(db, 'professional_profile_change_requests'),
          where('status', '==', 'pending'),
          orderBy('submittedAt', 'desc')
        );
        snap = await getDocs(q);
      } catch (err) {
        if (err.message.includes('index') || err.message.includes('inequality')) {
          console.warn('[ProfileChangeRequestStore] Missing index for pending requests, falling back to manual sort');
          const qFallback = query(
            collection(db, 'professional_profile_change_requests'),
            where('status', '==', 'pending')
          );
          snap = await getDocs(qFallback);
        } else {
          throw err;
        }
      }

      const reqs = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      // Ensure sorted manually if index fallback was used
      reqs.sort((a, b) => {
        const timeA = a.submittedAt?.toMillis ? a.submittedAt.toMillis() : 0;
        const timeB = b.submittedAt?.toMillis ? b.submittedAt.toMillis() : 0;
        return timeB - timeA;
      });

      set({ requests: reqs, isLoading: false });
    } catch (error) {
      console.error('[ProfileChangeRequestStore] Error fetching pending requests:', error);
      set({ error: error.message, isLoading: false });
    }
  },

  approveRequest: async (requestId, requestData, adminUid) => {
    set({ isLoading: true, error: null });
    
    try {
      const batch = writeBatch(db);
      
      const reqRef = doc(db, 'professional_profile_change_requests', requestId);
      batch.update(reqRef, {
        status: "approved",
        reviewedAt: serverTimestamp(),
        reviewedBy: adminUid || "admin",
        rejectionReason: ""
      });

      const proRef = doc(db, 'professionals', requestData.professionalId);
      batch.update(proRef, {
        specialties: requestData.requestedSpecialties,
        languages: requestData.requestedLanguages,
        pricePerSession: Number(requestData.requestedPricePerSession),
        currency: requestData.requestedCurrency || "PKR",
        updatedAt: serverTimestamp()
      });

      await batch.commit();

      set(state => ({
        requests: state.requests.filter(r => r.id !== requestId),
        isLoading: false
      }));

      try {
        await createNotification({
          userId: requestData.professionalId,
          actorId: adminUid || 'system',
          actorName: 'Admin',
          type: 'system',
          entityType: 'profile_change',
          entityId: requestId,
          title: "Profile changes approved",
          body: "Your professional profile updates are now live.",
          link: "/pro/profile"
        });
      } catch(e) {
        console.warn('[ProfileChangeRequestStore] Failed to send approval notification', e);
      }

      return true;
    } catch (error) {
      console.error('[ProfileChangeRequestStore] Error approving request:', error);
      set({ error: error.message, isLoading: false });
      return false;
    }
  },

  rejectRequest: async (requestId, requestData, reason, adminUid) => {
    set({ isLoading: true, error: null });
    
    try {
      const reqRef = doc(db, 'professional_profile_change_requests', requestId);
      await updateDoc(reqRef, {
        status: "rejected",
        reviewedAt: serverTimestamp(),
        reviewedBy: adminUid || "admin",
        rejectionReason: reason
      });

      set(state => ({
        requests: state.requests.filter(r => r.id !== requestId),
        isLoading: false
      }));

      try {
        await createNotification({
          userId: requestData.professionalId,
          actorId: adminUid || 'system',
          actorName: 'Admin',
          type: 'system',
          entityType: 'profile_change',
          entityId: requestId,
          title: "Profile changes rejected",
          body: reason,
          link: "/pro/profile"
        });
      } catch(e) {
        console.warn('[ProfileChangeRequestStore] Failed to send rejection notification', e);
      }

      return true;
    } catch (error) {
      console.error('[ProfileChangeRequestStore] Error rejecting request:', error);
      set({ error: error.message, isLoading: false });
      return false;
    }
  }
}));
