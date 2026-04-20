import { create } from 'zustand'
import { generateKeyPair, encryptMessage, decryptMessage } from '../lib/crypto'

// Generate runtime keys to simulate real E2E transport
const MY_KEYS = generateKeyPair();
const PRO_KEYS = generateKeyPair();

const INITIAL_CONVERSATIONS = [
  {
    id: 'conv-1',
    proId: 'pro-001',
    proName: 'Dr. Aisha Raza',
    proSpecialty: 'Anxiety & Trauma',
    lastMessage: 'How have you been sleeping this week?',
    lastTime: '10:42 AM',
    unread: 2,
    messages: [
      { id: 'm1', from: 'pro', text: 'Hello! How are you feeling today?', time: '10:30 AM', read: true },
      { id: 'm2', from: 'me', text: 'A bit anxious, but better than yesterday.', time: '10:33 AM', read: true },
      { id: 'm3', from: 'pro', text: 'That\'s progress. What helped you feel better?', time: '10:36 AM', read: true },
      { id: 'm4', from: 'me', text: 'The breathing exercises you suggested.', time: '10:39 AM', read: true },
      { id: 'm5', from: 'pro', text: 'Excellent. Keep that up. How have you been sleeping this week?', time: '10:42 AM', read: false },
    ],
  },
  {
    id: 'conv-2',
    proId: 'pro-002',
    proName: 'Dr. Omar Shaikh',
    proSpecialty: 'Depression & CBT',
    lastMessage: 'Your next session is on Thursday.',
    lastTime: 'Yesterday',
    unread: 0,
    messages: [
      { id: 'm1', from: 'pro', text: 'Great session today. Remember to journal daily.', time: 'Yesterday 4:00 PM', read: true },
      { id: 'm2', from: 'me', text: 'I will, thank you.', time: 'Yesterday 4:05 PM', read: true },
      { id: 'm3', from: 'pro', text: 'Your next session is on Thursday.', time: 'Yesterday 4:06 PM', read: true },
    ],
  },
  {
    id: 'conv-3',
    proId: 'pro-003',
    proName: 'Dr. Priya Menon',
    proSpecialty: 'Grief & Loss',
    lastMessage: 'Take your time. I\'m here whenever you\'re ready.',
    lastTime: 'Mon',
    unread: 1,
    messages: [
      { id: 'm1', from: 'me', text: 'I\'m struggling to talk about this.', time: 'Mon 2:10 PM', read: true },
      { id: 'm2', from: 'pro', text: 'Take your time. I\'m here whenever you\'re ready.', time: 'Mon 2:15 PM', read: false },
    ],
  },
]

export const useChatStore = create((set, get) => ({
  conversations: INITIAL_CONVERSATIONS,
  activeConvId: 'conv-1',
  isTyping: false,

  setActiveConv: (id) => {
    set((state) => ({
      activeConvId: id,
      conversations: state.conversations.map((c) =>
        c.id === id ? { ...c, unread: 0, messages: c.messages.map((m) => ({ ...m, read: true })) } : c
      ),
    }))
  },

  sendMessage: (text) => {
    const { activeConvId } = get()

    // 1. Encrypt message locally before it "leaves" the device
    console.log(`[E2E] Original outgoing message: "${text}"`);
    const encryptedPayload = encryptMessage(text, PRO_KEYS.publicKey, MY_KEYS.secretKey);
    console.log(`[E2E] Ciphertext stored in database: ${encryptedPayload.ciphertext.substring(0, 30)}...`);

    // 2. Decode it back immediately to render in our mock UI (simulating the client reading its own message)
    // Normally, the client saves its own sent messages in local DB, or decrypts incoming from remote.
    const decryptedTextForUI = decryptMessage(encryptedPayload.ciphertext, encryptedPayload.nonce, MY_KEYS.publicKey, PRO_KEYS.secretKey);

    const newMsg = {
      id: `m-${Date.now()}`,
      from: 'me',
      text: decryptedTextForUI, // Proving it survived encrypt->decrypt cycle
      _cipherBlob: encryptedPayload.ciphertext, // Hide this in state to prove it's encrypted
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      read: true,
    }
    set((state) => ({
      conversations: state.conversations.map((c) =>
        c.id === activeConvId
          ? { ...c, messages: [...c.messages, newMsg], lastMessage: text, lastTime: 'Now', unread: 0 }
          : c
      ),
      isTyping: true,
    }))
    // Simulate reply
    setTimeout(() => {
      const replies = [
        'That\'s really insightful to share.',
        'I hear you. Can you tell me more?',
        'Thank you for opening up. How does that make you feel?',
        'That takes courage. I\'m proud of your progress.',
        'Let\'s explore that together in our next session.',
      ]
      const rawReplyText = replies[Math.floor(Math.random() * replies.length)];
      
      // Pro encrypts their reply
      const proEncrypted = encryptMessage(rawReplyText, MY_KEYS.publicKey, PRO_KEYS.secretKey);
      
      // We receive ciphertext and decrypt it locally to render
      const patientDecrypted = decryptMessage(proEncrypted.ciphertext, proEncrypted.nonce, PRO_KEYS.publicKey, MY_KEYS.secretKey);

      const reply = {
        id: `m-${Date.now() + 1}`,
        from: 'pro',
        text: patientDecrypted,
        _cipherBlob: proEncrypted.ciphertext,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        read: true,
      }
      set((state) => ({
        isTyping: false,
        conversations: state.conversations.map((c) =>
          c.id === activeConvId
            ? { ...c, messages: [...c.messages, reply], lastMessage: reply.text, lastTime: 'Now' }
            : c
        ),
      }))
    }, 1800)
  },

  getActiveConv: () => {
    const { conversations, activeConvId } = get()
    return conversations.find((c) => c.id === activeConvId)
  },
}))
