export const mockSessions = [
  {
    id: 'sess-1',
    professionalId: 'pro-1',
    patientId: 'patient-1',
    title: 'Cognitive Behavioral Therapy Session',
    date: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(), // Tomorrow
    duration: 50, // minutes
    status: 'upcoming',
    meetingLink: 'https://meet.jit.si/share-secure-sess-1',
    notes: ''
  },
  {
    id: 'sess-2',
    professionalId: 'pro-3',
    patientId: 'patient-1',
    title: 'Initial Intake Call',
    date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3).toISOString(), // 3 days from now
    duration: 30, // minutes
    status: 'upcoming',
    meetingLink: 'https://meet.jit.si/share-secure-sess-2',
    notes: ''
  },
  {
    id: 'sess-3',
    professionalId: 'pro-1',
    patientId: 'patient-1',
    title: 'Regular Therapy Session',
    date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(), // 1 week ago
    duration: 50, // minutes
    status: 'completed',
    meetingLink: null,
    notes: 'Discussed workplace boundaries.'
  },
  {
    id: 'sess-4',
    professionalId: 'pro-1',
    patientId: 'patient-1',
    title: 'Regular Therapy Session',
    date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14).toISOString(), // 2 weeks ago
    duration: 50, // minutes
    status: 'completed',
    meetingLink: null,
    notes: 'Introduced 4-7-8 breathing technique.'
  }
];
