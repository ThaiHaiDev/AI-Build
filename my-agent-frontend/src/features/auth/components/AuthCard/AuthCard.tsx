import type { ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import styles from './AuthCard.module.scss';

interface Props {
  title:     string;
  subtitle?: string;
  footer?:   ReactNode;
  children:  ReactNode;
}

export function AuthCard({ title, subtitle, footer, children }: Props) {
  const { t } = useTranslation('auth');
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const isLogin = pathname === '/login' || pathname === '/';

  return (
    <section className={styles.card}>
      <header className={styles.header}>
        {/* Mono label */}
        <div className={styles.monoLabel}>
          <span className={styles.greenDot} />
          <span>{isLogin ? 'auth / signin' : 'auth / signup'}</span>
        </div>

        {/* Mode-switch pill */}
        <div className={styles.modePill}>
          <button
            type="button"
            className={`${styles.modeBtn} ${isLogin ? styles.modeBtnActive : ''}`}
            onClick={() => navigate('/login')}
          >
            {t('login.tab', 'Đăng nhập')}
          </button>
          <button
            type="button"
            className={`${styles.modeBtn} ${!isLogin ? styles.modeBtnActive : ''}`}
            onClick={() => navigate('/register')}
          >
            {t('register.tab', 'Đăng ký')}
          </button>
        </div>

        <h1 className={styles.title}>{title}</h1>
        {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
      </header>

      <div className={styles.body}>{children}</div>

      {footer && <div className={styles.footer}>{footer}</div>}
    </section>
  );
}
