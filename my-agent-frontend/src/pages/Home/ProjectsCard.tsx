import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type { HomeProject } from '@/features/home/services/homeService';
import { routes } from '@/router/routes';
import styles from './HomePage.module.scss';

interface Props {
  projects: HomeProject[];
}

const PROJECT_COLORS = [
  '#0f172a', '#1d4ed8', '#7c3aed', '#059669', '#b45309',
];

function projectColor(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) % PROJECT_COLORS.length;
  return PROJECT_COLORS[h];
}

function projectInitials(name: string) {
  return name.split(' ').slice(0, 2).map((w) => w[0].toUpperCase()).join('');
}

export function ProjectsCard({ projects }: Props) {
  const { t } = useTranslation('home');

  return (
    <div className={styles.card}>
      <div className={styles.cardHead}>
        <span className={styles.cardTitle}>{t('your_projects')}</span>
        <Link to={routes.projects} className={styles.cardLink}>{t('see_all')} →</Link>
      </div>
      <div className={styles.listDivided}>
        {projects.map((p) => (
          <div key={p.id} className={`${styles.projectRow} group`}>
            <span
              className={styles.projectBadge}
              style={{ background: projectColor(p.name) }}
            >
              {projectInitials(p.name)}
            </span>
            <div className={styles.projectBody}>
              <div className={styles.projectName}>
                {p.name}
                {!p.isOwner && <span className={styles.sharedChip}>{t('shared')}</span>}
              </div>
              <div className={styles.projectDesc}>{p.description}</div>
            </div>
            <div className={styles.projectMeta}>
              <span className={styles.metaText}>{p.runs} runs</span>
              <span className={styles.metaText}>{p.updatedAt}</span>
            </div>
            <Link
              to={routes.projectDetail(p.id)}
              className={styles.openBtn}
            >
              {t('open')}
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
