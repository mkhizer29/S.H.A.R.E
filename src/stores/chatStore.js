import { create } from 'zustand'
import { db } from '../lib/firebase'
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  setDoc,
  doc, 
  getDoc,
  getDocs,
  orderBy, 
  serverTimestamp,
  increment,
  writeBatch
} from 'firebase/firestore'
import { useAuthStore } from './authStore'
import { createNotification } from './notificationStore'

export const useChatStore = create((set, get) => ({
  conversations: [],
  activeMessages: [],
  activeConvId: null,
  isLoading: false,
  error: null,
  
  _convUnsubscribe: null,
  _msgUnsubscribe: null,

  fetchConversations: (userId, role = 'patient') => {
    if (!userId) return;
    
    // Cleanup previous subscription and clear state to avoid data leakage
    const { _convUnsubscribe, _msgUnsubscribe } = get();
    if (_convUnsubscribe) _convUnsubscribe();
    if (_msgUnsubscribe) _msgUnsubscribe();

    set({ conversations: [], activeMessages: [], activeConvId: null, isLoading: true, error: null });
    
    console.log(`[ChatStore] Subscribing to conversations for ${role}: ${userId}`);
    const isPro = role === 'professional' || role === 'pro' || role === 'specialist';
    const filterField = isPro ? 'proUid' : 'patientUid';
    
    const q = query(
      collection(db, 'conversations'),
      where(filterField, '==', userId)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const convs = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          // Canonical field mapping for UI consistency
          proName: data.professionalName,
          proSpecialty: data.professionalSpecialty,
          patientName: data.patientAlias,
          lastTime: data.lastTimestamp?.toDate ? data.lastTimestamp.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'
        };
      })
      .sort((a, b) => {
        const timeA = a.lastTimestamp?.toMillis ? a.lastTimestamp.toMillis() : 0;
        const timeB = b.lastTimestamp?.toMillis ? b.lastTimestamp.toMillis() : 0;
        return timeB - timeA; // Sort by most recent first
      });

      console.log(`[ChatStore] Fetched and sorted ${convs.length} conversations`);
      set({ conversations: convs, isLoading: false });
    }, (error) => {
      console.error("[ChatStore] Conv subscription error:", error);
      set({ isLoading: false, error: error.message });
    });

    set({ _convUnsubscribe: unsubscribe });
  },

  setActiveConv: (convId) => {
    const { _msgUnsubscribe } = get();
    if (_msgUnsubscribe) _msgUnsubscribe();

    set({ activeConvId: convId, activeMessages: [] });

    if (!convId) return;

    console.log(`[ChatStore] Subscribing to messages for: ${convId}`);
    const q = query(
      collection(db, 'conversations', convId, 'messages'),
      orderBy('timestamp', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      set({ activeMessages: msgs });
    }, (error) => {
      console.error("[ChatStore] Msg subscription error:", error);
    });

    set({ _msgUnsubscribe: unsubscribe });
  },

  sendMessage: async (text) => {
    const { activeConvId, conversations } = get();
    const { user } = useAuthStore.getState();
    if (!activeConvId || !user) return;

    const activeConv = conversations.find(c => c.id === activeConvId);
    if (!activeConv) return;

    try {
      const batch = writeBatch(db);
      
      // 1. Add message (using 'text' as requested)
      const msgRef = doc(collection(db, 'conversations', activeConvId, 'messages'));
      batch.set(msgRef, {
        text,
        senderId: user.uid,
        timestamp: serverTimestamp()
      });

      // 2. Update conversation metadata
      const convRef = doc(db, 'conversations', activeConvId);
      batch.update(convRef, {
        lastMessage: text,
        lastTimestamp: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      await batch.commit();

      // 3. Create Notification for the recipient
      const recipientId = user.uid === activeConv.patientUid ? activeConv.proUid : activeConv.patientUid;
      const recipientRole = user.uid === activeConv.patientUid ? 'professional' : 'patient';
      const link = recipientRole === 'professional' ? `/pro/inbox` : `/patient/chat/${activeConvId}`;

      await createNotification({
        userId: recipientId,
        actorId: user.uid,
        actorName: user.alias || user.name || 'Anonymous',
        type: 'message',
        entityType: 'conversation',
        entityId: activeConvId,
        title: 'New Message',
        body: text.length > 60 ? `${text.substring(0, 60)}...` : text,
        link
      });
    } catch (error) {
      console.error("[ChatStore] Send message error:", error);
    }
  },

  ensureConversation: async (pro) => {
    const { user } = useAuthStore.getState();
    if (!user || !pro) return null;

    const patientUid = user.uid;
    const proUid = pro.id || pro.uid;
    
    // Deterministic ID to avoid duplicates
    const convId = [patientUid, proUid].sort().join('_');
    const convRef = doc(db, 'conversations', convId);

    try {
      // Use query instead of getDoc to avoid Permission Denied on non-existent documents 
      // when rules are strict about resource.data ownership
      const q = query(
        collection(db, 'conversations'), 
        where('patientUid', '==', patientUid), 
        where('proUid', '==', proUid)
      );
      const snap = await getDocs(q);
      
      if (snap.empty) {
        console.log('[ChatStore] Creating new conversation:', convId);
        await setDoc(convRef, {
          patientUid,
          proUid,
          patientAlias: user.alias || user.name || 'Anonymous',
          professionalName: pro.name || pro.professionalName || 'Professional',
          professionalSpecialty: pro.specialties?.join(', ') || pro.title || pro.professionalSpecialty || 'Specialist',
          lastMessage: 'Secure connection established.',
          lastTimestamp: serverTimestamp(),
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      }
      
      return convId;
    } catch (error) {
      console.error("[ChatStore] Error ensuring conversation:", error);
      // Fallback for strict rules: attempt setDoc directly if it's a permission error on read
      if (error.code === 'permission-denied') {
        try {
          await setDoc(convRef, {
            patientUid,
            proUid,
            patientAlias: user.alias || user.name || 'Anonymous',
            professionalName: pro.name || pro.professionalName || 'Professional',
            professionalSpecialty: pro.specialties?.join(', ') || pro.title || pro.professionalSpecialty || 'Specialist',
            lastMessage: 'Secure connection established.',
            lastTimestamp: serverTimestamp(),
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          });
          return convId;
        } catch (e) {
          console.error("[ChatStore] Final creation attempt failed:", e);
        }
      }
      return null;
    }
  },

  getActiveConv: () => {
    const { conversations, activeConvId } = get();
    return conversations.find(c => c.id === activeConvId);
  },

  cleanup: () => {
    const { _convUnsubscribe, _msgUnsubscribe } = get();
    if (_convUnsubscribe) _convUnsubscribe();
    if (_msgUnsubscribe) _msgUnsubscribe();
    set({ 
      activeConvId: null, 
      activeMessages: [], 
      conversations: [], 
      error: null, 
      isLoading: false 
    });
  }
}))
