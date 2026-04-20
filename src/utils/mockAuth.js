import useAuthStore from '../stores/authStore';
import { mockUsers } from '../data/users';

// Simulated auth service
export const mockAuthService = {
  login: async (email, password, expectedRole) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Find user by role for our mock flow
        let user = null;
        if (expectedRole === 'patient') user = mockUsers.patient;
        else if (expectedRole === 'professional') user = mockUsers.professional;
        else if (expectedRole === 'admin') user = mockUsers.admin;

        if (user) {
          useAuthStore.getState().login(user);
          resolve(user);
        } else {
          reject(new Error('Invalid credentials'));
        }
      }, 800); // simulate network delay
    });
  },

  logout: async () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        useAuthStore.getState().logout();
        resolve(true);
      }, 500);
    });
  },

  register: async (userData) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newUser = {
          id: `new-${Date.now()}`,
          ...userData,
          joinDate: new Date().toISOString()
        };
        useAuthStore.getState().login(newUser);
        resolve(newUser);
      }, 1000);
    });
  }
};
