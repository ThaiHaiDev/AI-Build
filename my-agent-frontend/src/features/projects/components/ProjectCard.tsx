import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { routes } from '@/router/routes'
import type { Project } from '../types/project.types'

interface Props {
  project: Project
}

export function ProjectCard({ project }: Props) {
  const { t } = useTranslation('projects')
  const archived = project.status === 'archived'

  return (
    <Link
      to={routes.projectDetail(project.id)}
      className="block rounded border border-gray-200 bg-white p-4 shadow-sm transition hover:border-blue-400 hover:shadow"
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="truncate text-base font-semibold text-gray-900">{project.name}</h3>
        <span
          className={`shrink-0 rounded px-2 py-0.5 text-xs ${
            archived ? 'bg-gray-200 text-gray-700' : 'bg-green-100 text-green-700'
          }`}
        >
          {archived ? t('status.archived') : t('status.active')}
        </span>
      </div>
      <p className="mt-2 line-clamp-2 text-sm text-gray-600">
        {project.description || t('card.no_description')}
      </p>
      <p className="mt-2 truncate text-xs text-gray-500">
        {project.techStack || t('card.no_tech')}
      </p>
    </Link>
  )
}
