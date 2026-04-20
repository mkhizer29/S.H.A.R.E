export const mockUsers = {
  patient: {
    id: 'patient-1',
    role: 'patient',
    alias: 'BlueJay',
    email: 'patient@example.com',
    joinDate: '2023-10-15T00:00:00.000Z',
    preferences: {
      notifications: true,
      dataSharing: false,
    }
  },
  professional: {
    id: 'pro-1',
    role: 'professional',
    name: 'Dr. Sarah Jenkins',
    email: 'sarah@example.com',
    specialties: ['Anxiety', 'Depression', 'Trauma'],
    verified: true,
    joinDate: '2023-01-10T00:00:00.000Z',
  },
  admin: {
    id: 'admin-1',
    role: 'admin',
    name: 'Admin User',
    email: 'admin@share.org',
    permissions: ['all'],
  }
};
