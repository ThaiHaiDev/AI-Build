import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { ROLES } from '@/shared/constants/roles'
import { useAuthStore } from '@/features/auth/store/authStore'
import { routes } from '@/router/routes'

export default function DashboardPage() {
  const { t } = useTranslation('projects')
  const user = useAuthStore((s) => s.user)
  const isSuperAdmin = user?.role === ROLES.SUPER_ADMIN

  return (
    <div className="mx-auto max-w-4xl p-6">
      <h1 className="mb-6 text-2xl font-semibold text-gray-900">Dashboard</h1>
      <div className="rounded border border-dashed border-gray-300 p-10 text-center text-sm text-gray-500">
        📁
        <p className="mt-2">
          {isSuperAdmin ? t('list.empty_admin') : t('list.empty_user')}
        </p>
        {isSuperAdmin && (
          <Link
            to={routes.projects}
            className="mt-3 inline-block rounded bg-blue-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
          >
            {t('list.create')}
          </Link>
        )}
      </div>
    </div>
  )
}
