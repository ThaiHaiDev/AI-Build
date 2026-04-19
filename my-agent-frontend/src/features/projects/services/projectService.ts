import api from '@/services/rest/api'
import { ENDPOINTS } from '@/services/rest/endpoints'
import type {
  Project,
  ProjectMember,
  UserSummary,
  CreateProjectInput,
  UpdateProjectInput,
} from '../types/project.types'

export const projectService = {
  list: (includeArchived = false) =>
    api.get<{ projects: Project[] }>(ENDPOINTS.PROJECTS.LIST, {
      params: includeArchived ? { includeArchived: 'true' } : undefined,
    }),

  detail: (id: string) => api.get<{ project: Project }>(ENDPOINTS.PROJECTS.DETAIL(id)),

  create: (body: CreateProjectInput) =>
    api.post<{ project: Project }>(ENDPOINTS.PROJECTS.CREATE, body),

  update: (id: string, body: UpdateProjectInput) =>
    api.patch<{ project: Project }>(ENDPOINTS.PROJECTS.UPDATE(id), body),

  archive: (id: string) => api.post<{ project: Project }>(ENDPOINTS.PROJECTS.ARCHIVE(id)),

  unarchive: (id: string) => api.post<{ project: Project }>(ENDPOINTS.PROJECTS.UNARCHIVE(id)),

  listMembers: (id: string) =>
    api.get<{ members: ProjectMember[] }>(ENDPOINTS.PROJECTS.MEMBERS(id)),

  addMember: (id: string, userId: string) =>
    api.post<{ members: ProjectMember[] }>(ENDPOINTS.PROJECTS.MEMBERS(id), { userId }),

  removeMember: (id: string, userId: string) =>
    api.delete<{ members: ProjectMember[] }>(ENDPOINTS.PROJECTS.MEMBER(id, userId)),

  searchUsers: (search: string) =>
    api.get<{ users: UserSummary[] }>(ENDPOINTS.USERS.SEARCH, { params: { search } }),
}
