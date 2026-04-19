import { useAuthStore } from '../store/authStore'

export const useAuthContext = () => {
  const user            = useAuthStore((s) => s.user)
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  return {
    authUser:        user,
    permissions:     user?.permissions ?? [],
    isAuthenticated,
  }
}

export default useAuthContext
