# 🗂️ Frontend Project — Production-Ready Structure

> Tài liệu chuẩn để team và AI agent sinh code tự động cho dự án frontend.
> **Stack**: React 18 + TypeScript + Vite + TailwindCSS + React Router v6 + Zustand + Axios (REST) + Apollo Client / graphql-request (GraphQL/Hasura)
> **Đồng bộ 3 môi trường**: `development` · `staging` · `production` (cùng chuẩn với backend)

---

## 🚀 Quick Start

```bash
# 1. Cài dependencies
npm install

# 2. Setup env (copy template, điền giá trị)
cp .env.example .env.development

# 3. Chạy dev server (mặc định mode=development)
npm run dev                  # → http://localhost:5173

# 4. Build cho từng môi trường
npm run build:staging
npm run build                # production

# 5. Preview bundle đã build
npm run preview:staging
npm run preview
```

### Scripts tổng hợp

| Script | Mô tả |
|--------|-------|
| `npm run dev` | Dev server, hot reload, mode=development |
| `npm run build` | Build production (ra `dist/`) |
| `npm run build:staging` | Build staging (ra `dist/`) |
| `npm run preview` | Serve `dist/` local để kiểm tra build prod |
| `npm run preview:staging` | Serve build staging |
| `npm run lint` | ESLint toàn repo |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run test` | Vitest chạy 1 lần |
| `npm run test:watch` | Vitest watch mode |
| `npm run test:coverage` | Vitest + coverage report |
| `npm run codegen` | Generate GraphQL types từ Hasura schema |
| `npm run codegen:watch` | Codegen watch mode |

### Environment Variables

| Biến | Required | Mô tả |
|------|----------|-------|
| `VITE_APP_NAME` | ✅ | Tên app hiển thị |
| `VITE_APP_ENV` | ✅ | `development` \| `staging` \| `production` |
| `VITE_API_BASE_URL` | ✅ | REST API gốc (khớp với BE) |
| `VITE_HASURA_HTTP_URL` | ✅ | Hasura GraphQL HTTP endpoint |
| `VITE_HASURA_WS_URL` | ✅ | Hasura WebSocket (subscription) |
| `VITE_HASURA_ADMIN_SECRET` | ❌ | Chỉ dev, prod phải dùng JWT |
| `VITE_SENTRY_DSN` | ❌ | Sentry DSN (chỉ staging + prod) |
| `VITE_LOG_LEVEL` | ❌ | `debug` \| `info` \| `warn` \| `error` |

---

## 📁 Directory Tree

```
my-app/
├── environment/                    # ⭐ 3 file env tách riêng, ngang cấp src/
│   ├── .env.development
│   ├── .env.staging
│   ├── .env.production
│   └── .env.example                # Commit file này
│
├── public/
│   ├── favicon.ico
│   ├── robots.txt
│   └── assets/
│       └── images/                  # Static images không qua Vite pipeline
│
├── src/
│   ├── main.tsx                     # Entry point – mount React vào #root
│   ├── App.tsx                      # Root component – setup Router, Provider
│   ├── vite-env.d.ts                # Vite type declarations
│   │
│   ├── assets/                      # Static assets xử lý qua Vite
│   │   ├── images/
│   │   ├── icons/
│   │   └── fonts/
│   │
│   ├── config/                      # ⭐ NEW – Runtime config validated
│   │   └── env.ts                   # Zod-validated env access
│   │
│   ├── components/                  # Shared/reusable UI components
│   │   ├── ui/                      # Primitives (Button, Input, Modal...)
│   │   │   ├── Button/
│   │   │   │   ├── Button.tsx
│   │   │   │   ├── Button.test.tsx
│   │   │   │   ├── Button.types.ts
│   │   │   │   └── index.ts
│   │   │   ├── Input/
│   │   │   ├── Modal/
│   │   │   ├── Spinner/
│   │   │   └── index.ts
│   │   │
│   │   ├── layout/                  # Layout components
│   │   │   ├── Header/
│   │   │   ├── Sidebar/
│   │   │   ├── Footer/
│   │   │   ├── PageWrapper/
│   │   │   └── index.ts
│   │   │
│   │   └── common/                  # Business-common components
│   │       ├── ErrorBoundary/
│   │       ├── ProtectedRoute/
│   │       ├── SEO/
│   │       └── index.ts
│   │
│   ├── pages/                       # Route-level page components
│   │   ├── Home/
│   │   │   ├── Home.tsx
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   └── index.ts
│   │   ├── Dashboard/
│   │   ├── Login/
│   │   ├── NotFound/
│   │   └── index.ts
│   │
│   ├── features/                    # Feature modules (domain-driven)
│   │   ├── auth/
│   │   │   ├── components/
│   │   │   │   ├── AuthRoute.tsx       # ⭐ Guard cho login/register (redirect nếu đã auth)
│   │   │   │   ├── ProtectedRoute.tsx  # ⭐ Guard auth + permission
│   │   │   │   └── index.ts
│   │   │   ├── hooks/
│   │   │   │   ├── useAuthContext.ts   # ⭐ Selector từ authStore
│   │   │   │   ├── useHasPermission.ts # ⭐ Check permission cho action/UI
│   │   │   │   └── index.ts
│   │   │   ├── store/
│   │   │   │   └── authStore.ts
│   │   │   ├── services/
│   │   │   │   └── authService.ts
│   │   │   ├── types/
│   │   │   │   └── auth.types.ts
│   │   │   └── index.ts
│   │   ├── users/
│   │   └── products/
│   │
│   ├── hooks/                       # Global custom hooks
│   │   ├── useDebounce.ts
│   │   ├── useLocalStorage.ts
│   │   ├── useMediaQuery.ts
│   │   ├── usePagination.ts
│   │   └── index.ts
│   │
│   ├── store/                       # Global state (Zustand)
│   │   ├── index.ts
│   │   ├── uiStore.ts
│   │   └── appStore.ts
│   │
│   ├── services/                    # API layer
│   │   ├── rest/
│   │   │   ├── api.ts               # Axios instance + interceptors
│   │   │   ├── endpoints.ts
│   │   │   └── index.ts
│   │   ├── graphql/
│   │   │   ├── queries/
│   │   │   ├── mutations/
│   │   │   ├── subscriptions/
│   │   │   ├── generated/
│   │   │   │   └── graphql.ts       # Auto-gen, DO NOT EDIT
│   │   │   └── index.ts
│   │   └── index.ts
│   │
│   ├── router/                      # Routing configuration
│   │   ├── index.tsx
│   │   ├── routes.ts
│   │   └── LazyRoutes.tsx
│   │
│   ├── types/                       # Global TypeScript types
│   │   ├── api.types.ts
│   │   ├── graphql.types.ts
│   │   ├── common.types.ts
│   │   └── index.ts
│   │
│   ├── utils/                       # Pure utility functions
│   │   ├── formatters.ts
│   │   ├── validators.ts
│   │   ├── helpers.ts
│   │   ├── constants.ts
│   │   └── index.ts
│   │
│   ├── shared/                      # ⭐ Cross-feature shared resources
│   │   ├── components/              # Shared business components (dùng nhiều feature)
│   │   │   ├── DataTable/
│   │   │   ├── FormField/           # Wrapper react-hook-form + UI
│   │   │   ├── ConfirmDialog/
│   │   │   └── index.ts
│   │   ├── hooks/                   # Hooks dùng chung nhiều feature
│   │   │   ├── useForm.ts           # Wrapper react-hook-form + zodResolver
│   │   │   ├── useQueryParams.ts
│   │   │   └── index.ts
│   │   ├── schemas/                 # Zod schemas dùng chung (login, common...)
│   │   │   ├── auth.schema.ts
│   │   │   ├── user.schema.ts
│   │   │   └── index.ts
│   │   ├── types/                   # Types dùng chung giữa features
│   │   │   └── index.ts
│   │   ├── constants/
│   │   │   ├── roles.ts             # ⭐ Role enum — mirror BE/src/auth/constants.ts
│   │   │   ├── permissions.ts       # ⭐ Permission enum strings (server-granted)
│   │   │   └── index.ts
│   │   └── index.ts
│   │
│   ├── lib/                         # Third-party wrappers/configs
│   │   ├── axios.ts
│   │   ├── apolloClient.ts
│   │   ├── hasuraClient.ts
│   │   ├── sentry.ts                # ⭐ NEW
│   │   ├── logger.ts                # ⭐ NEW
│   │   ├── dayjs.ts
│   │   └── i18n.ts
│   │
│   ├── locales/                     # ⭐ NEW – i18n resources
│   │   ├── en/
│   │   │   ├── common.json
│   │   │   ├── auth.json
│   │   │   ├── validation.json
│   │   │   └── index.ts             # Re-export namespaces
│   │   ├── vi/
│   │   │   ├── common.json
│   │   │   ├── auth.json
│   │   │   ├── validation.json
│   │   │   └── index.ts
│   │   └── index.ts                 # Resources map { en, vi }
│   │
│   ├── styles/
│   │   ├── index.css
│   │   ├── variables.css
│   │   └── animations.css
│   │
│   └── test/                        # ⭐ NEW – Test infrastructure
│       ├── setup.ts                 # Vitest global setup
│       ├── utils.tsx                # Custom render, test utils
│       └── mocks/
│           ├── server.ts            # MSW node server
│           ├── handlers.ts          # REST + GraphQL handlers
│           └── data/                # Fixture data
│
├── .env.development                 # ⭐ 3 envs đồng bộ với BE
├── .env.staging                     # ⭐ NEW
├── .env.production
├── .env.example                     # Commit cái này, KHÔNG commit .env thật
├── .eslintrc.cjs
├── .prettierrc
├── .editorconfig
├── .gitignore
├── .dockerignore                    # ⭐ NEW
├── .husky/
│   └── pre-commit                   # ⭐ NEW
├── .github/
│   └── workflows/                   # ⭐ NEW
│       ├── ci.yml
│       ├── deploy-staging.yml
│       └── deploy-production.yml
├── Dockerfile                       # ⭐ NEW
├── nginx.conf                       # ⭐ NEW
├── docker-compose.yml               # ⭐ NEW (optional local)
├── lint-staged.config.js            # ⭐ NEW
├── codegen.ts
├── index.html
├── package.json
├── tsconfig.json
├── tsconfig.node.json
├── tailwind.config.ts
├── postcss.config.cjs
├── vitest.config.ts                 # ⭐ NEW
└── vite.config.ts
```

---

## 🌍 Environment Configuration — 3 Môi Trường

> **Nguyên tắc**: Vite load file `.env.<mode>` theo flag `--mode`. Tất cả biến **client-side phải có prefix `VITE_`**. Giá trị được đọc qua `src/config/env.ts` đã validate bằng Zod — fail sớm lúc boot thay vì undefined lúc runtime.

### `.env.development`
```env
VITE_APP_NAME=MyApp (Dev)
VITE_APP_ENV=development
VITE_API_BASE_URL=http://localhost:3000/api
VITE_HASURA_HTTP_URL=http://localhost:8080/v1/graphql
VITE_HASURA_WS_URL=ws://localhost:8080/v1/graphql
VITE_HASURA_ADMIN_SECRET=myadminsecretkey
VITE_SENTRY_DSN=
VITE_LOG_LEVEL=debug
```

### `.env.staging`
```env
VITE_APP_NAME=MyApp (Staging)
VITE_APP_ENV=staging
VITE_API_BASE_URL=https://api-staging.myapp.com/api
VITE_HASURA_HTTP_URL=https://hasura-staging.myapp.com/v1/graphql
VITE_HASURA_WS_URL=wss://hasura-staging.myapp.com/v1/graphql
VITE_SENTRY_DSN=https://xxx@sentry.io/staging
VITE_LOG_LEVEL=info
```

### `.env.production`
```env
VITE_APP_NAME=MyApp
VITE_APP_ENV=production
VITE_API_BASE_URL=https://api.myapp.com/api
VITE_HASURA_HTTP_URL=https://hasura.myapp.com/v1/graphql
VITE_HASURA_WS_URL=wss://hasura.myapp.com/v1/graphql
VITE_SENTRY_DSN=https://xxx@sentry.io/production
VITE_LOG_LEVEL=error
```

### `.env.example` (commit vào repo)
```env
VITE_APP_NAME=
VITE_APP_ENV=development
VITE_API_BASE_URL=
VITE_HASURA_HTTP_URL=
VITE_HASURA_WS_URL=
VITE_HASURA_ADMIN_SECRET=
VITE_SENTRY_DSN=
VITE_LOG_LEVEL=info
```

### `src/config/env.ts` — Zod validator
```ts
import { z } from 'zod'

const schema = z.object({
  VITE_APP_NAME:            z.string().min(1),
  VITE_APP_ENV:             z.enum(['development', 'staging', 'production']),
  VITE_API_BASE_URL:        z.string().url(),
  VITE_HASURA_HTTP_URL:     z.string().url(),
  VITE_HASURA_WS_URL:       z.string().url(),
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
```

### `package.json` scripts
```json
{
  "scripts": {
    "start:dev":        "cross-env NODE_ENV=development vite --mode development",
    "start:staging":    "cross-env NODE_ENV=staging vite --mode staging",
    "start:prod":       "cross-env NODE_ENV=production vite --mode production",
    
    "build:dev":        "cross-env NODE_ENV=development tsc -b && vite build --mode development",
    "build:staging":    "cross-env NODE_ENV=staging tsc -b && vite build --mode staging",
    "build:prod":       "cross-env NODE_ENV=production tsc -b && vite build --mode production",
    "build":            "npm run build:prod",
    
    "preview":          "vite preview --mode production",
    "preview:staging":  "vite preview --mode staging",
    
    "dev":              "npm run start:dev",
    "lint":             "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
    "typecheck":        "tsc --noEmit",
    "test":             "vitest run",
    "test:watch":       "vitest",
    "test:coverage":    "vitest run --coverage",
    "codegen":          "graphql-codegen --config codegen.ts",
    "codegen:watch":    "graphql-codegen --config codegen.ts --watch",
    "prepare":          "husky install"
  }
}
```

---

## 📄 Core File Templates

### `src/main.tsx`
```tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { ApolloProvider } from '@apollo/client'
import { apolloClient } from '@/lib/apolloClient'
import { initSentry } from '@/lib/sentry'
import { router } from '@/router'
import '@/styles/index.css'

initSentry()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ApolloProvider client={apolloClient}>
      <RouterProvider router={router} />
    </ApolloProvider>
  </React.StrictMode>
)
```

### `src/App.tsx`
```tsx
import { Outlet } from 'react-router-dom'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { ErrorBoundary } from '@/components/common/ErrorBoundary'

export default function App() {
  return (
    <ErrorBoundary>
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1">
          <Outlet />
        </main>
        <Footer />
      </div>
    </ErrorBoundary>
  )
}
```

### `src/router/routes.ts` — config-driven

```ts
import type { ComponentType } from 'react'
import type { Permission } from '@/shared/constants/permissions'
import { PERMISSIONS } from '@/shared/constants/permissions'

export type RouteType = 'public' | 'auth' | 'protected'

export interface AppRoute {
  path:         string
  routeType:    RouteType
  permissions?: Permission[]           // chỉ dùng khi routeType === 'protected'
  lazy:         () => Promise<{ default: ComponentType }>
}

/** Bảng path constants — dùng cho Navigate / Link. */
export const routes = {
  home:      '/',
  login:     '/login',
  register:  '/register',
  dashboard: '/dashboard',
  notFound:  '/404',
} as const

export const appRoutes: AppRoute[] = [
  { path: routes.home,      routeType: 'public',    lazy: () => import('@/pages/Home') },
  { path: routes.login,     routeType: 'auth',      lazy: () => import('@/pages/Login') },
  { path: routes.register,  routeType: 'auth',      lazy: () => import('@/pages/Register') },
  { path: routes.dashboard, routeType: 'protected', lazy: () => import('@/pages/Dashboard') },
  { path: '/users',         routeType: 'protected', permissions: [PERMISSIONS.USER_READ],   lazy: () => import('@/pages/Users') },
  { path: '/users/manage',  routeType: 'protected', permissions: [PERMISSIONS.USER_MANAGE], lazy: () => import('@/pages/UserManage') },
  { path: routes.notFound,  routeType: 'public',    lazy: () => import('@/pages/NotFound') },
]
```

### `src/router/LazyRoutes.tsx` — helper wrap Suspense
```tsx
import { lazy as reactLazy, Suspense, type ComponentType } from 'react'
import { Spinner } from '@/components/ui/Spinner'

export const lazyComponent = (loader: () => Promise<{ default: ComponentType }>) => {
  const Cmp = reactLazy(loader)
  return (
    <Suspense fallback={<Spinner fullscreen />}>
      <Cmp />
    </Suspense>
  )
}
```

### `src/router/index.tsx` — loop config, wrap đúng guard
```tsx
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import App from '@/App'
import { appRoutes } from './routes'
import { lazyComponent } from './LazyRoutes'
import { AuthRoute } from '@/features/auth/components/AuthRoute'
import { ProtectedRoute } from '@/features/auth/components/ProtectedRoute'
import NotFoundPage from '@/pages/NotFound'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    errorElement: <NotFoundPage />,
    children: appRoutes.map(({ path, routeType, permissions, lazy }) => {
      const element = lazyComponent(lazy)
      return {
        path,
        element:
          routeType === 'auth' ? (
            <AuthRoute element={element} />
          ) : routeType === 'protected' ? (
            <ProtectedRoute element={element} permissions={permissions} />
          ) : (
            element
          ),
      }
    }),
  },
])

export const AppRouter = () => <RouterProvider router={router} />
```

---

## 🔌 REST API – Axios Setup

### `src/services/rest/api.ts`
```ts
import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios'
import { env } from '@/config/env'
import { useAuthStore } from '@/features/auth/store/authStore'
import { logger } from '@/lib/logger'

const api: AxiosInstance = axios.create({
  baseURL: env.VITE_API_BASE_URL,
  timeout: 10_000,
  headers: { 'Content-Type': 'application/json' },
})

// ── Request interceptor: đính Bearer token ────────────────────────────────
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = useAuthStore.getState().token
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
  },
  (error) => Promise.reject(error)
)

// ── Response interceptor: auto-refresh token khi 401 ──────────────────────
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      try {
        const { data } = await axios.post(`${env.VITE_API_BASE_URL}/auth/refresh`, {
          token: useAuthStore.getState().token,
        })
        useAuthStore.getState().setAuth(useAuthStore.getState().user!, data.token)
        originalRequest.headers.Authorization = `Bearer ${data.token}`
        return api(originalRequest)
      } catch (refreshErr) {
        logger.warn('Refresh token failed, logging out')
        useAuthStore.getState().logout()
      }
    }

    return Promise.reject(error)
  }
)

export default api
```

### `src/services/rest/endpoints.ts`
```ts
export const ENDPOINTS = {
  AUTH: {
    LOGIN:    '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT:   '/auth/logout',
    REFRESH:  '/auth/refresh',
    ME:       '/auth/me',
  },
  USERS: {
    LIST:   '/users',
    DETAIL: (id: string) => `/users/${id}`,
    UPDATE: (id: string) => `/users/${id}`,
    DELETE: (id: string) => `/users/${id}`,
  },
  PRODUCTS: {
    LIST:   '/products',
    DETAIL: (id: string) => `/products/${id}`,
    CREATE: '/products',
    UPDATE: (id: string) => `/products/${id}`,
    DELETE: (id: string) => `/products/${id}`,
  },
} as const
```

### Ví dụ service — `src/features/users/services/userService.ts`
```ts
import api from '@/services/rest/api'
import { ENDPOINTS } from '@/services/rest/endpoints'
import type { ApiResponse, PaginatedResponse } from '@/types/api.types'
import type { User } from '../types/user.types'

export const userService = {
  getList: (params?: { page?: number; limit?: number }) =>
    api.get<PaginatedResponse<User>>(ENDPOINTS.USERS.LIST, { params }),

  getById: (id: string) =>
    api.get<ApiResponse<User>>(ENDPOINTS.USERS.DETAIL(id)),

  update: (id: string, payload: Partial<User>) =>
    api.put<ApiResponse<User>>(ENDPOINTS.USERS.UPDATE(id), payload),

  delete: (id: string) =>
    api.delete<ApiResponse<null>>(ENDPOINTS.USERS.DELETE(id)),
}
```

---

## 🚀 GraphQL / Hasura Setup

### Chiến lược kép

| Client | Dùng khi | Package |
|--------|---------|---------|
| **Apollo Client** | Cần caching, subscription real-time, devtools | `@apollo/client graphql graphql-ws` |
| **graphql-request** | Query/mutation đơn giản, bundle nhỏ | `graphql-request graphql` |

### `src/lib/apolloClient.ts`
```ts
import { ApolloClient, InMemoryCache, createHttpLink, split } from '@apollo/client'
import { setContext } from '@apollo/client/link/context'
import { GraphQLWsLink } from '@apollo/client/link/subscriptions'
import { getMainDefinition } from '@apollo/client/utilities'
import { createClient } from 'graphql-ws'
import { env, isDev } from '@/config/env'
import { useAuthStore } from '@/features/auth/store/authStore'

const httpLink = createHttpLink({ uri: env.VITE_HASURA_HTTP_URL })

const authLink = setContext((_, { headers }) => {
  const token = useAuthStore.getState().token
  return {
    headers: {
      ...headers,
      ...(token
        ? { Authorization: `Bearer ${token}` }
        : isDev && env.VITE_HASURA_ADMIN_SECRET
          ? { 'x-hasura-admin-secret': env.VITE_HASURA_ADMIN_SECRET }
          : {}),
      'x-hasura-role': useAuthStore.getState().user?.role ?? 'anonymous',
    },
  }
})

const wsLink = new GraphQLWsLink(
  createClient({
    url: env.VITE_HASURA_WS_URL,
    connectionParams: () => {
      const token = useAuthStore.getState().token
      return {
        headers: token
          ? { Authorization: `Bearer ${token}` }
          : isDev && env.VITE_HASURA_ADMIN_SECRET
            ? { 'x-hasura-admin-secret': env.VITE_HASURA_ADMIN_SECRET }
            : {},
      }
    },
  })
)

const splitLink = split(
  ({ query }) => {
    const def = getMainDefinition(query)
    return def.kind === 'OperationDefinition' && def.operation === 'subscription'
  },
  wsLink,
  authLink.concat(httpLink)
)

export const apolloClient = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: { fetchPolicy: 'cache-and-network' },
  },
})
```

### `src/lib/hasuraClient.ts`
```ts
import { GraphQLClient } from 'graphql-request'
import { env, isDev } from '@/config/env'
import { useAuthStore } from '@/features/auth/store/authStore'

export const hasuraClient = new GraphQLClient(env.VITE_HASURA_HTTP_URL, {
  headers: () => {
    const token = useAuthStore.getState().token
    return {
      ...(token
        ? { Authorization: `Bearer ${token}` }
        : isDev && env.VITE_HASURA_ADMIN_SECRET
          ? { 'x-hasura-admin-secret': env.VITE_HASURA_ADMIN_SECRET }
          : {}),
      'x-hasura-role': useAuthStore.getState().user?.role ?? 'anonymous',
    }
  },
})

export async function gqlRequest<T>(
  query: string,
  variables?: Record<string, unknown>
): Promise<T> {
  try {
    return await hasuraClient.request<T>(query, variables)
  } catch (error: any) {
    const gqlErrors = error?.response?.errors
    if (gqlErrors?.length) throw new Error(gqlErrors[0].message)
    throw error
  }
}
```

### `.graphql` files — query/mutation/subscription

**`src/services/graphql/queries/users.graphql`**
```graphql
query GetUsers($limit: Int = 10, $offset: Int = 0, $where: users_bool_exp = {}) {
  users(limit: $limit, offset: $offset, where: $where, order_by: { created_at: desc }) {
    id
    name
    email
    role
    created_at
    updated_at
  }
  users_aggregate(where: $where) {
    aggregate { count }
  }
}

query GetUserById($id: uuid!) {
  users_by_pk(id: $id) {
    id name email role created_at updated_at
  }
}
```

**`src/services/graphql/mutations/users.graphql`**
```graphql
mutation CreateUser($object: users_insert_input!) {
  insert_users_one(object: $object) {
    id name email role created_at
  }
}

mutation UpdateUser($id: uuid!, $set: users_set_input!) {
  update_users_by_pk(pk_columns: { id: $id }, _set: $set) {
    id name email role updated_at
  }
}

mutation DeleteUser($id: uuid!) {
  delete_users_by_pk(id: $id) { id }
}
```

**`src/services/graphql/subscriptions/notifications.graphql`**
```graphql
subscription OnNotifications($userId: uuid!) {
  notifications(
    where: { user_id: { _eq: $userId }, read: { _eq: false } }
    order_by: { created_at: desc }
  ) {
    id title body read created_at
  }
}
```

### Hook Apollo — `src/features/users/hooks/useUsers.ts`
```ts
import { useQuery, useMutation, gql } from '@apollo/client'
import type { User } from '../types/user.types'

const GET_USERS = gql`
  query GetUsers($limit: Int, $offset: Int) {
    users(limit: $limit, offset: $offset, order_by: { created_at: desc }) {
      id name email role created_at
    }
    users_aggregate { aggregate { count } }
  }
`

const DELETE_USER = gql`
  mutation DeleteUser($id: uuid!) {
    delete_users_by_pk(id: $id) { id }
  }
`

export function useUsers(page = 1, limit = 10) {
  const offset = (page - 1) * limit

  const { data, loading, error, refetch } = useQuery(GET_USERS, {
    variables: { limit, offset },
    fetchPolicy: 'cache-and-network',
  })

  const [deleteUser, { loading: deleting }] = useMutation(DELETE_USER, {
    update(cache, { data: result }) {
      const normalizedId = cache.identify({
        __typename: 'users',
        id: result.delete_users_by_pk.id,
      })
      cache.evict({ id: normalizedId })
      cache.gc()
    },
  })

  return {
    users: (data?.users ?? []) as User[],
    total: data?.users_aggregate?.aggregate?.count ?? 0,
    loading,
    deleting,
    error,
    refetch,
    deleteUser: (id: string) => deleteUser({ variables: { id } }),
  }
}
```

### Hook subscription — `src/features/notifications/hooks/useNotifications.ts`
```ts
import { useSubscription, gql } from '@apollo/client'
import { useAuthStore } from '@/features/auth/store/authStore'

const ON_NOTIFICATIONS = gql`
  subscription OnNotifications($userId: uuid!) {
    notifications(
      where: { user_id: { _eq: $userId }, read: { _eq: false } }
      order_by: { created_at: desc }
    ) {
      id title body read created_at
    }
  }
`

export function useNotifications() {
  const userId = useAuthStore((s) => s.user?.id)

  const { data, loading, error } = useSubscription(ON_NOTIFICATIONS, {
    variables: { userId },
    skip: !userId,
  })

  return {
    notifications: data?.notifications ?? [],
    loading,
    error,
  }
}
```

### `codegen.ts` — graphql-codegen
```ts
import type { CodegenConfig } from '@graphql-codegen/cli'
import 'dotenv/config'

const config: CodegenConfig = {
  schema: {
    [process.env.VITE_HASURA_HTTP_URL!]: {
      headers: {
        'x-hasura-admin-secret': process.env.VITE_HASURA_ADMIN_SECRET!,
      },
    },
  },
  documents: ['src/**/*.graphql'],
  generates: {
    'src/services/graphql/generated/graphql.ts': {
      plugins: ['typescript', 'typescript-operations', 'typescript-react-apollo'],
      config: {
        withHooks: true,
        withComponent: false,
        withHOC: false,
        scalars: {
          uuid: 'string',
          timestamptz: 'string',
          jsonb: 'Record<string, unknown>',
          numeric: 'number',
          bigint: 'number',
        },
      },
    },
  },
}

export default config
```

> Chạy: `npm run codegen` (hoặc `codegen:watch` khi dev).

---

## 🗃️ State Management — Zustand

### `src/shared/constants/roles.ts` — Role enum (đồng bộ Backend)

> **Cảnh báo**: các string value ở đây phải **khớp tuyệt đối** với `BACKEND/src/auth/constants.ts` và Hasura metadata. Đổi 1 phía → vỡ JWT claim matching. Nếu có thể, sinh file này bằng codegen từ BE hoặc đặt trong shared package (`packages/shared-types`) và import cả 2 bên.

```ts
export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN:       'admin',
  MANAGER:     'manager',
  EDITOR:      'editor',
  USER:        'user',
  GUEST:       'guest',
  ANONYMOUS:   'anonymous',
} as const

export type Role = typeof ROLES[keyof typeof ROLES]

export const ROLE_HIERARCHY: Record<Role, number> = {
  [ROLES.SUPER_ADMIN]: 100,
  [ROLES.ADMIN]:        80,
  [ROLES.MANAGER]:      60,
  [ROLES.EDITOR]:       40,
  [ROLES.USER]:         20,
  [ROLES.GUEST]:        10,
  [ROLES.ANONYMOUS]:     0,
}

export const isAtLeast = (actual: Role | undefined, min: Role): boolean =>
  !!actual && ROLE_HIERARCHY[actual] >= ROLE_HIERARCHY[min]

/** Label hiển thị UI — i18n key, không phải chuỗi cứng. */
export const ROLE_LABEL_I18N_KEY: Record<Role, string> = {
  [ROLES.SUPER_ADMIN]: 'role.super_admin',
  [ROLES.ADMIN]:       'role.admin',
  [ROLES.MANAGER]:     'role.manager',
  [ROLES.EDITOR]:      'role.editor',
  [ROLES.USER]:        'role.user',
  [ROLES.GUEST]:       'role.guest',
  [ROLES.ANONYMOUS]:   'role.anonymous',
}
```

### `src/shared/constants/permissions.ts`

> **Nguyên tắc**: FE chỉ giữ **enum strings** (để autocomplete + khỏi hardcode). Quyền thật của user do **server trả về** qua `authUser.permissions[]` (JWT claim hoặc `/auth/me`). Không derive static từ role.

```ts
export const PERMISSIONS = {
  USER_READ:        'user:read',
  USER_WRITE:       'user:write',
  USER_DELETE:      'user:delete',
  USER_MANAGE:      'user:manage',
  SESSION_READ:     'session:read',
  SESSION_WRITE:    'session:write',
  SESSION_DELETE:   'session:delete',
  AGENT_READ:       'agent:read',
  AGENT_WRITE:      'agent:write',
  AGENT_DELETE:     'agent:delete',
  SYSTEM_CONFIG:    'system:config',
  SYSTEM_AUDIT_LOG: 'system:audit_log',
  BILLING_MANAGE:   'billing:manage',
  WILDCARD:         '*',             // server-granted super permission
} as const

export type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS] | (string & {})
```

### `src/features/auth/types/auth.types.ts`
```ts
import type { Role } from '@/shared/constants/roles'

export interface AuthUser {
  id:          string
  email:       string
  name:        string
  role:        Role
  permissions: string[]   // ⭐ server-granted, có thể chứa '*'
}

export interface TokenPair {
  accessToken:  string
  refreshToken?: string   // thường nằm httpOnly cookie, FE không thấy
}
```

### `src/features/auth/store/authStore.ts`
```ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AuthUser } from '../types/auth.types'

interface AuthState {
  user: AuthUser | null
  token: string | null
  isAuthenticated: boolean
  setAuth: (user: AuthUser, token: string) => void
  logout:  () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      setAuth: (user, token) => set({ user, token, isAuthenticated: true }),
      logout:  ()             => set({ user: null, token: null, isAuthenticated: false }),
    }),
    { name: 'auth-storage' },
  ),
)
```

### `src/features/auth/hooks/useAuthContext.ts` — selector gộp
```ts
import { useAuthStore } from '../store/authStore'

export const useAuthContext = () => {
  const user            = useAuthStore((s) => s.user)
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  return {
    authUser:        user,
    permissions:     user?.permissions ?? [],
    isAuthenticated,
  }
}

export default useAuthContext
```

### `src/features/auth/hooks/useHasPermission.ts` — ⭐ core
```ts
import { useCallback } from 'react'
import { intersects } from 'radash'
import { ROLES } from '@/shared/constants/roles'
import type { Permission } from '@/shared/constants/permissions'
import useAuthContext from './useAuthContext'

/**
 * Role mapping:
 * - super_admin / admin       → bypass mọi permission
 * - manager / editor / user / guest → intersect với authUser.permissions[] (hỗ trợ '*')
 * - anonymous / unknown       → deny
 *
 * Nếu `required` rỗng/undefined → chỉ cần đăng nhập là qua.
 */
const useHasPermission = () => {
  const { authUser, permissions } = useAuthContext()

  return useCallback(
    <P extends Permission>(required: P[] | null | undefined) => {
      if (!authUser) return false
      if (!required?.length) return true

      switch (authUser.role) {
        case ROLES.SUPER_ADMIN:
        case ROLES.ADMIN:
          return true
        case ROLES.MANAGER:
        case ROLES.EDITOR:
        case ROLES.USER:
        case ROLES.GUEST:
          return permissions.length > 0 && intersects(permissions, ['*', ...required])
        default:
          return false
      }
    },
    [authUser, permissions],
  )
}

export default useHasPermission
```

### `src/features/auth/components/ProtectedRoute.tsx`
```tsx
import type { ReactElement } from 'react'
import { Navigate } from 'react-router-dom'
import { routes } from '@/router/routes'
import type { Permission } from '@/shared/constants/permissions'
import useAuthContext from '../hooks/useAuthContext'
import useHasPermission from '../hooks/useHasPermission'

interface Props {
  element:      ReactElement
  permissions?: Permission[]
}

export function ProtectedRoute({ element, permissions }: Props) {
  const { isAuthenticated } = useAuthContext()
  const hasPermission       = useHasPermission()

  if (!isAuthenticated)           return <Navigate to={routes.login}    replace />
  if (!hasPermission(permissions)) return <Navigate to={routes.notFound} replace />

  return element
}
```

### `src/features/auth/components/AuthRoute.tsx` — cho login/register
```tsx
import type { ReactElement } from 'react'
import { Navigate } from 'react-router-dom'
import { routes } from '@/router/routes'
import useAuthContext from '../hooks/useAuthContext'

interface Props { element: ReactElement }

export function AuthRoute({ element }: Props) {
  const { isAuthenticated } = useAuthContext()
  if (isAuthenticated) return <Navigate to={routes.home} replace />
  return element
}
```

### Dùng hook cho UI conditional
```tsx
import useHasPermission from '@/features/auth/hooks/useHasPermission'
import { PERMISSIONS } from '@/shared/constants/permissions'

function UserListToolbar() {
  const hasPermission = useHasPermission()
  return (
    <>
      {hasPermission([PERMISSIONS.USER_WRITE])  && <Button>Create user</Button>}
      {hasPermission([PERMISSIONS.USER_DELETE]) && <Button variant="danger">Bulk delete</Button>}
    </>
  )
}
```

---

## 🧪 Testing Setup — Vitest + RTL + MSW

### `vitest.config.ts`
```ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    css: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      exclude: ['**/*.test.*', '**/test/**', '**/generated/**', 'src/main.tsx'],
    },
  },
})
```

### `src/test/setup.ts`
```ts
import '@testing-library/jest-dom/vitest'
import { afterAll, afterEach, beforeAll } from 'vitest'
import { cleanup } from '@testing-library/react'
import { server } from './mocks/server'

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterEach(() => {
  cleanup()
  server.resetHandlers()
})
afterAll(() => server.close())
```

### `src/test/mocks/server.ts`
```ts
import { setupServer } from 'msw/node'
import { handlers } from './handlers'

export const server = setupServer(...handlers)
```

### `src/test/mocks/handlers.ts`
```ts
import { http, HttpResponse, graphql } from 'msw'
import { env } from '@/config/env'

export const handlers = [
  // REST
  http.get(`${env.VITE_API_BASE_URL}/users`, () => {
    return HttpResponse.json({
      data: [{ id: '1', name: 'Alice', email: 'a@example.com', role: 'user' }],
      meta: { page: 1, limit: 10, total: 1, totalPages: 1 },
    })
  }),

  // GraphQL
  graphql.query('GetUsers', () => {
    return HttpResponse.json({
      data: {
        users: [{ id: '1', name: 'Alice', email: 'a@example.com', role: 'user', created_at: '2024-01-01' }],
        users_aggregate: { aggregate: { count: 1 } },
      },
    })
  }),
]
```

### `src/test/utils.tsx` — custom render
```tsx
import { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { MockedProvider } from '@apollo/client/testing'
import { MemoryRouter } from 'react-router-dom'

function AllProviders({ children }: { children: React.ReactNode }) {
  return (
    <MockedProvider>
      <MemoryRouter>{children}</MemoryRouter>
    </MockedProvider>
  )
}

export function renderWithProviders(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  return render(ui, { wrapper: AllProviders, ...options })
}

export * from '@testing-library/react'
```

### Ví dụ test — `src/components/ui/Button/Button.test.tsx`
```tsx
import { describe, it, expect, vi } from 'vitest'
import { renderWithProviders, screen, fireEvent } from '@/test/utils'
import { Button } from './Button'

describe('Button', () => {
  it('renders children', () => {
    renderWithProviders(<Button>Click me</Button>)
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument()
  })

  it('fires onClick', () => {
    const onClick = vi.fn()
    renderWithProviders(<Button onClick={onClick}>OK</Button>)
    fireEvent.click(screen.getByRole('button'))
    expect(onClick).toHaveBeenCalledTimes(1)
  })
})
```

---

## 🛡️ Error Handling & Observability

### `src/components/common/ErrorBoundary/ErrorBoundary.tsx`
```tsx
import { Component, ReactNode } from 'react'
import * as Sentry from '@sentry/react'
import { logger } from '@/lib/logger'

interface Props { children: ReactNode; fallback?: ReactNode }
interface State { hasError: boolean; error?: Error }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    logger.error('ErrorBoundary caught', { error, info })
    Sentry.captureException(error, { extra: { info } })
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div className="p-8 text-center">
            <h1 className="text-2xl font-bold">Có lỗi xảy ra</h1>
            <p className="mt-2 text-sm text-gray-600">Vui lòng tải lại trang.</p>
          </div>
        )
      )
    }
    return this.props.children
  }
}
```

### `src/lib/sentry.ts`
```ts
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
```

### `src/lib/logger.ts`
```ts
import * as Sentry from '@sentry/react'
import { env } from '@/config/env'

type Level = 'debug' | 'info' | 'warn' | 'error'
const order: Record<Level, number> = { debug: 0, info: 1, warn: 2, error: 3 }
const threshold = order[env.VITE_LOG_LEVEL]

function should(level: Level) {
  return order[level] >= threshold
}

export const logger = {
  debug: (msg: string, ctx?: unknown) => should('debug') && console.debug(msg, ctx),
  info:  (msg: string, ctx?: unknown) => should('info')  && console.info(msg, ctx),
  warn:  (msg: string, ctx?: unknown) => {
    if (!should('warn')) return
    console.warn(msg, ctx)
    Sentry.addBreadcrumb({ level: 'warning', message: msg, data: ctx as any })
  },
  error: (msg: string, ctx?: unknown) => {
    if (!should('error')) return
    console.error(msg, ctx)
    Sentry.captureMessage(msg, { level: 'error', extra: { ctx } })
  },
}
```

---

## 🔒 Type Definitions

### `src/types/api.types.ts`
```ts
export interface ApiResponse<T> {
  data: T
  message: string
  success: boolean
}

export interface PaginatedResponse<T> {
  data: T[]
  meta: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface ApiError {
  message: string
  code: string
  statusCode: number
}
```

---

## 🛠️ Code Quality Tooling

### `.eslintrc.cjs`
```js
module.exports = {
  root: true,
  env: { browser: true, es2022: true },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
    'plugin:react/recommended',
    'plugin:react/jsx-runtime',
    'prettier',
  ],
  ignorePatterns: ['dist', '.eslintrc.cjs', 'src/services/graphql/generated/**'],
  parser: '@typescript-eslint/parser',
  plugins: ['react-refresh', '@typescript-eslint', 'react'],
  settings: { react: { version: 'detect' } },
  rules: {
    'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/no-explicit-any': 'warn',
    'no-console': ['warn', { allow: ['warn', 'error'] }],
  },
}
```

### `.prettierrc`
```json
{
  "semi": false,
  "singleQuote": true,
  "trailingComma": "es5",
  "printWidth": 100,
  "tabWidth": 2,
  "arrowParens": "always",
  "endOfLine": "lf"
}
```

### `tsconfig.json`
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "useDefineForClassFields": true,
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": false,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "noImplicitReturns": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    },
    "types": ["vite/client", "vitest/globals"]
  },
  "include": ["src", "codegen.ts", "vitest.config.ts"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

### `.husky/pre-commit`
```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

npx lint-staged
```

### `lint-staged.config.js`
```js
module.exports = {
  '*.{ts,tsx}': ['eslint --fix', 'prettier --write'],
  '*.{json,md,graphql,css}': ['prettier --write'],
}
```

---

## 🐳 Deployment — Docker + Nginx

### `Dockerfile`
```dockerfile
# ── Stage 1: deps ────────────────────────────────────────────────
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

# ── Stage 2: build ───────────────────────────────────────────────
FROM node:20-alpine AS build
ARG MODE=production
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build:${MODE} || npm run build

# ── Stage 3: runtime (nginx) ─────────────────────────────────────
FROM nginx:1.27-alpine AS runtime
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO- http://localhost/health || exit 1
CMD ["nginx", "-g", "daemon off;"]
```

### `nginx.conf`
```nginx
server {
  listen 80;
  server_name _;
  root /usr/share/nginx/html;
  index index.html;

  gzip on;
  gzip_types text/plain text/css application/javascript application/json image/svg+xml;
  gzip_min_length 1024;

  # SPA fallback
  location / {
    try_files $uri $uri/ /index.html;
  }

  # Cache static assets 1 năm
  location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff2?)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
  }

  # index.html không cache
  location = /index.html {
    add_header Cache-Control "no-cache, no-store, must-revalidate";
  }

  # Health check
  location = /health {
    access_log off;
    return 200 'ok';
    add_header Content-Type text/plain;
  }
}
```

### `.dockerignore`
```
node_modules
dist
.git
.github
.husky
coverage
*.log
.env
.env.*
!.env.example
```

### `docker-compose.yml` (local dev optional)
```yaml
services:
  frontend:
    build:
      context: .
      args:
        MODE: development
    ports:
      - "5173:80"
    environment:
      - NGINX_PORT=80
```

---

## ⚙️ CI/CD — GitHub Actions

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
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npm run lint
      - run: npm run typecheck
      - run: npm run test:coverage
      - uses: actions/upload-artifact@v4
        with:
          name: coverage
          path: coverage/

  build:
    needs: quality
    runs-on: ubuntu-latest
    strategy:
      matrix:
        mode: [staging, production]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - name: Create env file
        run: |
          cat > .env.${{ matrix.mode }} <<EOF
          VITE_APP_NAME=MyApp
          VITE_APP_ENV=${{ matrix.mode }}
          VITE_API_BASE_URL=${{ secrets[format('API_BASE_URL_{0}', matrix.mode)] }}
          VITE_HASURA_HTTP_URL=${{ secrets[format('HASURA_HTTP_URL_{0}', matrix.mode)] }}
          VITE_HASURA_WS_URL=${{ secrets[format('HASURA_WS_URL_{0}', matrix.mode)] }}
          VITE_SENTRY_DSN=${{ secrets[format('SENTRY_DSN_{0}', matrix.mode)] }}
          EOF
      - run: npm run build:${{ matrix.mode }}
      - uses: actions/upload-artifact@v4
        with:
          name: dist-${{ matrix.mode }}
          path: dist/
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
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: npm }
      - run: npm ci
      - run: npm run build:staging
        env:
          VITE_APP_ENV: staging
          VITE_API_BASE_URL: ${{ secrets.API_BASE_URL_STAGING }}
          VITE_HASURA_HTTP_URL: ${{ secrets.HASURA_HTTP_URL_STAGING }}
          VITE_HASURA_WS_URL: ${{ secrets.HASURA_WS_URL_STAGING }}
      # TODO: Push Docker image / sync S3 / deploy Vercel...
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
    environment: production  # Require manual approval in repo Settings → Environments
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: npm }
      - run: npm ci
      - run: npm run build
        env:
          VITE_APP_ENV: production
          VITE_API_BASE_URL: ${{ secrets.API_BASE_URL_PRODUCTION }}
          VITE_HASURA_HTTP_URL: ${{ secrets.HASURA_HTTP_URL_PRODUCTION }}
          VITE_HASURA_WS_URL: ${{ secrets.HASURA_WS_URL_PRODUCTION }}
          VITE_SENTRY_DSN: ${{ secrets.SENTRY_DSN_PRODUCTION }}
      # TODO: Push Docker image / deploy...
```

---

## ⚙️ Vite Config

### `vite.config.ts`
```ts
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, './environment', 'VITE_')

  return {
    plugins: [react()],
    resolve: {
      alias: { '@': path.resolve(__dirname, './src') },
    },
    server: {
      port: 5173,
      proxy: mode === 'development' ? {
        '/api': {
          target: env.VITE_API_BASE_URL,
          changeOrigin: true,
          rewrite: (p) => p.replace(/^\/api/, ''),
        },
      } : undefined,
    },
    build: {
      outDir: 'dist',
      sourcemap: mode !== 'production',
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom'],
            router: ['react-router-dom'],
            apollo: ['@apollo/client', 'graphql'],
          },
        },
      },
    },
  }
})
```

---

## 🔧 Naming Conventions

| Loại | Convention | Ví dụ |
|------|-----------|-------|
| Component file | PascalCase | `UserCard.tsx` |
| Test file | `<file>.test.tsx` | `Button.test.tsx` |
| Hook | camelCase + `use` prefix | `useUserData.ts` |
| Store | camelCase + `Store` suffix | `authStore.ts` |
| Service | camelCase + `Service` suffix | `userService.ts` |
| Type/Interface | PascalCase | `UserProfile`, `ApiResponse<T>` |
| Constant | UPPER_SNAKE_CASE | `MAX_RETRY_COUNT` |
| CSS class | kebab-case (Tailwind) | `flex-col`, `text-sm` |
| Folder | kebab-case hoặc PascalCase (component folder) | `user-profile/`, `Button/` |
| GraphQL file | `<resource>.graphql` | `users.graphql` |

---

## 📦 Dependencies

### Production
```json
{
  "react":              "^18.3.0",
  "react-dom":          "^18.3.0",
  "react-router-dom":   "^6.24.0",
  "react-hook-form":    "^7.51.0",
  "zustand":            "^4.5.0",
  "axios":              "^1.7.0",
  "@apollo/client":     "^3.11.0",
  "graphql":            "^16.9.0",
  "graphql-ws":         "^5.16.0",
  "graphql-request":    "^7.1.0",
  "zod":                "^3.23.0",
  "radash":             "^12.1.0",
  "react-hook-form":    "^7.52.0",
  "@hookform/resolvers":"^3.9.0",
  "i18next":            "^23.12.0",
  "react-i18next":      "^14.1.0",
  "i18next-browser-languagedetector": "^8.0.0",
  "i18next-http-backend":             "^2.5.0",
  "@sentry/react":      "^8.0.0",
  "dayjs":              "^1.11.0"
}
```

### Dev
```json
{
  "@vitejs/plugin-react":                    "^4.3.0",
  "vite":                                    "^5.3.0",
  "cross-env":                               "^7.0.0",
  "typescript":                              "^5.5.0",
  "tailwindcss":                             "^3.4.0",
  "postcss":                                 "^8.4.0",
  "autoprefixer":                            "^10.4.0",
  "eslint":                                  "^8.57.0",
  "@typescript-eslint/parser":               "^7.0.0",
  "@typescript-eslint/eslint-plugin":        "^7.0.0",
  "eslint-plugin-react":                     "^7.35.0",
  "eslint-plugin-react-hooks":               "^4.6.0",
  "eslint-plugin-react-refresh":             "^0.4.0",
  "eslint-config-prettier":                  "^9.1.0",
  "prettier":                                "^3.3.0",
  "husky":                                   "^9.0.0",
  "lint-staged":                             "^15.0.0",
  "vitest":                                  "^2.0.0",
  "@vitest/coverage-v8":                     "^2.0.0",
  "@testing-library/react":                  "^16.0.0",
  "@testing-library/jest-dom":               "^6.4.0",
  "@testing-library/user-event":             "^14.5.0",
  "jsdom":                                   "^24.0.0",
  "msw":                                     "^2.3.0",
  "@graphql-codegen/cli":                    "^5.0.0",
  "@graphql-codegen/typescript":             "^4.0.0",
  "@graphql-codegen/typescript-operations":  "^4.0.0",
  "@graphql-codegen/typescript-react-apollo":"^4.0.0"
}
```

---

## 🌐 i18n — react-i18next

> **Nguyên tắc**: Không hardcode chuỗi UI. Mọi text hiển thị đi qua `t('namespace:key')`. Ngôn ngữ mặc định là `vi`, fallback `en`.

### `src/lib/i18n.ts`
```ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import resources from '@/locales';

export const SUPPORTED_LANGUAGES = ['vi', 'en'] as const;
export type AppLanguage = (typeof SUPPORTED_LANGUAGES)[number];

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    supportedLngs: SUPPORTED_LANGUAGES,
    defaultNS: 'common',
    ns: ['common', 'auth', 'validation'],
    interpolation: { escapeValue: false },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'app.lang',
    },
  });

export default i18n;
```

### `src/locales/index.ts`
```ts
import en from './en';
import vi from './vi';

const resources = {
  en: { ...en },
  vi: { ...vi },
} as const;

export default resources;
```

### `src/locales/vi/index.ts`
```ts
import common from './common.json';
import auth from './auth.json';
import validation from './validation.json';

export default { common, auth, validation };
```

### `src/locales/vi/validation.json`
```json
{
  "required": "Trường này bắt buộc",
  "email": "Email không hợp lệ",
  "min": "Tối thiểu {{count}} ký tự",
  "max": "Tối đa {{count}} ký tự",
  "passwordMismatch": "Mật khẩu xác nhận không khớp"
}
```

### Bootstrap trong `src/main.tsx`
```ts
import '@/lib/i18n';
```

### Sử dụng trong component
```tsx
import { useTranslation } from 'react-i18next';

export function LoginHeader() {
  const { t } = useTranslation('auth');
  return <h1>{t('login.title')}</h1>;
}
```

### Đổi ngôn ngữ
```ts
import i18n from '@/lib/i18n';
i18n.changeLanguage('en'); // persist qua localStorage key `app.lang`
```

### Type-safe keys (optional)
```ts
// src/types/i18next.d.ts
import 'i18next';
import resources from '@/locales';

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'common';
    resources: (typeof resources)['vi'];
  }
}
```

---

## 📝 Form Validation — react-hook-form + Zod

> **Nguyên tắc**: Dùng `react-hook-form` cho state/submit, `zod` cho schema, `@hookform/resolvers/zod` để nối. **Infer type từ schema** — không viết interface thủ công. Error message lấy từ i18n namespace `validation`.

### Schema dùng chung — `src/shared/schemas/auth.schema.ts`
```ts
import { z } from 'zod';
import i18n from '@/lib/i18n';

const t = (k: string, opts?: Record<string, unknown>) =>
  i18n.t(k, { ns: 'validation', ...opts });

export const loginSchema = z.object({
  email: z.string().min(1, t('required')).email(t('email')),
  password: z.string().min(8, t('min', { count: 8 })),
});

export type LoginInput = z.infer<typeof loginSchema>;
```

### Wrapper hook — `src/shared/hooks/useForm.ts`
```ts
import { useForm as useRHF, type UseFormProps, type FieldValues } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { ZodSchema } from 'zod';

export function useZodForm<T extends FieldValues>(
  schema: ZodSchema<T>,
  options?: Omit<UseFormProps<T>, 'resolver'>,
) {
  return useRHF<T>({
    resolver: zodResolver(schema),
    mode: 'onBlur',
    ...options,
  });
}
```

### FormField wrapper — `src/shared/components/FormField/FormField.tsx`
```tsx
import { useFormContext, type FieldPath, type FieldValues } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Input } from '@/components/ui/Input';

interface Props<T extends FieldValues> {
  name: FieldPath<T>;
  label: string;
  type?: string;
}

export function FormField<T extends FieldValues>({ name, label, type = 'text' }: Props<T>) {
  const { register, formState: { errors } } = useFormContext<T>();
  const { t } = useTranslation('common');
  const error = errors[name]?.message as string | undefined;

  return (
    <label className="block">
      <span>{t(label)}</span>
      <Input type={type} {...register(name)} aria-invalid={!!error} />
      {error && <p className="text-red-500 text-sm">{error}</p>}
    </label>
  );
}
```

### Ví dụ form — `src/features/auth/components/LoginForm.tsx`
```tsx
import { FormProvider } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useZodForm } from '@/shared/hooks/useForm';
import { loginSchema, type LoginInput } from '@/shared/schemas/auth.schema';
import { FormField } from '@/shared/components/FormField';
import { Button } from '@/components/ui/Button';

export function LoginForm({ onSubmit }: { onSubmit: (v: LoginInput) => Promise<void> }) {
  const { t } = useTranslation('auth');
  const methods = useZodForm(loginSchema, {
    defaultValues: { email: '', password: '' },
  });

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-4">
        <FormField<LoginInput> name="email" label="auth:login.email" type="email" />
        <FormField<LoginInput> name="password" label="auth:login.password" type="password" />
        <Button type="submit" loading={methods.formState.isSubmitting}>
          {t('login.submit')}
        </Button>
      </form>
    </FormProvider>
  );
}
```

**Checklist form:**
- Schema sống trong `shared/schemas/` hoặc `features/*/schemas/`, export cả `schema` và `type` (qua `z.infer`).
- Dùng `FormProvider` khi form có nhiều `FormField` con — tránh prop drilling `register`.
- `mode: 'onBlur'` mặc định, chỉ dùng `onChange` nếu cần realtime.
- Label truyền key i18n (`'auth:login.email'`), không truyền chuỗi cứng.
- Async validation (check email trùng): dùng `refine` trong Zod hoặc `setError` sau khi call API.

---

## ✅ Agent Generation Rules

Khi AI agent sinh code từ tài liệu này, **phải tuân theo**:

1. **Mỗi component = 1 folder** với `index.ts` re-export.
2. **Không đặt logic trực tiếp trong page** — tách ra `hooks/` hoặc `services/`.
3. **Không hardcode URL** — dùng `ENDPOINTS` (REST) hoặc file `.graphql`.
4. **Tất cả type trong `types/`** — không dùng `any`. GraphQL types ưu tiên từ `generated/graphql.ts`.
5. **Import dùng alias `@/`** — không relative path quá 2 cấp (`../../`).
6. **Env variable phải đọc qua `@/config/env`** — không đọc trực tiếp `import.meta.env` ở business code.
7. **Lazy load tất cả pages** qua `LazyRoutes.tsx`.
8. **Global state chỉ dùng Zustand** — không dùng Context API cho business state.
9. **REST API call chỉ nằm trong `services/rest/` hoặc `features/*/services/`** — không call API trong component.
10. **GraphQL query/mutation viết trong file `.graphql`** — không inline `gql` string trong component (trừ prototype nhanh).
11. **Dùng Apollo Client** khi cần caching hoặc subscription; dùng **graphql-request** (`gqlRequest`) cho call đơn giản không cần cache.
12. **Subscription chỉ qua Apollo Client** — không implement WebSocket thủ công.
13. **Chạy codegen sau mỗi lần thay đổi schema** — không tự viết tay Hasura types.
14. **Tên file nhất quán** với bảng Naming Conventions.
15. **Mỗi component có test file cùng cấp** (`Button.test.tsx`) — cover render + interaction chính.
16. **Mọi route lazy bọc `ErrorBoundary`** — hiển thị fallback UI thay vì crash trang.
17. **Không `console.log` trong production code** — dùng `logger` từ `@/lib/logger`.
18. **Không `fetch` raw** — dùng `api` instance đã có auth + retry.
19. **Form validation bằng `react-hook-form` + Zod** — state/submit qua `react-hook-form`, schema viết bằng Zod và nối qua `@hookform/resolvers/zod`; infer types từ schema (`z.infer`), **không viết interface thủ công**; dùng wrapper `useZodForm` (`src/shared/hooks/useForm.ts`) và `FormField` (`src/shared/components/FormField/`) thay vì gọi `useForm` trực tiếp trong component; error message lấy từ i18n namespace `validation`, không hardcode chuỗi tiếng Việt/Anh.
20. **Không hardcode chuỗi UI** — mọi text hiển thị đi qua `useTranslation()` / `t('ns:key')`; key i18n đặt trong `src/locales/<lang>/<namespace>.json`; fallback language là `en`, default là `vi`.
21. **Permission check qua `useHasPermission`** — Route declare `permissions` trong `src/router/routes.ts` (config object); router tự wrap bằng `AuthRoute` (routeType `'auth'`) hoặc `ProtectedRoute` (routeType `'protected'`) — **không** viết guard HOC thủ công trong JSX tree. UI conditional (hiện/ẩn button, menu item) dùng hook `useHasPermission()`, **không** tự so sánh `user.role === 'admin'`. Role `super_admin` + `admin` bypass mọi permission; các role khác check intersect với `authUser.permissions[]` (server trả, hỗ trợ wildcard `'*'`); `anonymous` luôn deny.

---

## 🔗 Đồng bộ Frontend ↔ Backend

Thông tin quan trọng khớp với [BACKEND.md](BACKEND.md):

| Tài nguyên | Dev | Staging | Production |
|------------|-----|---------|-----------|
| API base URL | `http://localhost:3000/api` | `https://api-staging.myapp.com/api` | `https://api.myapp.com/api` |
| Hasura HTTP | `http://localhost:8080/v1/graphql` | `https://hasura-staging.myapp.com/v1/graphql` | `https://hasura.myapp.com/v1/graphql` |
| Hasura WS | `ws://localhost:8080/v1/graphql` | `wss://hasura-staging.myapp.com/v1/graphql` | `wss://hasura.myapp.com/v1/graphql` |
| CORS origin (BE whitelist) | `http://localhost:5173` | `https://staging.myapp.com` | `https://myapp.com` |

> FE + BE dùng chung 3 tên môi trường `development` / `staging` / `production`, tên file `.env.<env>`, naming JWT role (`user`, `admin`, `anonymous`), và shape Hasura tables.
