import type { Role } from '@/shared/constants/roles'

export interface AuthUser {
  id:          string
  email:       string
  name:        string
  role:        Role
  permissions: string[]
}

export interface TokenPair {
  accessToken:   string
  refreshToken?: string
}
