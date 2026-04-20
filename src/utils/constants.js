export const ROLES = {
  PATIENT: 'patient',
  PROFESSIONAL: 'professional',
  ADMIN: 'admin'
};

export const ROUTES = {
  HOME: '/',
  ABOUT: '/about',
  SIGN_IN: '/signin',
  SIGN_UP: '/signup',
  
  // Patient Portal
  PATIENT_DASHBOARD: '/patient',
  PATIENT_DIRECTORY: '/patient/directory',
  PATIENT_CHAT: '/patient/chat',
  PATIENT_BOOKINGS: '/patient/bookings',
  PATIENT_MOOD: '/patient/mood',
  PATIENT_SETTINGS: '/patient/settings',

  // Professional Portal
  PRO_DASHBOARD: '/pro',
  PRO_INBOX: '/pro/inbox',
  PRO_CALENDAR: '/pro/calendar',
  PRO_CLIENTS: '/pro/clients',
  PRO_REVENUE: '/pro/revenue',
  PRO_PROFILE: '/pro/profile',

  // Admin Portal
  ADMIN_DASHBOARD: '/admin',
  ADMIN_VERIFICATION: '/admin/verification',
  ADMIN_ANALYTICS: '/admin/analytics',
  ADMIN_CRISIS: '/admin/crisis',
  ADMIN_REVENUE: '/admin/revenue',
  ADMIN_MODERATION: '/admin/moderation',
  ADMIN_CONFIG: '/admin/config'
};

export const MOOD_LEVELS = [
  { value: 1, emoji: '😢', label: 'Very Low', color: 'bg-alert-coral/20 text-alert-coral' },
  { value: 2, emoji: '🙁', label: 'Low', color: 'bg-orange-100 text-orange-600' },
  { value: 3, emoji: '😐', label: 'Okay', color: 'bg-sage-medium/30 text-text-secondary' },
  { value: 4, emoji: '🙂', label: 'Good', color: 'bg-brand-teal/20 text-brand-teal' },
  { value: 5, emoji: '😄', label: 'Great', color: 'bg-green-100 text-green-700' }
];

export const SPECIALTIES = [
  'Anxiety', 'Depression', 'Trauma', 'Couples', 'Family', 
  'Addiction', 'Grief', 'Stress', 'Career', 'Identity'
];
