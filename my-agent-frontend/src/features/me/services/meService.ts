import api from '@/services/rest/api'
import { ENDPOINTS } from '@/services/rest/endpoints'

export const meService = {
  updateName: (name: string) =>
    api.patch<{ user: { id: string; name: string } }>(ENDPOINTS.AUTH.ME, { name }),

  changePassword: (currentPassword: string, newPassword: string) =>
    api.patch<{ ok: true }>(ENDPOINTS.AUTH.ME_PASSWORD, { currentPassword, newPassword }),
}
