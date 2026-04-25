import { useTranslation } from 'react-i18next';
import type { RecentRun } from '@/features/home/services/homeService';
import styles from './HomePage.module.scss';

interface Props {
  runs: RecentRun[];
}

function StatusDot({ status }: { status: RecentRun['status'] }) {
  if (status === 'running') {
    return (
      <span className={`${styles.statusBadge} ${styles.statusRunning}`}>
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" className={styles.spinIcon}>
          <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity=".25" strokeWidth="2.5" />
          <path d="M21 12a9 9 0 00-9-9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      </span>
    );
  }
  if (status === 'succeeded') {
    return (
      <span className={`${styles.statusBadge} ${styles.statusSuccess}`}>
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
          <path d="M4 12l6 6L20 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </span>
    );
  }
  return (
    <span className={`${styles.statusBadge} ${styles.statusFailed}`}>
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
        <path d="M5 5l14 14M19 5L5 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    </span>
  );
}

export function RecentRunsCard({ runs }: Props) {
  const { t } = useTranslation('home');

  return (
    <div className={styles.card}>
      <div className={styles.cardHead}>
        <span className={styles.cardTitle}>{t('recent_runs')}</span>
        <span className={styles.chip24h}>24h</span>
      </div>
      <div className={styles.listDivided}>
        {runs.map((run) => (
          <div key={run.id} className={styles.runRow}>
            <StatusDot status={run.status} />
            <div className={styles.runBody}>
              <span className={styles.runName}>{run.agentName}</span>
              <span className={styles.runMeta}>
                {t('by')} {run.user} · {run.relativeTime}
              </span>
            </div>
            <span className={styles.runTokens}>
              {run.tokens !== null ? run.tokens.toLocaleString() : '—'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
