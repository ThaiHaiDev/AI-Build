import { Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ToastContainer } from '@/components/ui/Toast';
import { LanguageToggle } from '@/components/ui/LanguageToggle/LanguageToggle';
import styles from './AuthLayout.module.scss';

export function AuthLayout() {
  const { t } = useTranslation('auth');

  return (
    <div className={styles.root}>
      {/* Fixed language toggle overlays both columns */}
      <LanguageToggle fixed />

      <div className={styles.grid}>
        {/* ── Left: form column ── */}
        <div className={styles.formCol}>
          <div className={styles.formInner}>
            <Outlet />
          </div>
          <footer className={styles.footer}>
            © {new Date().getFullYear()} · Internal use only
          </footer>
        </div>

        {/* ── Right: brand panel (lg+) ── */}
        <div className={styles.brandPanel} aria-hidden="true">
          <div className={styles.gridBg} />
          <div className={styles.accentBlob} />

          <div className={styles.brandLabel}>
            <span className={styles.greenDot} />
            <span className="font-mono text-[11px] uppercase tracking-[0.18em]">
              my-agent · internal
            </span>
          </div>

          <div className={styles.brandCenter}>
            <h2 className={styles.brandHeadline}>
              {t('brand.tagline_pre', 'Không gian nội bộ cho ')}<span style={{ color: 'var(--accent)' }}>AI agents</span>.
            </h2>
            <p className={styles.brandSub}>
              {t('brand.sub')}
            </p>
          </div>

          <p className={styles.brandFooter}>© 2026 · Internal use only</p>
        </div>
      </div>

      <ToastContainer />
    </div>
  );
}
