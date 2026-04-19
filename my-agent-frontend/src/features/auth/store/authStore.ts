import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { AuthUser } from '../types/auth.types'

interface AuthState {
  user:            AuthUser | null
  token:           string | null
  isAuthenticated: boolean
  setAuth:         (user: AuthUser, token: string) => void
  setToken:        (token: string) => void
  logout:          () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user:            null,
      token:           null,
      isAuthenticated: false,
      setAuth: (user, token) => set({ user, token, isAuthenticated: true }),
      setToken: (token)      => set({ token }),
      logout:  ()             => set({ user: null, token: null, isAuthenticated: false }),
    }),
    {
      name:    'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ user: s.user, token: s.token, isAuthenticated: s.isAuthenticated }),
    },
  ),
)
