import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { env } from '@/config/env'

export function Header() {
  const { t, i18n } = useTranslation('common')
  const current = i18n.resolvedLanguage ?? i18n.language
  return (
    <header className="border-b bg-white">
      <div className="container mx-auto flex items-center justify-between px-4 py-3">
        <Link to="/" className="text-lg font-semibold">
          {env.VITE_APP_NAME}
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          <Link to="/login">{t('nav.login')}</Link>
          <Link to="/register">{t('nav.register')}</Link>
          <button
            onClick={() => i18n.changeLanguage(current === 'vi' ? 'en' : 'vi')}
            className="rounded border px-2 py-1"
          >
            {current.toUpperCase()}
          </button>
        </nav>
      </div>
    </header>
  )
}
