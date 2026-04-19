import type { ComponentType } from 'react'
import type { Permission } from '@/shared/constants/permissions'

export type RouteType    = 'public' | 'auth' | 'protected'
export type RouteLayout  = 'app' | 'auth' | 'bare'

export interface AppRoute {
  path:         string
  routeType:    RouteType
  layout?:      RouteLayout
  permissions?: Permission[]
  lazy:         () => Promise<{ default: ComponentType }>
}

export const routes = {
  home:         '/',
  login:        '/login',
  register:     '/register',
  me:           '/me',
  dashboard:    '/dashboard',
  projects:     '/projects',
  projectDetail:(id: string) => `/projects/${id}`,
  notFound:     '/404',
} as const

export const appRoutes: AppRoute[] = [
  { path: routes.home,      routeType: 'public',    layout: 'app',  lazy: () => import('@/pages/Home') },
  { path: routes.login,     routeType: 'auth',      layout: 'auth', lazy: () => import('@/pages/Login') },
  { path: routes.register,  routeType: 'auth',      layout: 'auth', lazy: () => import('@/pages/Register') },
  { path: routes.me,        routeType: 'protected', layout: 'app',  lazy: () => import('@/pages/Me') },
  { path: routes.dashboard, routeType: 'protected', layout: 'app',  lazy: () => import('@/pages/Dashboard') },
  { path: routes.projects,  routeType: 'protected', layout: 'app',  lazy: () => import('@/pages/Projects') },
  { path: '/projects/:id',  routeType: 'protected', layout: 'app',  lazy: () => import('@/pages/ProjectDetail') },
  { path: routes.notFound,  routeType: 'public',    layout: 'app',  lazy: () => import('@/pages/NotFound') },
]
