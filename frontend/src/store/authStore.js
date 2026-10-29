import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      role: null,
      isAuthenticated: false,

      login: (userData) =>
        set({
          user: userData,
          token: userData.access_token,
          role: userData.role,
          isAuthenticated: true,
        }),

      logout: () =>
        set({ user: null, token: null, role: null, isAuthenticated: false }),
    }),
    { name: 'mandisetu-auth' }
  )
)
