import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { routes } from '@/router/routes';
import { LanguageToggle } from '@/components/ui/LanguageToggle/LanguageToggle';
import { UserMenu } from './UserMenu';
import { NotifMenu } from './NotifMenu';
import styles from './AppHeader.module.scss';

export function AppHeader() {
  const { t } = useTranslation('common');
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState<'user' | 'notif' | null>(null);

  const closeAll = () => setMenuOpen(null);
  const toggle = (key: 'user' | 'notif') =>
    setMenuOpen((prev) => (prev === key ? null : key));

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        {/* Logo */}
        <button
          type="button"
          className={styles.logo}
          onClick={() => navigate(routes.home)}
        >
          <span className={styles.logoIcon}>
            <span className={styles.logoInner}>
              <span className={styles.logoDot} />
            </span>
          </span>
          <span className={styles.logoText}>
            <span className={styles.logoName}>{t('header.brand')}</span>
            <span className={styles.logoSub}>{t('header.brand_sub')}</span>
          </span>
        </button>

        {/* Nav */}
        <nav className={styles.nav}>
          <NavLink
            to={routes.home}
            end
            className={({ isActive }) => `${styles.navItem} ${isActive ? styles.navItemActive : ''}`}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M4 11l8-7 8 7v9a1 1 0 01-1 1h-5v-6H10v6H5a1 1 0 01-1-1v-9z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
            </svg>
            {t('header.nav_home')}
          </NavLink>
          <NavLink
            to={routes.projects}
            className={({ isActive }) => `${styles.navItem} ${isActive ? styles.navItemActive : ''}`}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <rect x="4" y="7" width="16" height="12" rx="3" stroke="currentColor" strokeWidth="1.6" />
              <path d="M12 3v4M8 12h.01M16 12h.01" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
            {t('header.nav_projects')}
          </NavLink>
        </nav>

        {/* Search */}
        <div className={styles.search}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ color: 'var(--fg-3)' }}>
            <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.8" />
            <path d="M20 20l-4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
          <span className={styles.searchPlaceholder}>{t('header.search_placeholder')}</span>
          <kbd className={styles.searchKbd}>{t('header.search_kbd')}</kbd>
        </div>

        {/* Right actions */}
        <div className={styles.actions}>
          <LanguageToggle />
          <NotifMenu
            open={menuOpen === 'notif'}
            onToggle={() => toggle('notif')}
            onClose={closeAll}
          />
          <UserMenu
            open={menuOpen === 'user'}
            onToggle={() => toggle('user')}
            onClose={closeAll}
          />
        </div>
      </div>
    </header>
  );
}
