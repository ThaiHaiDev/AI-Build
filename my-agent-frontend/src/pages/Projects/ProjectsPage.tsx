import { useEffect, useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { toast } from '@/components/ui/Toast'
import { ROLES } from '@/shared/constants/roles'
import { useAuthStore } from '@/features/auth/store/authStore'
import { projectService } from '@/features/projects/services/projectService'
import { ProjectCard } from '@/features/projects/components/ProjectCard'
import { ProjectFormModal } from '@/features/projects/components/ProjectFormModal'
import { parseProjectError } from '@/features/projects/utils/parseProjectError'
import type { Project } from '@/features/projects/types/project.types'

export default function ProjectsPage() {
  const { t } = useTranslation('projects')
  const user = useAuthStore((s) => s.user)
  const isSuperAdmin = user?.role === ROLES.SUPER_ADMIN

  const [projects, setProjects]               = useState<Project[]>([])
  const [loading, setLoading]                 = useState(true)
  const [includeArchived, setIncludeArchived] = useState(false)
  const [search, setSearch]                   = useState('')
  const [createOpen, setCreateOpen]           = useState(false)

  const load = async (archived: boolean) => {
    setLoading(true)
    try {
      const res = await projectService.list(archived)
      setProjects(res.data.projects)
    } catch (err) {
      const parsed = parseProjectError(err)
      toast.error(parsed.message || t('error.generic'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load(includeArchived)
  }, [includeArchived])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return projects
    return projects.filter((p) => p.name.toLowerCase().includes(q))
  }, [projects, search])

  const handleCreated = (p: Project) => {
    setProjects((prev) => [p, ...prev])
    setCreateOpen(false)
  }

  return (
    <div className="mx-auto max-w-6xl p-6">
      <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold text-gray-900">{t('list.page_title')}</h1>
        {isSuperAdmin && (
          <Button onClick={() => setCreateOpen(true)}>{t('list.create')}</Button>
        )}
      </header>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t('list.search_placeholder')}
          className="max-w-sm"
        />
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={includeArchived}
            onChange={(e) => setIncludeArchived(e.target.checked)}
          />
          {t('list.include_archived')}
        </label>
      </div>

      {loading ? (
        <p className="text-sm text-gray-500">{t('common:loading', { defaultValue: 'Loading…' })}</p>
      ) : filtered.length === 0 ? (
        <div className="rounded border border-dashed border-gray-300 p-8 text-center text-sm text-gray-500">
          {isSuperAdmin ? t('list.empty_admin') : t('list.empty_member')}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => <ProjectCard key={p.id} project={p} />)}
        </div>
      )}

      <ProjectFormModal
        open={createOpen}
        mode="create"
        onClose={() => setCreateOpen(false)}
        onSuccess={handleCreated}
      />
    </div>
  )
}
