import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      role: null,
      isAuthenticated: false,

      login: (userData) =>
        set({
          user: userData,
          token: userData.access_token || 'demo-jwt-token-active',
          role: userData.role || 'farmer',
          isAuthenticated: true,
        }),

      logout: () =>
        set({ user: null, token: null, role: null, isAuthenticated: false }),

      updateProfile: (updates) =>
        set((state) => ({
          user: { ...state.user, ...updates },
        })),
    }),
    { name: 'mandisetu-auth' }
  )
)
