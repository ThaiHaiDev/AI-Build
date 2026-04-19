import type { AxiosError } from 'axios'
import i18n from '@/lib/i18n'
import type { ApiErrorBody } from '../types/auth.types'

const t = (k: string) => i18n.t(k, { ns: 'auth' }) as string

export function parseAuthError(err: unknown): string {
  const axiosErr = err as AxiosError<ApiErrorBody>
  const body     = axiosErr.response?.data

  if (!axiosErr.response) return t('errors.network')

  switch (body?.error?.code) {
    case 'EMAIL_EXISTS':         return t('errors.email_exists')
    case 'INVALID_CREDENTIALS':  return t('errors.invalid_credentials')
    case 'VALIDATION':           return t('errors.validation')
    case 'RATE_LIMITED':         return t('errors.rate_limited')
    case 'UNAUTHORIZED':         return t('errors.unauthorized')
    default:                     return body?.error?.message ?? t('errors.unknown')
  }
}
