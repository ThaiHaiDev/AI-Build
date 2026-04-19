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

  if (!isAuthenticated)            return <Navigate to={routes.login}    replace />
  if (!hasPermission(permissions)) return <Navigate to={routes.notFound} replace />

  return element
}
