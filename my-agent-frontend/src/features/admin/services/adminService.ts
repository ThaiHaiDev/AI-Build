import api from '@/services/rest/api'
import { ENDPOINTS } from '@/services/rest/endpoints'
import type { AdminUser, CreateUserInput } from '../types/admin.types'
import type { Role } from '@/shared/constants/roles'

export const adminService = {
  listUsers: (params?: { role?: Role; isActive?: 'true' | 'false'; search?: string }) =>
    api.get<{ users: AdminUser[] }>(ENDPOINTS.ADMIN.USERS, { params }),

  createUser: (body: CreateUserInput) =>
    api.post<{ user: AdminUser }>(ENDPOINTS.ADMIN.USERS, body),

  changeRole: (userId: string, role: Role) =>
    api.patch<{ user: AdminUser }>(ENDPOINTS.ADMIN.USER_ROLE(userId), { role }),

  deactivateUser: (userId: string) =>
    api.patch<{ user: AdminUser }>(ENDPOINTS.ADMIN.USER_DEACTIVATE(userId)),
}
