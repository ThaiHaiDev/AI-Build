import { z } from 'zod'

const optionalUrl = z
  .string()
  .optional()
  .transform((v) => (v && v.length > 0 ? v : undefined))
  .refine((v) => !v || /^(https?:|wss?:)\/\//.test(v), { message: 'Must be a URL' })

const schema = z.object({
  VITE_APP_NAME:            z.string().min(1),
  VITE_APP_ENV:             z.enum(['development', 'staging', 'production']),
  VITE_API_BASE_URL:        z.string().url(),
  VITE_HASURA_HTTP_URL:     optionalUrl,
  VITE_HASURA_WS_URL:       optionalUrl,
  VITE_HASURA_ADMIN_SECRET: z.string().optional(),
  VITE_SENTRY_DSN:          z.string().url().optional().or(z.literal('')),
  VITE_LOG_LEVEL:           z.enum(['debug', 'info', 'warn', 'error']).default('info'),
})

const parsed = schema.safeParse(import.meta.env)

if (!parsed.success) {
  console.error('❌ Invalid environment config:', parsed.error.format())
  throw new Error('Environment validation failed — xem console để biết biến nào sai.')
}

export const env = parsed.data

export const isDev     = env.VITE_APP_ENV === 'development'
export const isStaging = env.VITE_APP_ENV === 'staging'
export const isProd    = env.VITE_APP_ENV === 'production'
export const hasHasura = !!(env.VITE_HASURA_HTTP_URL && env.VITE_HASURA_WS_URL)
