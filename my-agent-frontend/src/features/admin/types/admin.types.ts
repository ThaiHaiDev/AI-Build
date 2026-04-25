import type { Role } from '@/shared/constants/roles'

export interface AdminUser {
  id:          string
  email:       string
  name:        string
  role:        Role
  permissions: string[]
  createdAt:   string
  isActive?:   boolean
}

export interface CreateUserInput {
  email:    string
  name:     string
  password: string
  role?:    Role
}
