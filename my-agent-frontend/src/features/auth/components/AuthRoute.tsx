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
