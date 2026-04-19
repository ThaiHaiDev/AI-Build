import * as Sentry from '@sentry/react'
import { env, isDev } from '@/config/env'

export function initSentry() {
  if (isDev || !env.VITE_SENTRY_DSN) return

  Sentry.init({
    dsn: env.VITE_SENTRY_DSN,
    environment: env.VITE_APP_ENV,
    tracesSampleRate: env.VITE_APP_ENV === 'production' ? 0.1 : 1.0,
    integrations: [Sentry.browserTracingIntegration(), Sentry.replayIntegration()],
  })
}
