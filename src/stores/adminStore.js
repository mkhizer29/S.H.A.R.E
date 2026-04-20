import { create } from 'zustand'

const VERIFICATION_QUEUE = [
  { id: 'v1', name: 'Dr. Fatima Khan', specialty: 'Trauma & PTSD', submitted: '2026-04-05', status: 'pending', license: 'PSY-2024-07834', country: 'Pakistan' },
  { id: 'v2', name: 'Dr. James Owusu', specialty: 'Addiction Recovery', submitted: '2026-04-04', status: 'pending', license: 'LPC-2022-11203', country: 'Ghana' },
  { id: 'v3', name: 'Dr. Sofia Reyes', specialty: 'Couples Therapy', submitted: '2026-04-03', status: 'review', license: 'MFT-2023-45901', country: 'Mexico' },
  { id: 'v4', name: 'Dr. Kwame Asante', specialty: 'Child Psychology', submitted: '2026-04-01', status: 'approved', license: 'PSY-2021-33112', country: 'Nigeria' },
  { id: 'v5', name: 'Dr. Lin Wei', specialty: 'OCD & Anxiety', submitted: '2026-03-30', status: 'rejected', license: 'PSY-2020-88234', country: 'Singapore' },
]

const CRISIS_FLAGS = [
  { id: 'f1', alias: 'BlueSky42', trigger: 'keyword: "can\'t go on"', time: '2026-04-07 10:22', status: 'open', severity: 'high', assignedTo: null },
  { id: 'f2', alias: 'NightOwl91', trigger: 'keyword: "hopeless"', time: '2026-04-07 09:14', status: 'reviewed', severity: 'medium', assignedTo: 'Dr. Aisha Raza' },
  { id: 'f3', alias: 'QuietMoon', trigger: 'keyword: "end it all"', time: '2026-04-06 22:45', status: 'resolved', severity: 'high', assignedTo: 'Dr. Omar Shaikh' },
  { id: 'f4', alias: 'StormCloud7', trigger: 'keyword: "no one cares"', time: '2026-04-06 18:30', status: 'open', severity: 'low', assignedTo: null },
]

export const useAdminStore = create((set) => ({
  verificationQueue: VERIFICATION_QUEUE,
  crisisFlags: CRISIS_FLAGS,
  stats: {
    totalUsers: 12847,
    activePatients: 8234,
    activePros: 193,
    revenueMTD: 4280000,
    openCrises: 2,
    pendingVerifications: 3,
    sessionsToday: 342,
    avgSessionLength: 47,
  },
  featureFlags: {
    asyncMode: true,
    moodTracker: true,
    crisisEscalation: true,
    offlineMode: false,
    smartMatchmaking: true,
  },

  approveVerification: (id) => {
    set((state) => ({
      verificationQueue: state.verificationQueue.map((v) =>
        v.id === id ? { ...v, status: 'approved' } : v
      ),
    }))
  },

  rejectVerification: (id) => {
    set((state) => ({
      verificationQueue: state.verificationQueue.map((v) =>
        v.id === id ? { ...v, status: 'rejected' } : v
      ),
    }))
  },

  resolveFlag: (id) => {
    set((state) => ({
      crisisFlags: state.crisisFlags.map((f) =>
        f.id === id ? { ...f, status: 'resolved' } : f
      ),
    }))
  },

  toggleFeature: (key) => {
    set((state) => ({
      featureFlags: { ...state.featureFlags, [key]: !state.featureFlags[key] },
    }))
  },
}))
