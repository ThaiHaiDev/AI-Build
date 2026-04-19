import { useCallback } from 'react'
import { intersects } from 'radash'
import { ROLES } from '@/shared/constants/roles'
import type { Permission } from '@/shared/constants/permissions'
import useAuthContext from './useAuthContext'

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
