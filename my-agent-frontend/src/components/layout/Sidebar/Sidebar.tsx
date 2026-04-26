import { NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ROLES } from '@/shared/constants/roles'
import { useAuthStore } from '@/features/auth/store/authStore'
import { routes } from '@/router/routes'

const linkBase = 'flex items-center gap-2 rounded px-3 py-2 text-sm transition-colors'
const linkActive = 'bg-blue-50 text-blue-700 font-medium'
const linkInactive = 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'

export function Sidebar() {
  const { t } = useTranslation('common')
  const user = useAuthStore((s) => s.user)
  const isSA = user?.role === ROLES.SUPER_ADMIN

  return (
    <aside className="w-56 shrink-0 border-r border-gray-200 bg-white p-3">
      <nav className="flex flex-col gap-1">
        <NavLink
          to={routes.dashboard}
          className={({ isActive }) => `${linkBase} ${isActive ? linkActive : linkInactive}`}
        >
          🏠 <span>{t('nav.dashboard', { defaultValue: 'Dashboard' })}</span>
        </NavLink>
        <NavLink
          to={routes.projects}
          className={({ isActive }) => `${linkBase} ${isActive ? linkActive : linkInactive}`}
        >
          📁 <span>{t('nav.projects')}</span>
        </NavLink>

        {isSA && (
          <>
            <hr className="my-2 border-gray-200" />
            <p className="px-3 py-1 text-xs font-semibold uppercase tracking-wide text-gray-400">
              Admin
            </p>
            <NavLink
              to={routes.adminUsers}
              className={({ isActive }) => `${linkBase} ${isActive ? linkActive : linkInactive} pl-6`}
            >
              👥 <span>{t('nav.admin_users', { defaultValue: 'Users' })}</span>
            </NavLink>
            <NavLink
              to={routes.adminHistory}
              className={({ isActive }) => `${linkBase} ${isActive ? linkActive : linkInactive} pl-6`}
            >
              📋 <span>{t('nav.admin_history', { defaultValue: 'History' })}</span>
            </NavLink>
          </>
        )}
      </nav>
    </aside>
  )
}
