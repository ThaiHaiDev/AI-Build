import api from '@/services/rest/api'
import { ENDPOINTS } from '@/services/rest/endpoints'
import type { AuthUser } from '../types/auth.types'

interface AuthResponse {
  user: AuthUser
  accessToken: string
}

export const authService = {
  login:    (body: { email: string; password: string })          => api.post<AuthResponse>(ENDPOINTS.AUTH.LOGIN,    body),
  register: (body: { email: string; name: string; password: string }) => api.post<AuthResponse>(ENDPOINTS.AUTH.REGISTER, body),
  logout:   ()                                                   => api.post(ENDPOINTS.AUTH.LOGOUT),
  refresh:  ()                                                   => api.post<{ accessToken: string }>(ENDPOINTS.AUTH.REFRESH),
  me:       ()                                                   => api.get<{ user: AuthUser }>(ENDPOINTS.AUTH.ME),
}
