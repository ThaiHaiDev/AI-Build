import type { ComponentType } from 'react'
import type { Permission } from '@/shared/constants/permissions'

export type RouteType = 'public' | 'auth' | 'protected'

export interface AppRoute {
  path:         string
  routeType:    RouteType
  permissions?: Permission[]
  lazy:         () => Promise<{ default: ComponentType }>
}

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
  { path: routes.notFound,  routeType: 'public',    lazy: () => import('@/pages/NotFound') },
]
