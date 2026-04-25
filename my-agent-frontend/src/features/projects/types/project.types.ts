import type { Role } from '@/shared/constants/roles'

export type ProjectStatus = 'active' | 'archived'

export interface Project {
  id:                 string
  name:               string
  description:        string | null
  techStack:          string | null
  partnerName:        string | null
  partnerContactName: string | null
  partnerEmail:       string | null
  partnerPhone:       string | null
  status:             ProjectStatus
  archivedAt:         string | null
  createdBy:          string
  createdAt:          string
  updatedAt:          string
}

export interface ProjectMember {
  id:      string
  userId:  string
  email:   string
  name:    string
  role:    Role
  addedAt: string
  addedBy: string
}

export interface UserSummary {
  id:    string
  email: string
  name:  string
  role:  Role
}

export interface CreateProjectInput {
  name:                string
  description?:        string | null
  techStack?:          string | null
  partnerName?:        string | null
  partnerContactName?: string | null
  partnerEmail?:       string | null
  partnerPhone?:       string | null
}

export type UpdateProjectInput = Partial<CreateProjectInput>

// --- Test Account Vault ---

export type Environment = 'dev' | 'staging' | 'production'
export const ENVIRONMENTS: Environment[] = ['dev', 'staging', 'production']

export interface TestAccount {
  id:          string
  projectId:   string
  environment: Environment
  label:       string
  username:    string
  password:    string
  url:         string | null
  note:        string | null
  createdBy:   string
  createdAt:   string
  updatedAt:   string
}

export type AccountsByEnv = Record<Environment, TestAccount[]>

export interface CreateTestAccountInput {
  environment: Environment
  label:       string
  username:    string
  password:    string
  url?:        string | null
  note?:       string | null
}

export type UpdateTestAccountInput = Partial<CreateTestAccountInput>
