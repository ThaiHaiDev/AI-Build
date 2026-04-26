import api from '@/services/rest/api'
import { ENDPOINTS } from '@/services/rest/endpoints'
import type { HistoryListResponse, HistoryProjectParams, HistoryGlobalParams } from '../types/history.types'

export const historyService = {
  listByProject: (projectId: string, params?: HistoryProjectParams) =>
    api.get<HistoryListResponse>(ENDPOINTS.PROJECTS.HISTORY(projectId), { params }),

  listGlobal: (params?: HistoryGlobalParams) =>
    api.get<HistoryListResponse>(ENDPOINTS.ADMIN.HISTORY, { params }),
}
