import { useTranslation } from 'react-i18next';
import type { HomeStats } from '@/features/home/services/homeService';
import styles from './HomePage.module.scss';

interface Props {
  stats: HomeStats;
}

export function StatsGrid({ stats }: Props) {
  const { t } = useTranslation('home');

  const cards = [
    { key: 'stat_agents', value: stats.agents, delta: stats.agentsDelta },
    { key: 'stat_runs',   value: stats.runs,   delta: stats.runsDelta },
    { key: 'stat_docs',   value: stats.docs,   delta: stats.docsDelta },
    { key: 'stat_tokens', value: stats.tokens, delta: stats.tokensDelta },
  ] as const;

  return (
    <div className={styles.statsGrid}>
      {cards.map((card) => (
        <div key={card.key} className={styles.statCard}>
          <span className={styles.statLabel}>{t(card.key)}</span>
          <span className={styles.statValue}>{card.value}</span>
          <span
            className={styles.statDelta}
            style={{ color: card.delta >= 0 ? 'var(--accent)' : 'var(--danger)' }}
          >
            {card.delta >= 0 ? '+' : '−'}{Math.abs(card.delta)}
          </span>
        </div>
      ))}
    </div>
  );
}
