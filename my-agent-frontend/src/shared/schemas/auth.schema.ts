import { z } from 'zod'
import i18n from '@/lib/i18n'

const t = (k: string, opts?: Record<string, unknown>) =>
  i18n.t(k, { ns: 'validation', ...opts }) as string

export const loginSchema = z.object({
  email: z.string().min(1, { message: t('required') }).email({ message: t('email') }),
  password: z.string().min(8, { message: t('min', { count: 8 }) }),
})

export type LoginInput = z.infer<typeof loginSchema>

export const registerSchema = z.object({
  name: z.string().min(1, { message: t('required') }).max(100, { message: t('max', { count: 100 }) }),
  email: z.string().min(1, { message: t('required') }).email({ message: t('email') }),
  password: z.string().min(8, { message: t('min', { count: 8 }) }),
})

export type RegisterInput = z.infer<typeof registerSchema>
