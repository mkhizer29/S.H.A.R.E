export const mockConversations = [
  {
    id: 'conv-1',
    professionalId: 'pro-1',
    patientId: 'patient-1',
    lastMessage: 'I understand completely. We can work on strategies for that tomorrow.',
    lastMessageTimestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    unreadCount: 0,
    messages: [
      {
        id: 'msg-1',
        senderId: 'patient-1',
        text: 'I\'ve been feeling really overwhelmed with work lately.',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
        status: 'read'
      },
      {
        id: 'msg-2',
        senderId: 'pro-1',
        text: 'I hear you. The transition back to the office can be a lot. How are you managing your evenings?',
        timestamp: new Date(Date.now() - 1000 * 60 * 55).toISOString(),
        status: 'read'
      },
      {
        id: 'msg-3',
        senderId: 'patient-1',
        text: 'Mostly just doomscrolling. I can\'t seem to disconnect.',
        timestamp: new Date(Date.now() - 1000 * 60 * 40).toISOString(),
        status: 'read'
      },
      {
        id: 'msg-4',
        senderId: 'pro-1',
        text: 'I understand completely. We can work on strategies for that tomorrow.',
        timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        status: 'read'
      }
    ]
  },
  {
    id: 'conv-2',
    professionalId: 'pro-3',
    patientId: 'patient-1',
    lastMessage: 'Looking forward to our first session next week.',
    lastMessageTimestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    unreadCount: 0,
    messages: [
      {
        id: 'msg-5',
        senderId: 'pro-3',
        text: 'Hello! I saw you booked an introductory session. Please fill out the intake form when you have a moment.',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
        status: 'read'
      },
      {
        id: 'msg-6',
        senderId: 'patient-1',
        text: 'Done! Looking forward to it.',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
        status: 'read'
      },
      {
        id: 'msg-7',
        senderId: 'pro-3',
        text: 'Looking forward to our first session next week.',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
        status: 'read'
      }
    ]
  }
];
