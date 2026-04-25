import api from '@/services/rest/api'
import { ENDPOINTS } from '@/services/rest/endpoints'
import type { VaultListResponse, TestAccount, CreateTestAccountInput, UpdateTestAccountInput } from '../types/project.types'

export const vaultService = {
  list:   (projectId: string) =>
    api.get<VaultListResponse>(ENDPOINTS.PROJECTS.ACCOUNTS(projectId)),

  create: (projectId: string, body: CreateTestAccountInput) =>
    api.post<{ account: TestAccount }>(ENDPOINTS.PROJECTS.ACCOUNTS(projectId), body),

  update: (projectId: string, accountId: string, body: UpdateTestAccountInput) =>
    api.patch<{ account: TestAccount }>(ENDPOINTS.PROJECTS.ACCOUNT(projectId, accountId), body),

  remove: (projectId: string, accountId: string) =>
    api.delete<void>(ENDPOINTS.PROJECTS.ACCOUNT(projectId, accountId)),
}
