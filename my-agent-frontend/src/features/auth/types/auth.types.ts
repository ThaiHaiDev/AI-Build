import type { Role } from '@/shared/constants/roles'

export interface AuthUser {
  id:          string
  email:       string
  role:        Role
  name:        string
  createdAt:   string
  permissions: string[]
}

export interface TokenPair {
  accessToken:   string
  refreshToken?: string
}

export interface ApiErrorBody {
  error: {
    code:    string
    message: string
    details?: Record<string, string[]>
  }
  requestId?: string
}
