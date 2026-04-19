import type { AxiosError } from 'axios'
import type { ApiErrorBody } from '@/features/auth/types/auth.types'

export type ProjectErrorKind =
  | 'name_duplicate'
  | 'archived_readonly'
  | 'rate_limit'
  | 'forbidden'
  | 'not_found'
  | 'validation'
  | 'generic'

export interface ParsedProjectError {
  kind:    ProjectErrorKind
  message: string
  status?: number
  code?:   string
}

export function parseProjectError(err: unknown): ParsedProjectError {
  const ax     = err as AxiosError<ApiErrorBody>
  const status = ax.response?.status
  const code   = ax.response?.data?.error?.code
  const msg    = ax.response?.data?.error?.message ?? 'Request failed'

  if (status === 429) return { kind: 'rate_limit', message: msg, status, code }
  if (status === 403) return { kind: 'forbidden', message: msg, status, code }
  if (status === 404) return { kind: 'not_found', message: msg, status, code }
  if (status === 409) {
    if (msg.toLowerCase().includes('archived')) return { kind: 'archived_readonly', message: msg, status, code }
    return { kind: 'name_duplicate', message: msg, status, code }
  }
  if (status === 400) return { kind: 'validation', message: msg, status, code }
  return { kind: 'generic', message: msg, status, code }
}
