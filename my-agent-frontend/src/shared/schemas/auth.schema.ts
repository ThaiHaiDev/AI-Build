import { z } from 'zod'
import i18n from '@/lib/i18n'

const t = (k: string, opts?: Record<string, unknown>) =>
  i18n.t(k, { ns: 'validation', ...opts }) as string

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, { message: t('required') })
    .email({ message: t('email') })
    .max(320, { message: t('max', { count: 320 }) }),
  password: z.string().min(1, { message: t('required') }),
  remember: z.boolean().optional(),
})

export type LoginInput = z.infer<typeof loginSchema>

export const registerSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, { message: t('required') })
      .max(100, { message: t('max', { count: 100 }) }),
    email: z
      .string()
      .min(1, { message: t('required') })
      .email({ message: t('email') })
      .max(320, { message: t('max', { count: 320 }) }),
    password: z
      .string()
      .min(8, { message: t('min', { count: 8 }) })
      .max(200, { message: t('max', { count: 200 }) }),
    passwordConfirm: z.string().min(1, { message: t('required') }),
  })
  .refine((v) => v.password === v.passwordConfirm, {
    path:    ['passwordConfirm'],
    message: t('passwordMismatch'),
  })

export type RegisterInput = z.infer<typeof registerSchema>

export function passwordStrength(pwd: string): 'weak' | 'medium' | 'strong' {
  if (pwd.length < 8) return 'weak'
  let score = 0
  if (/[a-z]/.test(pwd)) score++
  if (/[A-Z]/.test(pwd)) score++
  if (/\d/.test(pwd))    score++
  if (/[^a-zA-Z0-9]/.test(pwd)) score++
  if (pwd.length >= 12)  score++
  if (score <= 2) return 'weak'
  if (score <= 3) return 'medium'
  return 'strong'
}
