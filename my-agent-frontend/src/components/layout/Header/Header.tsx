import { Link, NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { env } from '@/config/env'
import { useAuthStore } from '@/features/auth/store/authStore'
import { routes } from '@/router/routes'
import styles from './Header.module.scss'

export function Header() {
  const { t, i18n } = useTranslation('common')
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const current = i18n.resolvedLanguage ?? i18n.language
  return (
    <header className={styles.root}>
      <div className={styles.inner}>
        <Link to={routes.home} className={styles.brand}>{env.VITE_APP_NAME}</Link>
        <nav className={styles.nav}>
          {isAuthenticated ? (
            <NavLink to={routes.me} className={({ isActive }) => isActive ? styles.linkActive : styles.link}>
              {t('nav.me')}
            </NavLink>
          ) : (
            <>
              <NavLink to={routes.login} className={({ isActive }) => isActive ? styles.linkActive : styles.link}>
                {t('nav.login')}
              </NavLink>
              <NavLink to={routes.register} className={({ isActive }) => isActive ? styles.linkActive : styles.link}>
                {t('nav.register')}
              </NavLink>
            </>
          )}
          <button
            type="button"
            onClick={() => i18n.changeLanguage(current === 'vi' ? 'en' : 'vi')}
            className={styles.langBtn}
            aria-label="Toggle language"
          >
            {current.toUpperCase()}
          </button>
        </nav>
      </div>
    </header>
  )
}
