import { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/features/auth/store/authStore';
import { authService } from '@/features/auth/services/authService';
import { routes } from '@/router/routes';
import { logger } from '@/lib/logger';
import styles from './AppHeader.module.scss';

function initials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('');
}

interface Props {
  open: boolean;
  onToggle: () => void;
  onClose: () => void;
}

export function UserMenu({ open, onToggle, onClose }: Props) {
  const { t } = useTranslation('common');
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();
  const [signingOut, setSigningOut] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handle = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    if (open) document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [open, onClose]);

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      await authService.logout?.();
    } catch (err) {
      logger.warn('Logout error', { err });
    }
    logout();
    navigate(routes.login);
  };

  if (!user) return null;
  const ini = initials(user.name || user.email);

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        type="button"
        className={styles.avatarChip}
        onClick={onToggle}
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <span className={styles.avatarCircle}>{ini}</span>
        <span className={styles.avatarName}>{user.name}</span>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" style={{ color: 'var(--fg-3)' }}>
          <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <div className={styles.dropdown} role="menu">
          {/* Header */}
          <div className={styles.dropdownHeader}>
            <span className={styles.dropdownName}>{user.name}</span>
            <span className={styles.dropdownEmail}>{user.email}</span>
          </div>
          <div className={styles.dropdownDivider} />
          <button
            role="menuitem"
            className={styles.dropdownItem}
            onClick={() => { navigate(routes.me); onClose(); }}
          >
            {t('header.profile')}
          </button>
          <button role="menuitem" className={styles.dropdownItem}>
            {t('header.settings')}
          </button>
          <div className={styles.dropdownDivider} />
          <button
            role="menuitem"
            className={`${styles.dropdownItem} ${styles.dropdownItemDanger}`}
            onClick={handleSignOut}
            disabled={signingOut}
          >
            {signingOut ? t('header.signing_out') : t('header.signout')}
          </button>
        </div>
      )}
    </div>
  );
}
