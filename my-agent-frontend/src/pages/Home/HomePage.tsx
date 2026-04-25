import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/features/auth/store/authStore';
import { homeService, type HomeStats, type HomeProject, type RecentRun } from '@/features/home/services/homeService';
import { StatsGrid } from './StatsGrid';
import { ProjectsCard } from './ProjectsCard';
import { RecentRunsCard } from './RecentRunsCard';
import styles from './HomePage.module.scss';

function greeting(t: (k: string) => string): string {
  const h = new Date().getHours();
  if (h < 12) return t('greeting.morning');
  if (h < 18) return t('greeting.afternoon');
  return t('greeting.evening');
}

export default function HomePage() {
  const { t } = useTranslation('home');
  const user = useAuthStore((s) => s.user);
  const firstName = user?.name?.split(' ').at(-1) ?? user?.name ?? '';

  const [stats, setStats] = useState<HomeStats | null>(null);
  const [projects, setProjects] = useState<HomeProject[]>([]);
  const [runs, setRuns] = useState<RecentRun[]>([]);

  useEffect(() => {
    homeService.getStats().then(setStats);
    homeService.getProjects(3).then(setProjects);
    homeService.getRecentRuns(4).then(setRuns);
  }, []);

  return (
    <div className={styles.page}>
      {/* Greeting block */}
      <section className={styles.greeting}>
        <p className={styles.greetingMeta}>
          <span className={styles.greenDot} />
          {t('workspace_meta')}
        </p>
        <h1 className={styles.greetingTitle}>
          {greeting(t)}, {firstName}.
        </h1>
        <p className={styles.greetingSub}>{t('sub')}</p>
      </section>

      {/* Stats grid */}
      {stats ? (
        <StatsGrid stats={stats} />
      ) : (
        <div className={styles.statsGrid}>
          {[1,2,3,4].map((i) => <div key={i} className={styles.statCardSkeleton} />)}
        </div>
      )}

      {/* Two-column section */}
      <div className={styles.twoCol}>
        <ProjectsCard projects={projects} />
        <RecentRunsCard runs={runs} />
      </div>
    </div>
  );
}
