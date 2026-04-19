import { Outlet, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { env } from '@/config/env'
import { ToastContainer } from '@/components/ui/Toast'
import styles from './AuthLayout.module.scss'

export function AuthLayout() {
  const { i18n } = useTranslation('common')
  const current = i18n.resolvedLanguage ?? i18n.language
  return (
    <div className={styles.root}>
      <header className={styles.topbar}>
        <Link to="/" className={styles.brand}>{env.VITE_APP_NAME}</Link>
        <button
          type="button"
          className={styles.langBtn}
          onClick={() => i18n.changeLanguage(current === 'vi' ? 'en' : 'vi')}
          aria-label="Toggle language"
        >
          {current.toUpperCase()}
        </button>
      </header>
      <main className={styles.main}>
        <Outlet />
      </main>
      <footer className={styles.footer}>
        © {new Date().getFullYear()} {env.VITE_APP_NAME}
      </footer>
      <ToastContainer />
    </div>
  )
}
