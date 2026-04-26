export type ResourceType = 'test_account' | 'project' | 'member' | 'user'

export interface HistoryEntry {
  id:           string
  actorName:    string
  actorEmail:   string
  action:       string
  resourceType: ResourceType
  resourceName: string
  projectName:  string | null
  meta:         { before?: Record<string, unknown>; after?: Record<string, unknown> } | null
  createdAt:    string
}

export interface HistoryListResponse {
  entries: HistoryEntry[]
  total:   number
  page:    number
  limit:   number
}

export interface HistoryProjectParams {
  resourceType?: ResourceType
  action?:       string
  page?:         number
  limit?:        number
}

export interface HistoryGlobalParams extends HistoryProjectParams {
  actorId?:   string
  projectId?: string
  from?:      string
  to?:        string
}
