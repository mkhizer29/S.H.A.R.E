import { create } from 'zustand'
import { db } from '../lib/firebase'
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  doc, 
  orderBy, 
  serverTimestamp,
  increment
} from 'firebase/firestore'
import { encryptMessage, decryptMessage } from '../lib/crypto'
import { useAuthStore } from './authStore'

export const useChatStore = create((set, get) => ({
  conversations: [],
  activeMessages: [],
  activeConvId: null,
  isTyping: false,
  isLoading: false,
  error: null,
  
  // Unsubscribe functions for cleanup
  _convUnsubscribe: null,
  _msgUnsubscribe: null,

  fetchConversations: (uid, role = 'patient') => {
    if (!uid) return
    
    // Cleanup existing subscription if any
    const { _convUnsubscribe } = get()
    if (_convUnsubscribe) _convUnsubscribe()

    const field = role === 'patient' ? 'patientUid' : 'proUid'
    const q = query(
      collection(db, 'conversations'),
      where(field, '==', uid),
      orderBy('lastTimestamp', 'desc')
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const conversations = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        // Format timestamp for UI
        lastTime: doc.data().lastTimestamp?.toDate() 
          ? doc.data().lastTimestamp.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          : 'Just now'
      }))
      set({ conversations, isLoading: false })
    }, (error) => {
      console.error('Conversations subscription error:', error)
      set({ error: error.message })
    })

    set({ _convUnsubscribe: unsubscribe })
  },

  setActiveConv: (convId) => {
    const { _msgUnsubscribe, activeConvId } = get()
    
    if (activeConvId === convId) return
    
    // Cleanup existing message subscription
    if (_msgUnsubscribe) _msgUnsubscribe()

    set({ activeConvId: convId, activeMessages: [], isLoading: true })

    const q = query(
      collection(db, 'conversations', convId, 'messages'),
      orderBy('timestamp', 'asc')
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messages = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        time: doc.data().timestamp?.toDate() 
          ? doc.data().timestamp.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          : 'Just now'
      }))
      
      // Decrypt messages if they have ciphertext
      const { user } = get() // We need the current user's secret key
      const activeConv = get().conversations.find(c => c.id === convId)
      
      const decryptedMessages = messages.map(m => {
        if (m.ciphertext && m.nonce) {
          try {
            // Determine keys based on role
            const isMe = m.senderId === user?.uid
            const secretKey = localStorage.getItem(`SHARE_SECRET_${user?.uid}`)
            
            // If it's my message, I don't need to decrypt it if I stored the plain text locally?
            // Actually, for E2E, I decrypt it using the sender's public key and my secret key.
            const otherPublicKey = m.senderId === activeConv.patientUid ? activeConv.patientPublicKey : activeConv.proPublicKey
            
            // In tweetnacl box, if I am the receiver, I use my secret key and sender's public key.
            // If I am the sender, I can't decrypt it with my own secret key unless I am also the receiver?
            // Usually, you encrypt for the receiver. To see your own sent messages, you'd need to store them or encrypt for yourself too.
            // For this demo, let's assume we store the plaintext 'text' for the sender or decrypt it correctly.
            if (m.text) return m // Already has plaintext for UI
            
            const decrypted = decryptMessage(m.ciphertext, m.nonce, otherPublicKey, secretKey)
            return { ...m, text: decrypted }
          } catch (e) {
            console.error('Decryption failed for message', m.id, e)
            return { ...m, text: '[Encrypted Message]' }
          }
        }
        return m
      })

      set({ activeMessages: decryptedMessages, isLoading: false })
      
      // Mark as read in Firestore (simplified: clear unread for current user)
      // This would involve updating the conversation's unreadCount map
    }, (error) => {
      console.error('Messages subscription error:', error)
      set({ error: error.message, isLoading: false })
    })

    set({ _msgUnsubscribe: unsubscribe })
  },

  sendMessage: async (text) => {
    const { activeConvId, conversations } = get()
    if (!activeConvId) return

    const activeConv = conversations.find(c => c.id === activeConvId)
    const { user } = useAuthStore.getState()
    if (!user) return

    const secretKey = localStorage.getItem(`SHARE_SECRET_${user.uid}`)
    const recipientPublicKey = user.uid === activeConv.patientUid ? activeConv.proPublicKey : activeConv.patientPublicKey

    try {
      const encrypted = encryptMessage(text, recipientPublicKey, secretKey)
      
      const msgData = {
        senderId: user.uid,
        ciphertext: encrypted.ciphertext,
        nonce: encrypted.nonce,
        text: text, // Storing plaintext for the sender's own view (simplified)
        timestamp: serverTimestamp(),
      }

      await addDoc(collection(db, 'conversations', activeConvId, 'messages'), msgData)
      
      await updateDoc(doc(db, 'conversations', activeConvId), {
        lastMessage: text,
        lastTimestamp: serverTimestamp(),
        [`unreadCount.${recipientPublicKey === activeConv.proPublicKey ? activeConv.proUid : activeConv.patientUid}`]: increment(1)
      })
    } catch (e) {
      console.error('Send message error:', e)
      set({ error: e.message })
    }
  },

  getActiveConv: () => {
    const { conversations, activeConvId } = get()
    return conversations.find((c) => c.id === activeConvId)
  },

  cleanup: () => {
    const { _convUnsubscribe, _msgUnsubscribe } = get()
    if (_convUnsubscribe) _convUnsubscribe()
    if (_msgUnsubscribe) _msgUnsubscribe()
    set({ _convUnsubscribe: null, _msgUnsubscribe: null })
  }
}))
