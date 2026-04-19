import * as Sentry from '@sentry/react'
import { env } from '@/config/env'

type Level = 'debug' | 'info' | 'warn' | 'error'
const order: Record<Level, number> = { debug: 0, info: 1, warn: 2, error: 3 }
const threshold = order[env.VITE_LOG_LEVEL]

const should = (level: Level) => order[level] >= threshold

/* eslint-disable no-console */
export const logger = {
  debug: (msg: string, ctx?: unknown) => { if (should('debug')) console.debug(msg, ctx) },
  info:  (msg: string, ctx?: unknown) => { if (should('info'))  console.info(msg, ctx) },
  warn:  (msg: string, ctx?: unknown) => {
    if (!should('warn')) return
    console.warn(msg, ctx)
    Sentry.addBreadcrumb({ level: 'warning', message: msg, data: ctx as Record<string, unknown> })
  },
  error: (msg: string, ctx?: unknown) => {
    if (!should('error')) return
    console.error(msg, ctx)
    Sentry.captureMessage(msg, { level: 'error', extra: { ctx } })
  },
}
