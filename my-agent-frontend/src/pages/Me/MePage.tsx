import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '@/features/auth/store/authStore'
import { authService } from '@/features/auth/services/authService'
import { toast } from '@/components/ui/Toast'
import { Button } from '@/components/ui/Button'
import { routes } from '@/router/routes'
import { formatDate } from '@/utils/formatters'
import { logger } from '@/lib/logger'
import styles from './MePage.module.scss'

export default function MePage() {
  const { t, i18n } = useTranslation('auth')
  const user   = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const navigate = useNavigate()
  const [signingOut, setSigningOut] = useState(false)

  if (!user) return null

  const handleLogout = async () => {
    setSigningOut(true)
    try {
      await authService.logout()
    } catch (err) {
      logger.warn('Logout API failed, clearing local state anyway', { err })
    } finally {
      logout()
      toast.success(t('toast.logout_success'))
      navigate(routes.login, { replace: true })
    }
  }

  const initial = (user.name?.trim()?.[0] ?? user.email[0] ?? '?').toUpperCase()
  const locale  = i18n.resolvedLanguage === 'vi' ? 'DD/MM/YYYY' : 'MMM D, YYYY'

  return (
    <div className={styles.wrap}>
      <section className={styles.card}>
        <header className={styles.header}>
          <h1 className={styles.title}>{t('me.title')}</h1>
        </header>

        <div className={styles.body}>
          <div className={styles.avatar} aria-hidden="true">{initial}</div>

          <dl className={styles.fields}>
            <div className={styles.row}>
              <dt className={styles.label}>{t('me.name')}</dt>
              <dd className={styles.value}>{user.name ?? t('me.not_provided')}</dd>
            </div>
            <div className={styles.row}>
              <dt className={styles.label}>{t('me.email')}</dt>
              <dd className={styles.value}>{user.email}</dd>
            </div>
            <div className={styles.row}>
              <dt className={styles.label}>{t('me.role')}</dt>
              <dd className={styles.value}>
                <span className={styles.roleBadge}>{user.role}</span>
              </dd>
            </div>
            <div className={styles.row}>
              <dt className={styles.label}>{t('me.joined')}</dt>
              <dd className={styles.value}>
                {user.createdAt ? formatDate(user.createdAt, locale) : t('me.not_provided')}
              </dd>
            </div>
          </dl>
        </div>

        <footer className={styles.footer}>
          <Button
            variant="secondary"
            onClick={handleLogout}
            loading={signingOut}
            className={styles.logoutBtn}
          >
            {signingOut ? t('me.logging_out') : t('me.logout')}
          </Button>
        </footer>
      </section>
    </div>
  )
}
