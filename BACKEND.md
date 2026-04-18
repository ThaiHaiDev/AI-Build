# 🧠 Node.js AI Agent Backend — Production-Ready Structure

> Tài liệu chuẩn cho backend AI Agent dùng Node.js + TypeScript + Express.
> **Stack**: Express · TypeScript · Zod · Hasura (GraphQL) · graphql-request · Sequelize (ORM + migration) · sequelize-cli · Pino · BullMQ · Redis · PostgreSQL · Anthropic / OpenAI SDK.
> **Đồng bộ 3 môi trường**: `development` · `staging` · `production` (cùng chuẩn với frontend).
> **Trigger flow**: Hasura Event Triggers → Backend webhook → Agent orchestration → Mutation ngược lại Hasura.

---

## 🚀 Quick Start

```bash
# 1. Cài deps
npm install

# 2. Setup env (copy template)
cp .env.example .env.development
# điền DATABASE_URL, HASURA_URL, HASURA_ADMIN_SECRET, ANTHROPIC_API_KEY...

# 3. Start infra local (postgres + hasura + redis)
docker-compose up -d

# 4. Apply DB migrations (+ optional seed)
npm run migrate
npm run seed                # optional

# 5. Generate GraphQL typed SDK (cần Hasura đang chạy)
npm run codegen

# 6. Chạy dev server
npm run dev                 # → http://localhost:3000
```

### Scripts tổng hợp

| Script | Mô tả |
|--------|-------|
| `npm run dev` | `ts-node-dev` + watch, mode=development |
| `npm run build` | Biên dịch TS → `dist/` |
| `npm run start` | Chạy prod (`node dist/index.js`, NODE_ENV=production) |
| `npm run staging` | Chạy staging (NODE_ENV=staging) |
| `npm run codegen` | Generate typed GraphQL SDK từ Hasura |
| `npm run codegen:watch` | Codegen watch mode |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run test` | Jest run 1 lần |
| `npm run test:watch` | Jest watch |
| `npm run test:cov` | Jest + coverage |
| `npm run migrate` | `sequelize-cli db:migrate` — apply pending migrations |
| `npm run migrate:undo` | Revert migration gần nhất |
| `npm run migrate:undo:all` | Revert toàn bộ (chỉ dùng dev) |
| `npm run migrate:status` | List applied / pending migrations |
| `npm run migration:create -- --name <desc>` | Sinh file migration skeleton |
| `npm run seed` | `sequelize-cli db:seed:all` |
| `npm run seed:undo` | Revert seeds |

### Environment Variables

| Biến | Required | Mô tả |
|------|----------|-------|
| `NODE_ENV` | ✅ | `development` \| `staging` \| `production` |
| `PORT` | ✅ | HTTP listen port (default 3000) |
| `DATABASE_URL` | ✅ | Postgres connection string |
| `HASURA_URL` | ✅ | Hasura GraphQL endpoint (HTTP) |
| `HASURA_ADMIN_SECRET` | ✅ | Dùng cho event trigger + codegen |
| `HASURA_EVENT_SECRET` | ✅ | Verify webhook từ Hasura |
| `ANTHROPIC_API_KEY` | ✅ | Claude API key (bắt đầu `sk-ant-`) |
| `OPENAI_API_KEY` | ❌ | OpenAI fallback/tool |
| `REDIS_URL` | ✅ | BullMQ + rate limit |
| `JWT_SECRET` | ✅ | Sign/verify JWT |
| `LOG_LEVEL` | ❌ | `debug` \| `info` \| `warn` \| `error` |
| `CORS_ORIGIN` | ✅ | FE origin whitelist |
| `SENTRY_DSN` | ❌ | Chỉ staging + prod |

---

## 📁 Full Folder Structure

```
my-agent-backend/
├── .env.development
├── .env.staging
├── .env.production
├── .env.example
├── .eslintrc.cjs
├── .prettierrc
├── .dockerignore
├── .gitignore
├── codegen.yml
├── Dockerfile
├── docker-compose.yml
├── docker-compose.staging.yml
├── jest.config.ts
├── package.json
├── tsconfig.json
│
│
├── .github/
│   └── workflows/
│       ├── ci.yml
│       ├── deploy-staging.yml
│       └── deploy-production.yml
│
├── src/
│   ├── index.ts                ← bootstrap + graceful shutdown
│   ├── app.ts                  ← Express app factory
│   │
│   ├── config/
│   │   ├── index.ts            ← Zod-validated env loader
│   │   ├── database.ts
│   │   ├── llm.ts
│   │   ├── hasura.ts
│   │   └── app.ts
│   │
│   ├── routes/                 ← chỉ wire URL ↔ controller method
│   │   ├── index.ts            ← mount tất cả route
│   │   ├── health.ts           ← /health + /ready
│   │   ├── agent.ts
│   │   ├── memory.ts
│   │   └── tools.ts
│   │
│   ├── controllers/            ← nhận req/res, gọi service, trả response
│   │   ├── AgentController.ts
│   │   ├── MemoryController.ts
│   │   └── ToolsController.ts
│   │
│   ├── middlewares/
│   │   ├── errorHandler.ts     ← centralized error + AppError
│   │   ├── rateLimiter.ts      ← Redis-backed rate limit
│   │   ├── validate.ts         ← Zod request validator
│   │   ├── requestId.ts        ← gắn req.id cho trace
│   │   └── asyncHandler.ts     ← wrapper try/catch
│   │
│   ├── auth/                   ← ⭐ Security module tự trị (tách khỏi business)
│   │   ├── index.ts            ← public API: requireAuth, requireRole, authRouter
│   │   ├── routes.ts           ← /auth/login, /refresh, /logout, /register, /me,
│   │   │                         /forgot-password, /reset-password, /verify-email,
│   │   │                         /2fa/enable, /2fa/verify, /oauth/:provider/callback
│   │   ├── controllers/
│   │   │   ├── AuthController.ts        ← login/register/refresh/logout
│   │   │   ├── PasswordController.ts    ← forgot/reset/change password
│   │   │   ├── MfaController.ts         ← 2FA (TOTP) enable/verify/disable
│   │   │   └── OAuthController.ts       ← Google/GitHub callback
│   │   ├── services/
│   │   │   ├── AuthService.ts           ← orchestrate login flow
│   │   │   ├── TokenService.ts          ← sign/verify access + refresh, rotation
│   │   │   ├── PasswordService.ts       ← argon2/bcrypt hash + verify
│   │   │   ├── SessionService.ts        ← track refresh token family, revoke
│   │   │   ├── OtpService.ts            ← TOTP + email OTP
│   │   │   └── OAuthService.ts          ← exchange code → user profile
│   │   ├── strategies/                  ← 1 file / 1 cách xác thực
│   │   │   ├── jwt.strategy.ts          ← verify access token (Bearer)
│   │   │   ├── refresh.strategy.ts      ← verify refresh token (httpOnly cookie)
│   │   │   ├── local.strategy.ts        ← email + password
│   │   │   ├── hasura.strategy.ts       ← verify Hasura JWT claims (x-hasura-*)
│   │   │   └── oauth/
│   │   │       ├── google.strategy.ts
│   │   │       └── github.strategy.ts
│   │   ├── middlewares/
│   │   │   ├── requireAuth.ts           ← verify access token → req.user
│   │   │   ├── requireRole.ts           ← RBAC theo role
│   │   │   ├── requirePermission.ts     ← fine-grained permission check
│   │   │   ├── optionalAuth.ts          ← attach req.user nếu có, không throw
│   │   │   ├── csrf.ts                  ← double-submit cookie cho cookie-auth
│   │   │   └── authRateLimiter.ts       ← brute-force guard (per IP + per email)
│   │   ├── guards/
│   │   │   ├── ownerOrAdmin.guard.ts    ← chỉ owner hoặc admin truy cập resource
│   │   │   └── sameTenant.guard.ts      ← multi-tenant isolation
│   │   ├── schemas/                     ← Zod validators
│   │   │   ├── login.schema.ts
│   │   │   ├── register.schema.ts
│   │   │   ├── password.schema.ts
│   │   │   └── mfa.schema.ts
│   │   ├── stores/                      ← persistence layer cho auth state
│   │   │   ├── refreshTokenStore.ts     ← Redis: jti → userId, family, exp
│   │   │   ├── revokedTokenStore.ts     ← blacklist jti đã logout/đổi mật khẩu
│   │   │   └── otpStore.ts              ← Redis TTL cho OTP 1 lần
│   │   ├── utils/
│   │   │   ├── hash.ts                  ← argon2id config (m=64MB, t=3, p=4)
│   │   │   ├── token.ts                 ← jti generator, claims builder
│   │   │   ├── cookie.ts                ← secure cookie helpers (httpOnly, SameSite)
│   │   │   └── crypto.ts                ← timing-safe compare, random bytes
│   │   ├── events/                      ← audit log emitters
│   │   │   └── authEvents.ts            ← 'auth.login.success', 'auth.login.fail'...
│   │   ├── constants.ts                 ← roles, permissions, token TTL
│   │   ├── types.ts                     ← JwtPayload, AuthUser, TokenPair
│   │   └── errors.ts                    ← AuthError, InvalidCredentialsError...
│   │
│   ├── agent/                  ← Agent core (implement theo domain)
│   │   ├── AgentRunner.ts
│   │   ├── LLMClient.ts
│   │   ├── Planner.ts
│   │   ├── ToolCaller.ts
│   │   ├── PromptBuilder.ts
│   │   └── OutputParser.ts
│   │
│   ├── tools/
│   │   ├── ToolRegistry.ts
│   │   ├── webSearch.ts
│   │   ├── codeRunner.ts
│   │   ├── fileSystem.ts
│   │   └── apiCaller.ts
│   │
│   ├── graphql/
│   │   ├── hasuraClient.ts     ← typed SDK (getSdk())
│   │   ├── queries/
│   │   │   ├── getSession.ts
│   │   │   └── getHistory.ts
│   │   ├── mutations/
│   │   │   ├── saveMessage.ts
│   │   │   └── upsertSession.ts
│   │   ├── eventHandlers/
│   │   │   ├── index.ts        ← dispatcher (Express router)
│   │   │   ├── types.ts
│   │   │   ├── onMessageCreated.ts
│   │   │   ├── onSessionStarted.ts
│   │   │   └── onTaskCompleted.ts
│   │   └── generated/
│   │       └── types.ts        ← auto-gen, DO NOT EDIT
│   │
│   ├── http/
│   │   ├── axiosClient.ts      ← shared axios + retry
│   │   ├── interceptors/
│   │   │   ├── authInterceptor.ts
│   │   │   └── retryInterceptor.ts
│   │   └── services/
│   │       ├── externalApi.ts
│   │       └── searchService.ts
│   │
│   ├── services/               ← business logic thuần, không đụng req/res
│   │   ├── AgentService.ts
│   │   ├── SessionService.ts
│   │   ├── MessageService.ts
│   │   ├── TaskService.ts
│   │   ├── UserService.ts
│   │   ├── MemoryService.ts
│   │   ├── ToolService.ts
│   │   └── NotificationService.ts
│   │
│   ├── jobs/                   ← Cronjob definitions (BullMQ repeatable)
│   │   ├── index.ts            ← register toàn bộ schedule khi boot
│   │   ├── cleanupSessions.job.ts
│   │   ├── retryFailedTasks.job.ts
│   │   └── dailyReport.job.ts
│   │
│   ├── workers/                ← BullMQ workers (xử lý job, bao gồm cron jobs)
│   │   ├── agentWorker.ts
│   │   ├── cronWorker.ts       ← consume queue 'cron'
│   │   └── notificationWorker.ts
│   │
│   ├── database/              ← Sequelize ORM + migration hub
│   │   ├── config.ts          ← sequelize-cli config (per-env)
│   │   ├── sequelize.ts       ← Sequelize instance singleton
│   │   ├── migrations/        ← YYYYMMDDHHMMSS-<name>.ts
│   │   │   └── 20260417000000-init.ts
│   │   ├── seeds/
│   │   │   └── 20260417000000-demo-users.ts
│   │   └── models/
│   │       ├── index.ts       ← auto-load + associate
│   │       ├── User.ts
│   │       ├── Session.ts
│   │       ├── Message.ts
│   │       └── Task.ts
│   │
│   ├── memory/
│   │   └── MemoryStore.ts
│   │
│   ├── helpers/
│   │   ├── retry.ts
│   │   ├── sleep.ts
│   │   └── hash.ts
│   │
│   ├── shared/
│   │   ├── constants.ts
│   │   ├── enums.ts
│   │   └── errors.ts           ← AppError, NotFoundError...
│   │
│   ├── types/
│   │   ├── express.d.ts        ← augment Request (user, id)
│   │   ├── agent.types.ts
│   │   ├── tool.types.ts
│   │   └── memory.types.ts
│   │
│   ├── validators/
│   │   ├── agent.schema.ts
│   │   └── tool.schema.ts
│   │
│   └── lib/
│       ├── logger.ts           ← pino + request context
│       ├── queue.ts            ← BullMQ queues
│       └── sentry.ts
│
└── tests/
    ├── unit/
    ├── integration/
    └── mocks/
```

---

## 🌍 01 — Environment Configuration

Mỗi môi trường có file `.env` riêng. `config/index.ts` load đúng file theo `NODE_ENV` và validate toàn bộ biến bằng Zod để **fail sớm** thay vì crash lúc runtime.

### `.env.development`
```env
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/agent_dev
HASURA_URL=http://localhost:8080/v1/graphql
HASURA_ADMIN_SECRET=myadminsecretkey
HASURA_EVENT_SECRET=dev-event-secret
ANTHROPIC_API_KEY=sk-ant-dev-xxxx
REDIS_URL=redis://localhost:6379
JWT_SECRET=dev-jwt-secret-change-me
LOG_LEVEL=debug
CORS_ORIGIN=http://localhost:5173
```

### `.env.staging`
```env
NODE_ENV=staging
PORT=3000
DATABASE_URL=postgresql://user:pass@staging-db.internal:5432/agent_staging
HASURA_URL=https://hasura-staging.myapp.com/v1/graphql
HASURA_ADMIN_SECRET=${HASURA_ADMIN_SECRET}
HASURA_EVENT_SECRET=${HASURA_EVENT_SECRET}
ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY}
REDIS_URL=redis://staging-redis.internal:6379
JWT_SECRET=${JWT_SECRET}
LOG_LEVEL=info
CORS_ORIGIN=https://staging.myapp.com
SENTRY_DSN=${SENTRY_DSN}
```

### `.env.production`
```env
NODE_ENV=production
PORT=3000
DATABASE_URL=${DATABASE_URL}
HASURA_URL=${HASURA_URL}
HASURA_ADMIN_SECRET=${HASURA_ADMIN_SECRET}
HASURA_EVENT_SECRET=${HASURA_EVENT_SECRET}
ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY}
REDIS_URL=${REDIS_URL}
JWT_SECRET=${JWT_SECRET}
LOG_LEVEL=error
CORS_ORIGIN=https://myapp.com
SENTRY_DSN=${SENTRY_DSN}
```

### `.env.example` (commit)
```env
NODE_ENV=development
PORT=3000
DATABASE_URL=
HASURA_URL=
HASURA_ADMIN_SECRET=
HASURA_EVENT_SECRET=
ANTHROPIC_API_KEY=
REDIS_URL=
JWT_SECRET=
LOG_LEVEL=debug
CORS_ORIGIN=
SENTRY_DSN=
```

### `src/config/index.ts`
```ts
import { z } from 'zod'
import dotenv from 'dotenv'
import path from 'path'

const env = process.env.NODE_ENV ?? 'development'
dotenv.config({ path: path.resolve(process.cwd(), `.env.${env}`) })

const schema = z.object({
  NODE_ENV:            z.enum(['development', 'staging', 'production']).default('development'),
  PORT:                z.coerce.number().default(3000),
  DATABASE_URL:        z.string().url(),
  HASURA_URL:          z.string().url(),
  HASURA_ADMIN_SECRET: z.string().min(1),
  HASURA_EVENT_SECRET: z.string().min(1),
  ANTHROPIC_API_KEY:   z.string().startsWith('sk-ant-'),
  OPENAI_API_KEY:      z.string().optional(),
  REDIS_URL:           z.string().url(),
  JWT_SECRET:          z.string().min(16),
  LOG_LEVEL:           z.enum(['debug', 'info', 'warn', 'error']).default('info'),
  CORS_ORIGIN:         z.string().default('*'),
  SENTRY_DSN:          z.string().url().optional().or(z.literal('')),
})

const parsed = schema.safeParse(process.env)

if (!parsed.success) {
  console.error('❌ Invalid environment config:')
  console.error(parsed.error.format())
  process.exit(1)
}

export const config = parsed.data
export type Config = typeof parsed.data

export const isDev     = config.NODE_ENV === 'development'
export const isStaging = config.NODE_ENV === 'staging'
export const isProd    = config.NODE_ENV === 'production'
```

### `src/config/hasura.ts`
```ts
import { config } from './index'

export const hasuraConfig = {
  url: config.HASURA_URL,
  adminSecret: config.HASURA_ADMIN_SECRET,
  eventSecret: config.HASURA_EVENT_SECRET,
  wsUrl: config.HASURA_URL.replace('https', 'wss').replace('http', 'ws'),
}
```

### `src/config/llm.ts`
```ts
import { config, isProd } from './index'

export const llmConfig = {
  provider: 'anthropic' as const,
  apiKey: config.ANTHROPIC_API_KEY,
  model: isProd ? 'claude-opus-4-7' : 'claude-haiku-4-5-20251001',
  maxTokens: 4096,
  temperature: 0.7,
}
```

### `src/config/app.ts`
```ts
import { config } from './index'

export const appConfig = {
  port: config.PORT,
  corsOrigin: config.CORS_ORIGIN.split(',').map((s) => s.trim()),
  requestTimeout: 30_000,
  bodyLimit: '10mb',
}
```

### `package.json` scripts
```json
{
  "scripts": {
    "dev":              "NODE_ENV=development ts-node-dev --respawn --transpile-only src/index.ts",
    "staging":          "NODE_ENV=staging node dist/index.js",
    "start":            "NODE_ENV=production node dist/index.js",
    "build":            "tsc",
    "codegen":          "dotenv -e .env.development -- graphql-codegen --config codegen.yml",
    "codegen:watch":    "dotenv -e .env.development -- graphql-codegen --config codegen.yml --watch",
    "lint":             "eslint . --ext ts --max-warnings 0",
    "typecheck":        "tsc --noEmit",
    "test":             "jest",
    "test:watch":       "jest --watch",
    "test:cov":         "jest --coverage",

    "sequelize":         "sequelize-cli --migrations-path src/database/migrations --seeders-path src/database/seeds --models-path src/database/models --config src/database/config.ts",
    "migrate":           "npm run sequelize -- db:migrate",
    "migrate:undo":      "npm run sequelize -- db:migrate:undo",
    "migrate:undo:all":  "npm run sequelize -- db:migrate:undo:all",
    "migrate:status":    "npm run sequelize -- db:migrate:status",
    "migration:create":  "npm run sequelize -- migration:generate",
    "seed":              "npm run sequelize -- db:seed:all",
    "seed:undo":         "npm run sequelize -- db:seed:undo:all"
  }
}
```

---

## 🧱 02 — Bootstrap & Lifecycle

### `src/index.ts`
```ts
import 'dotenv/config'
import { createApp } from './app'
import { config } from './config'
import { logger } from './lib/logger'
import { sequelize } from './database/sequelize'
import { closeQueues } from './lib/queue'

async function main() {
  const app = createApp()
  const server = app.listen(config.PORT, () => {
    logger.info(`🚀 Server listening on :${config.PORT} (${config.NODE_ENV})`)
  })

  const shutdown = async (signal: string) => {
    logger.info(`Received ${signal}, shutting down gracefully...`)

    server.close(async () => {
      try {
        await closeQueues()
        await sequelize.close()
        logger.info('Clean shutdown complete')
        process.exit(0)
      } catch (err) {
        logger.error({ err }, 'Error during shutdown')
        process.exit(1)
      }
    })

    // Force exit sau 10s
    setTimeout(() => {
      logger.error('Forced shutdown after timeout')
      process.exit(1)
    }, 10_000).unref()
  }

  process.on('SIGTERM', () => shutdown('SIGTERM'))
  process.on('SIGINT',  () => shutdown('SIGINT'))

  process.on('unhandledRejection', (reason) => {
    logger.error({ reason }, 'Unhandled rejection')
  })
  process.on('uncaughtException', (err) => {
    logger.fatal({ err }, 'Uncaught exception')
    process.exit(1)
  })
}

main().catch((err) => {
  logger.fatal({ err }, 'Failed to start server')
  process.exit(1)
})
```

### `src/app.ts`
```ts
import express, { Express } from 'express'
import helmet from 'helmet'
import cors from 'cors'
import compression from 'compression'
import { appConfig } from './config/app'
import { requestId } from './middlewares/requestId'
import { errorHandler, notFoundHandler } from './middlewares/errorHandler'
import { logger } from './lib/logger'
import { mountRoutes } from './routes'

export function createApp(): Express {
  const app = express()

  // Security & infra middleware
  app.use(helmet())
  app.use(cors({ origin: appConfig.corsOrigin, credentials: true }))
  app.use(compression())
  app.use(express.json({ limit: appConfig.bodyLimit }))
  app.use(express.urlencoded({ extended: true, limit: appConfig.bodyLimit }))
  app.use(requestId())

  // Access log
  app.use((req, _res, next) => {
    logger.debug({ reqId: req.id, method: req.method, url: req.url }, 'request')
    next()
  })

  // Routes
  mountRoutes(app)

  // 404 + error handlers PHẢI cuối
  app.use(notFoundHandler)
  app.use(errorHandler)

  return app
}
```

### `src/routes/index.ts`
```ts
import { Express } from 'express'
import { healthRouter } from './health'
import { agentRouter } from './agent'
import { memoryRouter } from './memory'
import { toolsRouter } from './tools'
import { eventRouter } from '../graphql/eventHandlers'

export function mountRoutes(app: Express) {
  app.use('/',        healthRouter)           // /health, /ready
  app.use('/api/agent',  agentRouter)
  app.use('/api/memory', memoryRouter)
  app.use('/api/tools',  toolsRouter)
  app.use('/webhooks',   eventRouter)         // POST /webhooks/hasura
}
```

### `src/routes/health.ts`
```ts
import { Router } from 'express'
import { sequelize } from '../database/sequelize'
import { redis } from '../lib/queue'
import { hasura } from '../graphql/hasuraClient'
import { gql } from 'graphql-request'

export const healthRouter = Router()

// Liveness: chỉ cần process còn sống
healthRouter.get('/health', (_req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() })
})

// Readiness: check tất cả dependencies
healthRouter.get('/ready', async (_req, res) => {
  const checks = await Promise.allSettled([
    sequelize.authenticate(),
    redis.ping(),
    hasura.request(gql`query Ping { __typename }`),
  ])

  const [db, cache, gql_] = checks
  const ok = checks.every((c) => c.status === 'fulfilled')

  res.status(ok ? 200 : 503).json({
    status: ok ? 'ready' : 'not_ready',
    dependencies: {
      database: db.status === 'fulfilled',
      redis:    cache.status === 'fulfilled',
      hasura:   gql_.status === 'fulfilled',
    },
  })
})
```

---

## 🛡️ 03 — Middleware Templates

### `src/middlewares/requestId.ts`
```ts
import { randomUUID } from 'crypto'
import { RequestHandler } from 'express'

declare global {
  namespace Express {
    interface Request { id: string }
  }
}

export function requestId(): RequestHandler {
  return (req, res, next) => {
    req.id = (req.headers['x-request-id'] as string) ?? randomUUID()
    res.setHeader('x-request-id', req.id)
    next()
  }
}
```

### `src/auth/` — Security module tự trị

> **Triết lý**: Auth là **security boundary**, phải cô lập khỏi business. Domain code chỉ import 2 thứ từ module này: `requireAuth`/`requireRole` (middleware) và `authRouter` (mount vào app). Mọi chi tiết (hash algorithm, token format, refresh rotation, OAuth provider...) đều ẩn sau module boundary — đổi implementation không đụng feature code.

**Access token vs Refresh token:**
- **Access token** (JWT, TTL ngắn ~15 phút) — gửi qua `Authorization: Bearer`. Stateless, verify bằng signature. Không revoke được → TTL phải ngắn.
- **Refresh token** (opaque random, TTL dài ~7–30 ngày) — gửi qua **httpOnly Secure SameSite=Strict cookie**. Lưu hash trong Redis (`refreshTokenStore`) → revoke được ngay lập tức. Rotate mỗi lần refresh (one-time use); nếu phát hiện reuse → revoke toàn bộ `family` của user (token theft detection).

#### `src/auth/constants.ts`
```ts
/**
 * Role enum — dùng chung FE / BE / Hasura.
 * Value là string lowercase (snake_case), KHÔNG ĐỔI sau khi đã seed prod
 * (vì Hasura permission rules + JWT claims + DB migrations đều khoá theo string này).
 * Thêm role mới → thêm cuối, cập nhật ROLE_HIERARCHY + ROLE_PERMISSIONS + Hasura metadata.
 */
export const ROLES = {
  SUPER_ADMIN: 'super_admin', // toàn quyền hệ thống, quản lý admin khác
  ADMIN:       'admin',       // quản trị nội dung + user
  MANAGER:     'manager',     // quản lý team / tenant
  EDITOR:      'editor',      // tạo / sửa nội dung
  USER:        'user',        // user thường đã verify
  GUEST:       'guest',       // đã đăng ký nhưng chưa verify email
  ANONYMOUS:   'anonymous',   // chưa đăng nhập — chỉ Hasura dùng
} as const

export type Role = typeof ROLES[keyof typeof ROLES]

export const ALL_ROLES: readonly Role[] = Object.values(ROLES)

/**
 * Hierarchy — số lớn = quyền cao hơn. Dùng cho check `isAtLeast(role, min)`.
 * Không phải mọi hệ thống đều tuyến tính; nếu có branching (vd: editor ≠ manager)
 * hãy dùng ROLE_PERMISSIONS thay vì hierarchy.
 */
export const ROLE_HIERARCHY: Record<Role, number> = {
  [ROLES.SUPER_ADMIN]: 100,
  [ROLES.ADMIN]:        80,
  [ROLES.MANAGER]:      60,
  [ROLES.EDITOR]:       40,
  [ROLES.USER]:         20,
  [ROLES.GUEST]:        10,
  [ROLES.ANONYMOUS]:     0,
}

export const isAtLeast = (actual: Role, min: Role): boolean =>
  ROLE_HIERARCHY[actual] >= ROLE_HIERARCHY[min]

/**
 * Fine-grained permissions. Format: '<resource>:<action>'.
 * Action chuẩn: read | write | delete | manage (manage = full CRUD + admin ops).
 */
export const PERMISSIONS = {
  // User
  USER_READ:        'user:read',
  USER_WRITE:       'user:write',
  USER_DELETE:      'user:delete',
  USER_MANAGE:      'user:manage',
  // Session
  SESSION_READ:     'session:read',
  SESSION_WRITE:    'session:write',
  SESSION_DELETE:   'session:delete',
  // Agent / content
  AGENT_READ:       'agent:read',
  AGENT_WRITE:      'agent:write',
  AGENT_DELETE:     'agent:delete',
  // System
  SYSTEM_CONFIG:    'system:config',
  SYSTEM_AUDIT_LOG: 'system:audit_log',
  BILLING_MANAGE:   'billing:manage',
} as const

export type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS]

/**
 * Role → Permissions mapping. Single source of truth cho RBAC.
 * FE copy map này (qua codegen hoặc shared package) để hiển thị UI đúng quyền.
 */
export const ROLE_PERMISSIONS: Record<Role, readonly Permission[]> = {
  [ROLES.SUPER_ADMIN]: Object.values(PERMISSIONS),
  [ROLES.ADMIN]: [
    PERMISSIONS.USER_READ, PERMISSIONS.USER_WRITE, PERMISSIONS.USER_DELETE, PERMISSIONS.USER_MANAGE,
    PERMISSIONS.SESSION_READ, PERMISSIONS.SESSION_WRITE, PERMISSIONS.SESSION_DELETE,
    PERMISSIONS.AGENT_READ, PERMISSIONS.AGENT_WRITE, PERMISSIONS.AGENT_DELETE,
    PERMISSIONS.SYSTEM_AUDIT_LOG,
  ],
  [ROLES.MANAGER]: [
    PERMISSIONS.USER_READ, PERMISSIONS.USER_WRITE,
    PERMISSIONS.SESSION_READ, PERMISSIONS.SESSION_WRITE,
    PERMISSIONS.AGENT_READ, PERMISSIONS.AGENT_WRITE,
  ],
  [ROLES.EDITOR]: [
    PERMISSIONS.AGENT_READ, PERMISSIONS.AGENT_WRITE,
    PERMISSIONS.SESSION_READ,
  ],
  [ROLES.USER]: [
    PERMISSIONS.SESSION_READ, PERMISSIONS.SESSION_WRITE,
    PERMISSIONS.AGENT_READ,
  ],
  [ROLES.GUEST]:     [PERMISSIONS.AGENT_READ],
  [ROLES.ANONYMOUS]: [],
}

export const hasPermission = (role: Role, perm: Permission): boolean =>
  ROLE_PERMISSIONS[role].includes(perm)

export const TOKEN_TTL = {
  ACCESS:  15 * 60,              // 15 phút
  REFRESH: 7  * 24 * 60 * 60,    // 7 ngày
  OTP:     5  * 60,              // 5 phút
  RESET:   30 * 60,              // 30 phút
} as const
```

> **Cảnh báo đồng bộ Hasura**: mỗi khi thêm role mới phải:
> 1. Thêm entry vào `ROLES` (BE) + mirror ở FE `src/shared/constants/roles.ts`.
> 2. Cập nhật `TokenService.issue` → `x-hasura-allowed-roles` include role mới.
> 3. Khai báo permission rules cho role mới trong Hasura metadata (`metadata/databases/default/tables/*.yaml`).
> 4. Chạy migration seed nếu có bảng `roles` reference.

#### `src/auth/types.ts`
```ts
import type { Role } from './constants'

export interface JwtPayload {
  sub: string           // user id
  role: Role
  email: string
  jti: string           // JWT ID — blacklist key
  // Hasura claims — đồng bộ với Hasura JWT config
  'https://hasura.io/jwt/claims': {
    'x-hasura-default-role':  Role
    'x-hasura-allowed-roles': Role[]
    'x-hasura-user-id':       string
  }
}

export interface TokenPair { accessToken: string; refreshToken: string }
export interface AuthUser  { id: string; email: string; role: Role }

declare global {
  namespace Express {
    interface Request { user?: AuthUser & { jti: string } }
  }
}
```

#### `src/auth/services/PasswordService.ts`
```ts
import argon2 from 'argon2'

// argon2id — OWASP recommended. KHÔNG dùng bcrypt cho code mới.
const OPTS = { type: argon2.argon2id, memoryCost: 64 * 1024, timeCost: 3, parallelism: 4 }

export const PasswordService = {
  hash:   (plain: string) => argon2.hash(plain, OPTS),
  verify: (hash: string, plain: string) => argon2.verify(hash, plain),
}
```

#### `src/auth/services/TokenService.ts`
```ts
import jwt from 'jsonwebtoken'
import { randomBytes, createHash } from 'node:crypto'
import { config } from '../../config'
import { TOKEN_TTL } from '../constants'
import { refreshTokenStore } from '../stores/refreshTokenStore'
import type { AuthUser, JwtPayload, TokenPair } from '../types'

const sha256 = (s: string) => createHash('sha256').update(s).digest('hex')

export const TokenService = {
  async issue(user: AuthUser, family = randomBytes(16).toString('hex')): Promise<TokenPair> {
    const jti = randomBytes(16).toString('hex')
    const accessToken = jwt.sign(
      {
        sub: user.id, role: user.role, email: user.email, jti,
        'https://hasura.io/jwt/claims': {
          'x-hasura-default-role':  user.role,
          'x-hasura-allowed-roles': [user.role, 'anonymous'],
          'x-hasura-user-id':       user.id,
        },
      } satisfies Omit<JwtPayload, 'iat' | 'exp'>,
      config.JWT_SECRET,
      { expiresIn: TOKEN_TTL.ACCESS, algorithm: 'HS256' },
    )

    const refreshRaw = randomBytes(48).toString('base64url')
    await refreshTokenStore.save({
      hash: sha256(refreshRaw),
      userId: user.id,
      family,
      expiresIn: TOKEN_TTL.REFRESH,
    })

    return { accessToken, refreshToken: refreshRaw }
  },

  verifyAccess(token: string): JwtPayload {
    return jwt.verify(token, config.JWT_SECRET) as JwtPayload
  },

  async rotate(refreshRaw: string): Promise<TokenPair> {
    const record = await refreshTokenStore.consume(sha256(refreshRaw))
    if (!record) {
      // Token không tồn tại hoặc đã dùng → có thể bị đánh cắp
      // nếu record.family đang tồn tại, revoke toàn bộ family
      throw new Error('REFRESH_REUSE_DETECTED')
    }
    return this.issue({ id: record.userId, email: record.email, role: record.role }, record.family)
  },
}
```

#### `src/auth/middlewares/requireAuth.ts`
```ts
import { RequestHandler } from 'express'
import { UnauthorizedError } from '../errors'
import { TokenService } from '../services/TokenService'
import { revokedTokenStore } from '../stores/revokedTokenStore'

export const requireAuth: RequestHandler = async (req, _res, next) => {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) throw new UnauthorizedError('Missing Bearer token')

  const token = header.slice('Bearer '.length)
  let payload
  try { payload = TokenService.verifyAccess(token) }
  catch { throw new UnauthorizedError('Invalid or expired token') }

  if (await revokedTokenStore.isRevoked(payload.jti)) {
    throw new UnauthorizedError('Token revoked')
  }

  req.user = { id: payload.sub, email: payload.email, role: payload.role, jti: payload.jti }
  next()
}
```

#### `src/auth/middlewares/requireRole.ts`
```ts
import { RequestHandler } from 'express'
import { ForbiddenError, UnauthorizedError } from '../errors'
import type { Role } from '../constants'

export const requireRole = (...roles: Role[]): RequestHandler => (req, _res, next) => {
  if (!req.user) throw new UnauthorizedError()
  if (!roles.includes(req.user.role as Role)) {
    throw new ForbiddenError(`Requires one of roles: ${roles.join(', ')}`)
  }
  next()
}
```

#### `src/auth/middlewares/authRateLimiter.ts`
```ts
// Brute-force guard: giới hạn theo IP + theo email (đếm riêng).
// Login fail 5 lần / 15 phút cho cùng email → lock email 30 phút.
// Login fail 20 lần / 15 phút cho cùng IP  → block IP 1 giờ.
```

#### `src/auth/routes.ts`
```ts
import { Router } from 'express'
import { AuthController } from './controllers/AuthController'
import { PasswordController } from './controllers/PasswordController'
import { MfaController } from './controllers/MfaController'
import { validate } from '../middlewares/validate'
import { requireAuth } from './middlewares/requireAuth'
import { authRateLimiter } from './middlewares/authRateLimiter'
import { loginSchema, registerSchema } from './schemas/login.schema'

export const authRouter = Router()

authRouter.post('/register',         validate(registerSchema), AuthController.register)
authRouter.post('/login',            authRateLimiter, validate(loginSchema), AuthController.login)
authRouter.post('/refresh',          AuthController.refresh)   // đọc cookie
authRouter.post('/logout',           requireAuth, AuthController.logout)
authRouter.get ('/me',               requireAuth, AuthController.me)
authRouter.post('/forgot-password',  PasswordController.forgot)
authRouter.post('/reset-password',   PasswordController.reset)
authRouter.post('/2fa/enable',       requireAuth, MfaController.enable)
authRouter.post('/2fa/verify',       requireAuth, MfaController.verify)
```

#### `src/auth/index.ts` — public API
```ts
export { authRouter } from './routes'
export { requireAuth } from './middlewares/requireAuth'
export { requireRole } from './middlewares/requireRole'
export { optionalAuth } from './middlewares/optionalAuth'
export { ROLES, PERMISSIONS } from './constants'
export type { AuthUser, Role } from './types'
```

**Nguyên tắc import:** Business code **chỉ** được import từ `@/auth` (barrel), không reach sâu vào `@/auth/services/*` hay `@/auth/stores/*`. Giữ module boundary rõ ràng.

**Security checklist cho auth module:**
- [ ] Password hash bằng **argon2id** (không bcrypt/md5/sha1).
- [ ] Access token TTL ≤ 15 phút, refresh token httpOnly cookie + rotation + family revoke.
- [ ] Refresh token lưu dưới dạng **SHA-256 hash**, không plaintext.
- [ ] Có blacklist `jti` cho logout + đổi mật khẩu (Redis với TTL = access token TTL).
- [ ] Rate limit login theo IP **và** email; response time không được lộ email có tồn tại hay không (timing-safe).
- [ ] Reset password token dùng một lần, TTL ≤ 30 phút, invalidate mọi session hiện có sau khi reset.
- [ ] 2FA dùng TOTP (RFC 6238), backup codes hash trong DB.
- [ ] OAuth: verify `state`, verify `nonce` (OIDC), không trust email chưa verified từ provider.
- [ ] Log mọi event `auth.login.fail` / `auth.token.reuse` → SIEM, cảnh báo khi bất thường.
- [ ] Header bảo mật: `helmet()` + CSRF double-submit cookie cho endpoint cookie-auth.

### `src/shared/errors.ts`
```ts
export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
    public readonly code: string = 'APP_ERROR',
    public readonly details?: unknown
  ) {
    super(message)
    this.name = this.constructor.name
    Error.captureStackTrace?.(this, this.constructor)
  }
}

export class NotFoundError     extends AppError { constructor(m='Not found')      { super(404, m, 'NOT_FOUND') } }
export class UnauthorizedError extends AppError { constructor(m='Unauthorized')   { super(401, m, 'UNAUTHORIZED') } }
export class ForbiddenError    extends AppError { constructor(m='Forbidden')      { super(403, m, 'FORBIDDEN') } }
export class ValidationError   extends AppError { constructor(m='Invalid input', d?: unknown) { super(400, m, 'VALIDATION', d) } }
export class ConflictError     extends AppError { constructor(m='Conflict')       { super(409, m, 'CONFLICT') } }
export class RateLimitError    extends AppError { constructor(m='Too many requests') { super(429, m, 'RATE_LIMIT') } }
```

### `src/middlewares/errorHandler.ts`
```ts
import { ErrorRequestHandler, RequestHandler } from 'express'
import { ZodError } from 'zod'
import { AppError } from '../shared/errors'
import { logger } from '../lib/logger'
import { isProd } from '../config'

export const notFoundHandler: RequestHandler = (req, res) => {
  res.status(404).json({
    error: { code: 'NOT_FOUND', message: `Route ${req.method} ${req.path} not found` },
  })
}

export const errorHandler: ErrorRequestHandler = (err, req, res, _next) => {
  // Zod validation error
  if (err instanceof ZodError) {
    return res.status(400).json({
      error: { code: 'VALIDATION', message: 'Invalid input', details: err.flatten() },
      requestId: req.id,
    })
  }

  // App-level typed error
  if (err instanceof AppError) {
    logger.warn({ err, reqId: req.id }, 'AppError')
    return res.status(err.statusCode).json({
      error: { code: err.code, message: err.message, details: err.details },
      requestId: req.id,
    })
  }

  // Unknown error
  logger.error({ err, reqId: req.id }, 'Unhandled error')
  res.status(500).json({
    error: {
      code: 'INTERNAL',
      message: isProd ? 'Internal server error' : (err as Error).message,
      ...(isProd ? {} : { stack: (err as Error).stack }),
    },
    requestId: req.id,
  })
}
```

### `src/middlewares/asyncHandler.ts`
```ts
import { RequestHandler } from 'express'

type Async = (...args: Parameters<RequestHandler>) => Promise<unknown>

export const asyncHandler = (fn: Async): RequestHandler =>
  (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)
```

### `src/middlewares/rateLimiter.ts`
```ts
import rateLimit from 'express-rate-limit'
import RedisStore from 'rate-limit-redis'
import { redis } from '../lib/queue'

export const globalLimiter = rateLimit({
  windowMs: 60_000,            // 1 phút
  max: 120,                     // 120 req / phút / IP
  standardHeaders: true,
  legacyHeaders: false,
  store: new RedisStore({
    sendCommand: (...args: string[]) => redis.call(...args) as Promise<any>,
    prefix: 'rl:global:',
  }),
})

export const agentLimiter = rateLimit({
  windowMs: 60_000,
  max: 10,                      // AI agent call: giới hạn chặt hơn
  store: new RedisStore({
    sendCommand: (...args: string[]) => redis.call(...args) as Promise<any>,
    prefix: 'rl:agent:',
  }),
  keyGenerator: (req) => req.user?.sub ?? req.ip!,
})
```

### `src/middlewares/validate.ts`
```ts
import { RequestHandler } from 'express'
import { ZodSchema } from 'zod'

interface Schemas {
  body?:   ZodSchema
  query?:  ZodSchema
  params?: ZodSchema
}

export const validate = (schemas: Schemas): RequestHandler => (req, _res, next) => {
  if (schemas.body)   req.body   = schemas.body.parse(req.body)
  if (schemas.query)  req.query  = schemas.query.parse(req.query) as any
  if (schemas.params) req.params = schemas.params.parse(req.params) as any
  next()
}
```

**Ví dụ sử dụng — `src/routes/agent.ts`:**
```ts
import { Router } from 'express'
import { requireAuth } from '../auth'
import { agentLimiter } from '../middlewares/rateLimiter'
import { validate } from '../middlewares/validate'
import { asyncHandler } from '../middlewares/asyncHandler'
import { runAgentSchema } from '../validators/agent.schema'
import { AgentController } from '../controllers/AgentController'

export const agentRouter = Router()
const ctrl = new AgentController()

agentRouter.post(
  '/run',
  requireAuth,
  agentLimiter,
  validate({ body: runAgentSchema }),
  asyncHandler(ctrl.run),
)
```

> Route chỉ là bảng định tuyến. Logic nằm trong controller (bóc request, gọi service, format response) và service (nghiệp vụ thuần). Xem [§ 14 — Controllers](#-14--controllers).

---

## 🎯 04 — Hasura Event Triggers

Hasura Event Triggers gọi HTTP webhook vào backend mỗi khi có `INSERT`/`UPDATE`/`DELETE` trên database. Backend nhận event, xử lý logic (trigger agent, gửi notification), rồi trả HTTP 200.

**Flow**: Database mutation → Hasura detects → `POST /webhooks/hasura` → `eventHandlers/` → business logic.

### `src/graphql/eventHandlers/types.ts`
```ts
export interface HasuraEventPayload<T = Record<string, unknown>> {
  id: string
  created_at: string
  trigger: { name: string }
  table: { schema: string; name: string }
  event: {
    session_variables: Record<string, string>
    op: 'INSERT' | 'UPDATE' | 'DELETE' | 'MANUAL'
    data: {
      old: T | null
      new: T | null
    }
  }
  delivery_info: {
    max_retries: number
    current_retry: number
  }
}

export interface HasuraEventResponse {
  message: string
  [key: string]: unknown
}
```

### `src/graphql/eventHandlers/index.ts` — dispatcher
```ts
import { Router, Request, Response, NextFunction } from 'express'
import { HasuraEventPayload } from './types'
import { onMessageCreated } from './onMessageCreated'
import { onSessionStarted } from './onSessionStarted'
import { onTaskCompleted } from './onTaskCompleted'
import { config } from '../../config'
import { logger } from '../../lib/logger'

export const eventRouter = Router()

const handlers: Record<string, (p: HasuraEventPayload) => Promise<unknown>> = {
  'on_message_created': onMessageCreated,
  'on_session_started': onSessionStarted,
  'on_task_completed':  onTaskCompleted,
}

function verifyHasuraSecret(req: Request, res: Response, next: NextFunction) {
  const secret = req.headers['x-hasura-event-secret']
  if (secret !== config.HASURA_EVENT_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' })
  }
  next()
}

eventRouter.post('/hasura', verifyHasuraSecret, async (req: Request, res: Response) => {
  const payload = req.body as HasuraEventPayload
  const triggerName = payload.trigger?.name

  logger.info({ triggerName, eventId: payload.id, reqId: req.id }, 'Hasura event received')

  const handler = handlers[triggerName]
  if (!handler) {
    logger.warn({ triggerName }, 'No handler for trigger')
    return res.status(200).json({ message: 'no_handler_skipped' })
  }

  try {
    const result = await handler(payload)
    return res.status(200).json({ message: 'ok', result })
  } catch (err) {
    logger.error({ err, triggerName }, 'Event handler failed')
    // 200 để Hasura không retry vô hạn. Muốn retry: trả 4xx/5xx.
    return res.status(200).json({ message: 'handler_error', error: String(err) })
  }
})
```

### `src/graphql/eventHandlers/onMessageCreated.ts`
```ts
import { HasuraEventPayload } from './types'
import { AgentService } from '../../services/AgentService'
import { logger } from '../../lib/logger'

interface Message {
  id: string
  session_id: string
  role: 'user' | 'assistant'
  content: string
  created_at: string
}

export async function onMessageCreated(
  payload: HasuraEventPayload<Message>
): Promise<{ agentTriggered: boolean }> {
  const message = payload.event.data.new
  if (!message) throw new Error('No new data in event')

  // Chỉ trigger agent khi USER gửi message
  if (message.role !== 'user') return { agentTriggered: false }

  logger.info({ sessionId: message.session_id }, 'User message → trigger agent')

  const service = new AgentService()
  await service.run({
    sessionId: message.session_id,
    userMessage: message.content,
  })

  return { agentTriggered: true }
}
```

### `src/graphql/eventHandlers/onSessionStarted.ts`
```ts
import { HasuraEventPayload } from './types'
import { hasura } from '../hasuraClient'
import { gql } from 'graphql-request'
import { logger } from '../../lib/logger'

interface Session {
  id: string
  user_id: string
  title: string | null
  created_at: string
}

export async function onSessionStarted(
  payload: HasuraEventPayload<Session>
): Promise<{ initialized: boolean }> {
  const session = payload.event.data.new
  if (!session) throw new Error('No session data')

  logger.info({ sessionId: session.id, userId: session.user_id }, 'New session')

  await hasura.request(gql`
    mutation InsertWelcomeMessage($sessionId: uuid!, $content: String!) {
      insert_messages_one(object: {
        session_id: $sessionId,
        role: "assistant",
        content: $content
      }) { id }
    }
  `, {
    sessionId: session.id,
    content: 'Xin chào! Tôi có thể giúp gì cho bạn hôm nay?',
  })

  return { initialized: true }
}
```

### `src/graphql/eventHandlers/onTaskCompleted.ts`
```ts
import { HasuraEventPayload } from './types'
import { NotificationService } from '../../services/NotificationSvc'
import { logger } from '../../lib/logger'

interface Task {
  id: string
  user_id: string
  status: 'pending' | 'running' | 'completed' | 'failed'
  result: string | null
  updated_at: string
}

export async function onTaskCompleted(
  payload: HasuraEventPayload<Task>
): Promise<{ notified: boolean }> {
  const oldTask = payload.event.data.old
  const newTask = payload.event.data.new

  if (!newTask || newTask.status !== 'completed') return { notified: false }
  if (oldTask?.status === 'completed') return { notified: false }

  logger.info({ taskId: newTask.id, userId: newTask.user_id }, 'Task completed, notifying')

  const notifier = new NotificationService()
  await notifier.sendWebhook({
    userId: newTask.user_id,
    event: 'task_completed',
    data: { taskId: newTask.id, result: newTask.result },
  })

  return { notified: true }
}
```

### Cấu hình Hasura Console → Events → Create Event Trigger

| Field | Value |
|-------|-------|
| Trigger name | `on_message_created` |
| Table | `messages` |
| Operations | INSERT |
| Webhook URL | `https://api.myapp.com/webhooks/hasura` |
| Headers | `x-hasura-event-secret: <secret>` |
| Retry config | 3 retries, 60s interval, 30s timeout |

---

## 🔤 05 — GraphQL Codegen

### `codegen.yml`
```yaml
overwrite: true

schema:
  - ${HASURA_URL}:
      headers:
        x-hasura-admin-secret: ${HASURA_ADMIN_SECRET}

documents:
  - 'src/graphql/queries/**/*.ts'
  - 'src/graphql/mutations/**/*.ts'

generates:
  src/graphql/generated/types.ts:
    plugins:
      - typescript
      - typescript-operations
      - typescript-graphql-request
    config:
      scalars:
        uuid: string
        timestamptz: string
        jsonb: Record<string, unknown>
        numeric: number
        bigint: number
      enumsAsTypes: true
      avoidOptionals: false
      maybeValue: T | null | undefined
      namingConvention:
        enumValues: keep
```

### Query / Mutation templates

**`src/graphql/queries/getSession.ts`**
```ts
import { gql } from 'graphql-request'

export const GET_SESSION = gql`
  query GetSession($id: uuid!) {
    sessions_by_pk(id: $id) {
      id
      user_id
      title
      created_at
      messages(order_by: { created_at: asc }) {
        id role content created_at
      }
    }
  }
`
```

**`src/graphql/queries/getHistory.ts`**
```ts
import { gql } from 'graphql-request'

export const GET_HISTORY = gql`
  query GetHistory($sessionId: uuid!, $limit: Int = 20) {
    messages(
      where: { session_id: { _eq: $sessionId } }
      order_by: { created_at: desc }
      limit: $limit
    ) {
      id role content created_at
    }
  }
`
```

**`src/graphql/mutations/saveMessage.ts`**
```ts
import { gql } from 'graphql-request'

export const SAVE_MESSAGE = gql`
  mutation SaveMessage($sessionId: uuid!, $role: String!, $content: String!) {
    insert_messages_one(object: {
      session_id: $sessionId
      role: $role
      content: $content
    }) {
      id created_at
    }
  }
`
```

**`src/graphql/mutations/upsertSession.ts`**
```ts
import { gql } from 'graphql-request'

export const UPSERT_SESSION = gql`
  mutation UpsertSession($userId: uuid!, $title: String) {
    insert_sessions_one(
      object: { user_id: $userId, title: $title }
      on_conflict: {
        constraint: sessions_pkey
        update_columns: [title]
      }
    ) {
      id created_at
    }
  }
`
```

### `src/graphql/hasuraClient.ts` — typed SDK
```ts
import { GraphQLClient } from 'graphql-request'
import { getSdk } from './generated/types'
import { config } from '../config'

const client = new GraphQLClient(config.HASURA_URL, {
  headers: {
    'x-hasura-admin-secret': config.HASURA_ADMIN_SECRET,
    'content-type': 'application/json',
  },
})

export const hasura = getSdk(client)

// Usage:
// const { sessions_by_pk } = await hasura.GetSession({ id: sessionId })
// const { insert_messages_one } = await hasura.SaveMessage({ ... })
```

### Chạy codegen
```bash
# Dùng dotenv-cli để nạp env
npx dotenv -e .env.development -- graphql-codegen --config codegen.yml

# Watch mode
npx dotenv -e .env.development -- graphql-codegen --config codegen.yml --watch
```

> Sau khi chạy: `src/graphql/generated/types.ts` có đầy đủ types + typed SDK. **Không sửa tay file này.**

---

## 🗄️ 06 — Database & Migration (Sequelize)

Sequelize là **ORM + migration tool** duy nhất. Hasura track các table Sequelize migration tạo ra. Business query API vẫn đi qua **Hasura GraphQL** (permissions + subscriptions); **Sequelize models** dùng cho: health check, admin operations, background worker (BullMQ), migration, seed, các script maintenance — nơi bạn muốn gọi `User.findAll()` / `Session.create()` trực tiếp.

### Folder layout — `src/database/`

```
src/database/
├── config.ts                ← sequelize-cli config (per-env, đọc từ src/config)
├── sequelize.ts             ← Sequelize instance singleton
├── migrations/              ← append-only. Tên: YYYYMMDDHHMMSS-<desc>.ts
│   └── 20260417000000-init.ts
├── seeds/                   ← data demo / reference
│   └── 20260417000000-demo-users.ts
└── models/
    ├── index.ts             ← load all models + wire associations
    ├── User.ts
    ├── Session.ts
    ├── Message.ts
    └── Task.ts
```

### `src/database/config.ts`
```ts
import { config as env } from '../config'

// sequelize-cli đọc object này theo key = NODE_ENV
const base = {
  url: env.DATABASE_URL,
  dialect: 'postgres' as const,
  define: { underscored: true, timestamps: true },
  migrationStorageTableName: 'sequelize_meta',
  seederStorageTableName: 'sequelize_seeds',
  seederStorage: 'sequelize' as const,
}

export default {
  development: { ...base, logging: console.log },
  staging:     { ...base, logging: false },
  production:  { ...base, logging: false },
}
```

### `src/database/sequelize.ts`
```ts
import { Sequelize } from 'sequelize'
import { config, isDev } from '../config'

export const sequelize = new Sequelize(config.DATABASE_URL, {
  dialect: 'postgres',
  logging: isDev ? (sql) => console.debug(sql) : false,
  define: {
    underscored: true,      // createdAt → created_at
    timestamps: true,
  },
  pool: { max: 10, min: 0, idle: 10_000 },
})
```

### `src/database/models/User.ts`
```ts
import { DataTypes, Model, Optional } from 'sequelize'
import { sequelize } from '../sequelize'

interface UserAttrs {
  id: string
  email: string
  name: string
  role: 'user' | 'admin'
  createdAt?: Date
  updatedAt?: Date
}
type UserCreation = Optional<UserAttrs, 'id' | 'role' | 'createdAt' | 'updatedAt'>

export class User extends Model<UserAttrs, UserCreation> implements UserAttrs {
  declare id: string
  declare email: string
  declare name: string
  declare role: 'user' | 'admin'
  declare readonly createdAt: Date
  declare readonly updatedAt: Date

  static associate(models: { Session: any; Task: any }) {
    User.hasMany(models.Session, { foreignKey: 'userId', onDelete: 'CASCADE' })
    User.hasMany(models.Task,    { foreignKey: 'userId', onDelete: 'CASCADE' })
  }
}

User.init(
  {
    id:    { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    email: { type: DataTypes.STRING, allowNull: false, unique: true },
    name:  { type: DataTypes.STRING, allowNull: false },
    role:  { type: DataTypes.STRING, allowNull: false, defaultValue: 'user' },
  },
  { sequelize, tableName: 'users', modelName: 'User' }
)
```

> `Session`, `Message`, `Task` viết theo cùng pattern. `Session.hasMany(Message)`, `Message.belongsTo(Session)`, v.v. — định nghĩa trong `associate()` của mỗi model.

### `src/database/models/index.ts`
```ts
import { sequelize } from '../sequelize'
import { User } from './User'
import { Session } from './Session'
import { Message } from './Message'
import { Task } from './Task'

const models = { User, Session, Message, Task }

Object.values(models).forEach((m: any) => {
  if (typeof m.associate === 'function') m.associate(models)
})

export { sequelize, User, Session, Message, Task }
export type DB = typeof models
```

### `src/database/migrations/20260417000000-init.ts`
```ts
import { QueryInterface, DataTypes } from 'sequelize'

export async function up(q: QueryInterface) {
  await q.createTable('users', {
    id:         { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    email:      { type: DataTypes.STRING, allowNull: false, unique: true },
    name:       { type: DataTypes.STRING, allowNull: false },
    role:       { type: DataTypes.STRING, allowNull: false, defaultValue: 'user' },
    created_at: { type: DataTypes.DATE,   allowNull: false, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE,   allowNull: false, defaultValue: DataTypes.NOW },
  })

  await q.createTable('sessions', {
    id:         { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    user_id:    { type: DataTypes.UUID, allowNull: false,
                  references: { model: 'users', key: 'id' }, onDelete: 'CASCADE' },
    title:      { type: DataTypes.STRING },
    created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  })
  await q.addIndex('sessions', ['user_id'])

  await q.createTable('messages', {
    id:         { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    session_id: { type: DataTypes.UUID, allowNull: false,
                  references: { model: 'sessions', key: 'id' }, onDelete: 'CASCADE' },
    role:       { type: DataTypes.STRING, allowNull: false },  // user | assistant | system
    content:    { type: DataTypes.TEXT,   allowNull: false },
    created_at: { type: DataTypes.DATE,   allowNull: false, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE,   allowNull: false, defaultValue: DataTypes.NOW },
  })
  await q.addIndex('messages', ['session_id', 'created_at'])

  await q.createTable('tasks', {
    id:         { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    user_id:    { type: DataTypes.UUID, allowNull: false,
                  references: { model: 'users', key: 'id' }, onDelete: 'CASCADE' },
    status:     { type: DataTypes.STRING, allowNull: false, defaultValue: 'pending' },
    result:     { type: DataTypes.TEXT },
    created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  })
  await q.addIndex('tasks', ['user_id', 'status'])
}

export async function down(q: QueryInterface) {
  await q.dropTable('tasks')
  await q.dropTable('messages')
  await q.dropTable('sessions')
  await q.dropTable('users')
}
```

### `src/database/seeds/20260417000000-demo-users.ts`
```ts
import { QueryInterface } from 'sequelize'
import { randomUUID } from 'crypto'

export async function up(q: QueryInterface) {
  await q.bulkInsert('users', [
    { id: randomUUID(), email: 'demo@myapp.com', name: 'Demo User',
      role: 'user', created_at: new Date(), updated_at: new Date() },
  ])
}

export async function down(q: QueryInterface) {
  await q.bulkDelete('users', { email: 'demo@myapp.com' })
}
```

### Ví dụ query qua model (style Sequelize/Mongoose)
```ts
import { User, Session, Message } from '../database/models'

const user  = await User.findOne({ where: { email } })
const rows  = await Session.findAll({ where: { userId: user!.id }, order: [['createdAt', 'DESC']] })
const msg   = await Message.create({ sessionId, role: 'assistant', content: 'hi' })
await Task.update({ status: 'completed' }, { where: { id: taskId } })
```

### Migration commands

| Command | Khi nào dùng |
|---------|--------------|
| `npm run migration:create -- --name add-xyz` | Sinh file skeleton trong `src/database/migrations/` |
| `npm run migrate` | Apply pending (local + staging + prod) |
| `npm run migrate:undo` | Revert migration gần nhất |
| `npm run migrate:undo:all` | Reset hoàn toàn — **chỉ dev** |
| `npm run migrate:status` | Xem applied / pending |
| `npm run seed` | Apply toàn bộ seeders |
| `npm run seed:undo` | Rollback seeders |

> `sequelize-cli` chạy TS migration qua `ts-node` — đảm bảo `.sequelizerc` hoặc flag `--require ts-node/register` được wire. Với project chạy `ts-node-dev`, thêm `"ts-node": { "transpileOnly": true }` trong `tsconfig.json`.

### Hasura track tables sau khi Sequelize migrate

Sau khi `npm run migrate` tạo tables, vào **Hasura Console → Data → Untracked tables → Track All**, hoặc gọi metadata API:

```bash
curl -X POST https://hasura.myapp.com/v1/metadata \
  -H "x-hasura-admin-secret: $HASURA_ADMIN_SECRET" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "pg_track_table",
    "args": { "source": "default", "table": { "schema": "public", "name": "messages" } }
  }'
```

> **Best practice**: commit Hasura metadata (`hasura/metadata/*`) vào repo cạnh Sequelize migrations. Apply order khi deploy: `npm run migrate` → `hasura metadata apply`.

---

## 📝 07 — Logger (Pino)

### `src/lib/logger.ts`
```ts
import pino from 'pino'
import { config, isDev, isProd } from '../config'

export const logger = pino({
  level: config.LOG_LEVEL,
  ...(isDev
    ? {
        transport: {
          target: 'pino-pretty',
          options: { colorize: true, translateTime: 'HH:MM:ss.l' },
        },
      }
    : {}),
  redact: {
    paths: [
      'req.headers.authorization',
      'req.headers.cookie',
      '*.password',
      '*.token',
      '*.apiKey',
      'config.*_SECRET',
      'config.*_KEY',
    ],
    censor: '[REDACTED]',
  },
  base: isProd ? { env: config.NODE_ENV } : undefined,
})

export function childLogger(ctx: Record<string, unknown>) {
  return logger.child(ctx)
}
```

**Pattern: logger có request context**
```ts
// Trong route/handler
const log = childLogger({ reqId: req.id, userId: req.user?.sub })
log.info('Processing agent request')
```

---

## 🚚 08 — Queue (BullMQ)

### `src/lib/queue.ts`
```ts
import { Queue, Worker, QueueEvents } from 'bullmq'
import IORedis from 'ioredis'
import { config } from '../config'
import { logger } from './logger'

export const redis = new IORedis(config.REDIS_URL, {
  maxRetriesPerRequest: null,                  // BullMQ yêu cầu null
})

const connection = { connection: redis }

// ── Queue định nghĩa ────────────────────────────────────────────────────
export const agentQueue = new Queue('agent-tasks', connection)
export const notifyQueue = new Queue('notifications', connection)

const queues = [agentQueue, notifyQueue]
const workers: Worker[] = []

export function registerWorker(worker: Worker) {
  workers.push(worker)
}

export async function closeQueues() {
  logger.info('Closing queues + workers...')
  await Promise.all([
    ...workers.map((w) => w.close()),
    ...queues.map((q) => q.close()),
  ])
  await redis.quit()
}
```

### `src/workers/agentWorker.ts`
```ts
import { Worker } from 'bullmq'
import { redis, registerWorker } from '../lib/queue'
import { AgentService } from '../services/AgentService'
import { logger } from '../lib/logger'

interface AgentJobData {
  sessionId: string
  userMessage: string
}

const worker = new Worker<AgentJobData>(
  'agent-tasks',
  async (job) => {
    logger.info({ jobId: job.id, sessionId: job.data.sessionId }, 'Processing agent job')
    const service = new AgentService()
    return service.run(job.data)
  },
  {
    connection: redis,
    concurrency: 5,
    removeOnComplete: { age: 3600, count: 1000 },
    removeOnFail: { age: 24 * 3600 },
  }
)

worker.on('failed', (job, err) => {
  logger.error({ jobId: job?.id, err }, 'Agent job failed')
})

registerWorker(worker)
```

Worker có thể chạy cùng process với HTTP (mặc định) hoặc tách thành process riêng (`node dist/workers/agentWorker.js`) khi scale.

---

## 🧪 09 — Testing (Jest)

### `jest.config.ts`
```ts
import type { Config } from 'jest'

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src', '<rootDir>/tests'],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/graphql/generated/**',
    '!src/index.ts',
  ],
  testTimeout: 15_000,
}

export default config
```

### `tests/setup.ts`
```ts
process.env.NODE_ENV = 'development'
process.env.DATABASE_URL = 'postgresql://postgres:postgres@localhost:5432/agent_test'
process.env.HASURA_URL = 'http://localhost:8080/v1/graphql'
process.env.HASURA_ADMIN_SECRET = 'testsecret'
process.env.HASURA_EVENT_SECRET = 'testevent'
process.env.ANTHROPIC_API_KEY = 'sk-ant-test'
process.env.REDIS_URL = 'redis://localhost:6379'
process.env.JWT_SECRET = 'test-jwt-secret-at-least-16-chars'
process.env.CORS_ORIGIN = '*'
```

### Ví dụ — `tests/unit/errorHandler.test.ts`
```ts
import request from 'supertest'
import express from 'express'
import { errorHandler } from '@/middlewares/errorHandler'
import { NotFoundError } from '@/shared/errors'

describe('errorHandler', () => {
  const app = express()
  app.get('/nf', () => { throw new NotFoundError('User not found') })
  app.use(errorHandler)

  it('maps AppError → correct status + body', async () => {
    const res = await request(app).get('/nf')
    expect(res.status).toBe(404)
    expect(res.body.error.code).toBe('NOT_FOUND')
    expect(res.body.error.message).toBe('User not found')
  })
})
```

### Ví dụ — `tests/integration/health.test.ts`
```ts
import request from 'supertest'
import { createApp } from '@/app'

describe('GET /health', () => {
  it('returns 200 + status ok', async () => {
    const app = createApp()
    const res = await request(app).get('/health')
    expect(res.status).toBe(200)
    expect(res.body.status).toBe('ok')
  })
})
```

> Integration tests cần Postgres + Redis thực: dùng `testcontainers` hoặc chạy `docker-compose -f docker-compose.yml up -d db redis` trước `jest`.

---

## 🐳 10 — Docker & Local Dev

### `Dockerfile`
```dockerfile
# ── Stage 1: deps ────────────────────────────────────────────────
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

# ── Stage 2: build ───────────────────────────────────────────────
FROM node:20-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# ── Stage 3: runtime ─────────────────────────────────────────────
FROM node:20-alpine AS runtime
RUN apk add --no-cache dumb-init
WORKDIR /app
ENV NODE_ENV=production

# Non-root user
RUN addgroup -g 1001 nodejs && adduser -S -u 1001 -G nodejs app
USER app

COPY --from=deps  --chown=app:nodejs /app/node_modules ./node_modules
COPY --from=build --chown=app:nodejs /app/dist         ./dist
COPY --chown=app:nodejs package*.json ./

EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s \
  CMD wget -qO- http://localhost:3000/health || exit 1

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/index.js"]
```

### `.dockerignore`
```
node_modules
dist
coverage
.git
.github
.husky
*.log
.env
.env.*
!.env.example
tests
```

### `docker-compose.yml` (local dev)
```yaml
services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: agent_dev
    ports: ["5432:5432"]
    volumes:
      - pg_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s

  hasura:
    image: hasura/graphql-engine:v2.42.0
    depends_on:
      postgres:
        condition: service_healthy
    ports: ["8080:8080"]
    environment:
      HASURA_GRAPHQL_DATABASE_URL: postgres://postgres:postgres@postgres:5432/agent_dev
      HASURA_GRAPHQL_ENABLE_CONSOLE: "true"
      HASURA_GRAPHQL_DEV_MODE: "true"
      HASURA_GRAPHQL_ADMIN_SECRET: myadminsecretkey

  redis:
    image: redis:7-alpine
    ports: ["6379:6379"]
    volumes:
      - redis_data:/data

  backend:
    build:
      context: .
      target: build          # dev → dùng stage `build` để có ts-node
    command: npm run dev
    depends_on: [postgres, hasura, redis]
    ports: ["3000:3000"]
    volumes:
      - .:/app
      - /app/node_modules
    env_file:
      - .env.development

volumes:
  pg_data:
  redis_data:
```

### `docker-compose.staging.yml` (override)
```yaml
services:
  backend:
    image: ghcr.io/yourorg/agent-backend:staging
    build: ~
    volumes: ~
    command: node dist/index.js
    env_file: .env.staging
    restart: unless-stopped
```

---

## ⚙️ 11 — CI/CD

### `.github/workflows/ci.yml`
```yaml
name: CI

on:
  pull_request:
    branches: [main, develop]
  push:
    branches: [main, develop]

jobs:
  quality:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16-alpine
        env:
          POSTGRES_USER: postgres
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: agent_test
        ports: [5432:5432]
        options: >-
          --health-cmd "pg_isready -U postgres"
          --health-interval 10s --health-retries 5
      redis:
        image: redis:7-alpine
        ports: [6379:6379]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: npm }
      - run: npm ci
      - run: npm run migrate
        env:
          NODE_ENV: development
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/agent_test
      - run: npm run lint
      - run: npm run typecheck
      - run: npm run test:cov
      - uses: actions/upload-artifact@v4
        with:
          name: coverage
          path: coverage/

  build:
    needs: quality
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: npm }
      - run: npm ci
      - run: npm run build
```

### `.github/workflows/deploy-staging.yml`
```yaml
name: Deploy Staging

on:
  push:
    branches: [develop]

jobs:
  deploy:
    runs-on: ubuntu-latest
    environment: staging
    steps:
      - uses: actions/checkout@v4
      - uses: docker/setup-buildx-action@v3
      - uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}
      - uses: docker/build-push-action@v5
        with:
          context: .
          push: true
          tags: ghcr.io/${{ github.repository }}:staging
      - name: Apply Sequelize migrations
        env:
          NODE_ENV: staging
          DATABASE_URL: ${{ secrets.DATABASE_URL_STAGING }}
        run: npm run migrate
      # TODO: Deploy Docker image (ECS/K8s/Fly.io/Render...)
```

### `.github/workflows/deploy-production.yml`
```yaml
name: Deploy Production

on:
  push:
    tags: ['v*']

jobs:
  deploy:
    runs-on: ubuntu-latest
    environment: production            # Require manual approval
    steps:
      - uses: actions/checkout@v4
      - uses: docker/setup-buildx-action@v3
      - uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}
      - uses: docker/build-push-action@v5
        with:
          context: .
          push: true
          tags: |
            ghcr.io/${{ github.repository }}:production
            ghcr.io/${{ github.repository }}:${{ github.ref_name }}
      - name: Apply Sequelize migrations
        env:
          NODE_ENV: production
          DATABASE_URL: ${{ secrets.DATABASE_URL_PRODUCTION }}
        run: npm run migrate
      # TODO: Deploy + smoke test + rollback on failure
```

---

## 🔒 12 — Security Checklist

| Mục | Thực hiện |
|-----|-----------|
| HTTP headers | `helmet()` default config |
| CORS | Whitelist từ `config.CORS_ORIGIN` — không dùng `*` ở prod |
| Rate limit | Global + per-endpoint (Redis store) |
| JWT | `JWT_SECRET` ≥ 32 chars random, không commit |
| Hasura webhook | Verify `x-hasura-event-secret` header |
| SQL injection | Sequelize/Hasura — không raw SQL. Nếu bắt buộc → dùng `sequelize.query(sql, { replacements })` parametrized |
| Log redaction | Pino `redact` cho `authorization`, `password`, `*_SECRET`, `*_KEY` |
| Dependencies | Dependabot weekly + `npm audit` trong CI |
| Secrets | Dùng GitHub Secrets / Vault / AWS Secrets Manager. Không commit `.env.*` thật |
| Input validation | Zod cho mọi request body/query/params |
| Error response | Prod: không leak stack trace |
| HTTPS | Terminate ở reverse proxy (nginx/ALB) — app nghe HTTP nội bộ |
| Non-root container | Dockerfile chạy user `app` uid 1001 |

---

## 📦 13 — Dependencies

### Runtime
```bash
npm install express helmet cors compression \
  graphql-request graphql \
  dotenv zod jsonwebtoken \
  axios axios-retry \
  ioredis bullmq \
  pg pg-hstore sequelize \
  pino pino-pretty \
  express-rate-limit rate-limit-redis \
  @sentry/node
```

### AI
```bash
npm install @anthropic-ai/sdk openai
```

### Dev
```bash
npm install -D typescript ts-node-dev \
  @types/node @types/express @types/compression @types/cors @types/jsonwebtoken \
  eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin \
  prettier eslint-config-prettier \
  jest ts-jest @types/jest supertest @types/supertest \
  sequelize-cli dotenv-cli \
  @graphql-codegen/cli \
  @graphql-codegen/typescript \
  @graphql-codegen/typescript-operations \
  @graphql-codegen/typescript-graphql-request
```

---

## 🎮 14 — Controllers

**Tách 3 lớp** rõ ràng để dễ test + dễ bảo trì:

| Lớp | Trách nhiệm | Được phép đụng |
|-----|-------------|----------------|
| **Route** (`src/routes/`) | Wire URL + middleware chain → controller method | `Router`, middleware |
| **Controller** (`src/controllers/`) | Bóc `req` (body/params/user/id), gọi service, format response `res.json(...)` | `req`, `res`, service |
| **Service** (`src/services/`) | Business logic thuần, transaction, gọi model/Hasura/queue | Sequelize, Hasura SDK, queue, service khác |

**Nguyên tắc**:
- Controller **không chứa business logic** — chỉ orchestrate input/output.
- Service **không đụng `req`/`res`** — nhận plain object, trả plain data/throw `AppError`.
- Cả hai đều có thể test độc lập.

### `src/controllers/AgentController.ts`
```ts
import { Request, Response } from 'express'
import { AgentService } from '../services/AgentService'
import { childLogger } from '../lib/logger'

export class AgentController {
  constructor(private readonly service = new AgentService()) {}

  // arrow để preserve `this` khi truyền vào Router
  run = async (req: Request, res: Response) => {
    const log = childLogger({ reqId: req.id, userId: req.user!.sub })
    log.info({ sessionId: req.body.sessionId }, 'Agent run requested')

    const result = await this.service.run({
      userId:    req.user!.sub,
      sessionId: req.body.sessionId,
      message:   req.body.message,
    })

    res.json({ result })
  }

  history = async (req: Request, res: Response) => {
    const items = await this.service.getHistory({
      userId:    req.user!.sub,
      sessionId: req.params.sessionId,
      limit:     Number(req.query.limit ?? 20),
    })
    res.json({ items })
  }
}
```

### `src/validators/agent.schema.ts`
```ts
import { z } from 'zod'

export const runAgentSchema = z.object({
  sessionId: z.string().uuid(),
  message:   z.string().min(1).max(8000),
})

export type RunAgentInput = z.infer<typeof runAgentSchema>
```

### `src/services/AgentService.ts` — **không đụng req/res**
```ts
import { AgentRunner } from '../agent/AgentRunner'
import { Message } from '../database/models'
import { hasura } from '../graphql/hasuraClient'
import { NotFoundError } from '../shared/errors'

interface RunInput {
  userId:    string
  sessionId: string
  message:   string
}

export class AgentService {
  async run({ userId, sessionId, message }: RunInput) {
    const { sessions_by_pk } = await hasura.GetSession({ id: sessionId })
    if (!sessions_by_pk || sessions_by_pk.user_id !== userId) {
      throw new NotFoundError('Session not found')
    }

    await Message.create({ sessionId, role: 'user', content: message })
    const runner = new AgentRunner()
    const reply  = await runner.run({ sessionId, userMessage: message })
    await Message.create({ sessionId, role: 'assistant', content: reply })

    return { reply }
  }

  async getHistory(_: { userId: string; sessionId: string; limit: number }) {
    // ...
  }
}
```

---

## 🧩 15 — Services Organization

`src/services/` hiện đang đặt **flat file theo domain** (`AgentService`, `SessionService`, `UserService`...). Hiện tại đủ cho medium project, **không cần chia subfolder** cho đến khi chạm các ngưỡng sau:

| Ngưỡng | Action |
|--------|--------|
| < 15 service | Giữ flat như hiện tại |
| 15–40 service | Group theo domain: `services/agent/`, `services/billing/`, `services/notification/` |
| > 40 service hoặc đa bounded-context | Tách module: `src/modules/<domain>/{controllers,services,models}` (modular monolith) |

**Convention bắt buộc**:
- **Một service = một class** export named (`export class XyzService`), không default export.
- Tên file trùng tên class: `AgentService.ts` → `class AgentService`.
- Service **không import controller/route/middleware**. Chiều phụ thuộc: `route → controller → service → (model | graphql | queue | http | service khác)`.
- Service gọi service khác qua DI constructor (ví dụ: `new NotificationService()` inject vào `AgentService`) — giúp mock khi unit test.
- Các "service" thiên về **infrastructure** (queue, logger, sequelize, sentry, hasuraClient) **KHÔNG** đặt trong `services/` — để trong `lib/`, `database/`, `http/`, `graphql/`.

**Checklist "có đủ nơi đặt service chưa"**: với stack hiện tại, 8 service sẵn trong folder tree (Agent, Session, Message, Task, User, Memory, Tool, Notification) phủ tất cả bảng DB + domain chính. Khi thêm feature → thêm file mới cùng cấp, chưa cần refactor subfolder.

---

## ⏰ 16 — Cronjobs (BullMQ repeatable)

**Dùng BullMQ repeatable job** thay vì `node-cron` in-process. Lý do: khi scale > 1 pod, `node-cron` sẽ chạy trùng; BullMQ dùng Redis lock → một instance nhận job.

**Flow**: `src/jobs/*.job.ts` định nghĩa schedule + handler → `jobs/index.ts` register khi app boot → `workers/cronWorker.ts` consume queue `cron` → gọi service tương ứng.

### `src/lib/queue.ts` — thêm queue `cron`
```ts
export const cronQueue = new Queue('cron', connection)
```

Thêm `cronQueue` vào mảng `queues` trong `closeQueues()`.

### `src/jobs/cleanupSessions.job.ts`
```ts
import { cronQueue } from '../lib/queue'
import { SessionService } from '../services/SessionService'

export const CleanupSessionsJob = {
  name:    'cleanup-sessions',
  pattern: '0 3 * * *',             // 03:00 mỗi ngày (UTC)
  tz:      'Asia/Ho_Chi_Minh',

  async register() {
    await cronQueue.add(
      this.name,
      {},
      {
        repeat: { pattern: this.pattern, tz: this.tz },
        jobId: `repeat:${this.name}`,        // dedupe khi redeploy
        removeOnComplete: { count: 50 },
        removeOnFail: { count: 100 },
      },
    )
  },

  async handle() {
    const svc = new SessionService()
    const n = await svc.purgeInactive({ olderThanDays: 30 })
    return { purged: n }
  },
}
```

### `src/jobs/retryFailedTasks.job.ts`
```ts
import { cronQueue } from '../lib/queue'
import { TaskService } from '../services/TaskService'

export const RetryFailedTasksJob = {
  name:    'retry-failed-tasks',
  pattern: '*/15 * * * *',           // mỗi 15 phút

  async register() {
    await cronQueue.add(this.name, {}, {
      repeat: { pattern: this.pattern },
      jobId: `repeat:${this.name}`,
    })
  },

  async handle() {
    const svc = new TaskService()
    return svc.retryFailedOlderThan({ minutes: 30 })
  },
}
```

### `src/jobs/index.ts` — registry + bootstrap
```ts
import { cronQueue } from '../lib/queue'
import { logger } from '../lib/logger'
import { CleanupSessionsJob } from './cleanupSessions.job'
import { RetryFailedTasksJob } from './retryFailedTasks.job'
import { DailyReportJob } from './dailyReport.job'

export const jobs = {
  [CleanupSessionsJob.name]:  CleanupSessionsJob,
  [RetryFailedTasksJob.name]: RetryFailedTasksJob,
  [DailyReportJob.name]:      DailyReportJob,
}

export async function registerCronJobs() {
  // clear các repeatable cũ trước khi đăng ký lại (tránh tích lũy khi đổi pattern)
  const repeats = await cronQueue.getRepeatableJobs()
  await Promise.all(repeats.map((r) => cronQueue.removeRepeatableByKey(r.key)))

  for (const job of Object.values(jobs)) {
    await job.register()
    logger.info({ name: job.name, pattern: job.pattern }, 'Cron job registered')
  }
}
```

### `src/workers/cronWorker.ts`
```ts
import { Worker } from 'bullmq'
import { redis, registerWorker } from '../lib/queue'
import { jobs } from '../jobs'
import { logger } from '../lib/logger'

const worker = new Worker(
  'cron',
  async (job) => {
    const def = jobs[job.name]
    if (!def) throw new Error(`Unknown cron job: ${job.name}`)
    logger.info({ name: job.name, jobId: job.id }, 'Cron fired')
    return def.handle()
  },
  { connection: redis, concurrency: 2 },
)

worker.on('failed', (job, err) => {
  logger.error({ name: job?.name, err }, 'Cron job failed')
})

registerWorker(worker)
```

### `src/index.ts` — register khi boot
```ts
import { registerCronJobs } from './jobs'
// ... trong main(), sau khi server.listen:
await registerCronJobs()
```

### Commands tham khảo

| Việc | Cách làm |
|------|----------|
| Thêm cron mới | Tạo `src/jobs/<name>.job.ts` + thêm vào `jobs` object trong `jobs/index.ts` |
| Đổi pattern | Sửa `pattern` trong file job — lần deploy kế tiếp `registerCronJobs()` tự clear + register lại |
| Chạy tay 1 lần (không chờ cron) | `cronQueue.add('cleanup-sessions', {})` — worker cùng pickup |
| Pause/resume | `cronQueue.pause()` / `cronQueue.resume()` |
| Xem lịch sắp fire | `await cronQueue.getRepeatableJobs()` |

> **Tách process khi cần scale**: `workers/cronWorker.ts` có thể chạy deployment riêng (`node dist/workers/cronWorker.js`) để không chung tài nguyên với HTTP. Khi đó `registerCronJobs()` chỉ cần chạy ở **một** process (HTTP hoặc bất kỳ) vì `jobId: repeat:<name>` đã dedupe.

---

## ✅ 17 — Agent Generation Rules

Khi AI agent sinh code từ tài liệu này, **phải tuân theo**:

1. **Mọi env access qua `config`** (đã validate bằng Zod) — không đọc trực tiếp `process.env` trong business code.
2. **Mọi DB access qua Hasura typed SDK** (cho query/mutation nghiệp vụ) **hoặc Sequelize models** (cho admin/health/worker/migration/seed) — **không raw SQL** trừ khi bắt buộc.
3. **Mọi route có Zod schema** validate body/query/params qua `validate()` middleware.
4. **Mọi async handler bọc `asyncHandler()`** — không để unhandled promise rejection.
5. **Mọi error nghiệp vụ throw `AppError` subclass** (`NotFoundError`, `UnauthorizedError`...) — không `res.status(500).send('error')` raw.
6. **Hasura event handler return 200** ngay cả khi lỗi → log lại, không để Hasura retry vô hạn. Chỉ return 4xx/5xx khi muốn retry.
7. **Mọi external HTTP qua `http/axiosClient.ts`** có retry + timeout — không `fetch` raw.
8. **Log dùng `logger` (pino)** — không `console.log` trong production code. Dùng `childLogger({ reqId })` trong request handler.
9. **GraphQL query/mutation đặt trong `src/graphql/queries/`** hoặc `mutations/` — **không inline** `gql` string rải rác trong service code.
10. **Sau khi sửa `.graphql` hoặc schema Hasura → chạy `npm run codegen`** để regen types.
11. **Migrate DB qua Sequelize migration** (`src/database/migrations/`, chạy `npm run migrate`). Không sửa schema trực tiếp trên Hasura console ở staging/prod.
12. **Heavy/async job đẩy vào BullMQ queue** — không block HTTP request > 5s.
13. **Secret không log**, không trả về trong API response, không include trong error message.
14. **Import dùng alias `@/`** — không relative path > 2 cấp.
15. **Test file nằm trong `tests/`** phản ánh cấu trúc `src/` (`tests/unit/auth/requireAuth.test.ts`).
16. **Folder convention** giữ nguyên (routes / controllers / middlewares / services / jobs / workers / graphql / agent / tools / database / ...). Feature mới tạo file trong folder đúng trách nhiệm.
17. **Route → Controller → Service**: route chỉ wire middleware + controller method. Controller xử lý `req/res`. Service chứa business logic thuần, **không đụng `req/res`**.
18. **Cronjob dùng BullMQ repeatable** (`src/jobs/*.job.ts` + `cronQueue`) — không dùng `node-cron` in-process. Job handler chỉ gọi service, không chứa logic chi tiết.
19. **Auth là module tự trị tại `src/auth/`** — business code **chỉ** import từ barrel `@/auth` (`requireAuth`, `requireRole`, `authRouter`, `ROLES`, `AuthUser`), **không** reach sâu vào `@/auth/services/*` hoặc `@/auth/stores/*`. Password hash bằng **argon2id** (cấm bcrypt/sha1/md5). Access token JWT TTL ≤ 15 phút, refresh token là opaque random lưu SHA-256 hash trong Redis, gửi qua httpOnly Secure SameSite=Strict cookie, **rotate mỗi lần refresh** + revoke cả family khi phát hiện reuse. Mọi endpoint login/register/reset phải qua `authRateLimiter` (giới hạn theo IP và theo email).

---

## 🔗 Đồng bộ Backend ↔ Frontend

Thông tin khớp với [FRONTEND.md](FRONTEND.md):

| Tài nguyên | Dev | Staging | Production |
|------------|-----|---------|-----------|
| Backend API | `http://localhost:3000/api` | `https://api-staging.myapp.com/api` | `https://api.myapp.com/api` |
| Hasura HTTP | `http://localhost:8080/v1/graphql` | `https://hasura-staging.myapp.com/v1/graphql` | `https://hasura.myapp.com/v1/graphql` |
| Hasura WS | `ws://localhost:8080/v1/graphql` | `wss://hasura-staging.myapp.com/v1/graphql` | `wss://hasura.myapp.com/v1/graphql` |
| CORS_ORIGIN (BE) | `http://localhost:5173` | `https://staging.myapp.com` | `https://myapp.com` |
| Webhook URL (Hasura → BE) | `http://host.docker.internal:3000/webhooks/hasura` | `https://api-staging.myapp.com/webhooks/hasura` | `https://api.myapp.com/webhooks/hasura` |

> BE + FE dùng chung 3 tên môi trường `development` / `staging` / `production`, file naming `.env.<env>`, JWT role names (`user`, `admin`, `anonymous`), và shape Hasura tables. JWT do BE sign, FE verify-free (chỉ gắn Bearer — Hasura kiểm claims qua `x-hasura-role`).
