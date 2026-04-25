import { useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './AppHeader.module.scss';

interface Props {
  open: boolean;
  onToggle: () => void;
  onClose: () => void;
}

const MOCK_NOTIFS = [
  { id: '1', title: 'Agent run completed', message: 'my-summarizer finished in 3.2s', time: '2m ago', type: 'success' as const },
  { id: '2', title: 'Project shared', message: 'Nhi added you to Alpha Project', time: '1h ago', type: 'info' as const },
  { id: '3', title: 'Run failed', message: 'data-extractor errored on step 4', time: '3h ago', type: 'error' as const },
];

export function NotifMenu({ open, onToggle, onClose }: Props) {
  const { t } = useTranslation('common');
  const ref = useRef<HTMLDivElement>(null);
  const unread = MOCK_NOTIFS.length;

  useEffect(() => {
    const handle = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    if (open) document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [open, onClose]);

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        type="button"
        className={styles.iconBtn}
        onClick={onToggle}
        aria-label={t('header.notifications')}
        aria-expanded={open}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M6 8a6 6 0 0112 0c0 7 3 8 3 8H3s3-1 3-8zM10 20a2 2 0 004 0" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
        {unread > 0 && <span className={styles.notifDot} />}
      </button>

      {open && (
        <div className={styles.notifDropdown} role="menu">
          <div className={styles.notifHeader}>
            <span className={styles.notifTitle}>{t('header.notifications')}</span>
            {unread > 0 && (
              <span className={styles.notifBadge}>
                {t('header.notif_new', { n: unread })}
              </span>
            )}
          </div>
          {MOCK_NOTIFS.map((n, i) => (
            <div key={n.id}>
              {i > 0 && <div className={styles.dropdownDivider} />}
              <div className={styles.notifItem}>
                <span
                  className={styles.notifItemDot}
                  style={{ background: n.type === 'error' ? 'var(--danger)' : 'var(--accent)' }}
                />
                <div className={styles.notifItemBody}>
                  <span className={styles.notifItemTitle}>{n.title}</span>
                  <span className={styles.notifItemMsg}>{n.message}</span>
                  <span className={styles.notifItemTime}>{n.time}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
