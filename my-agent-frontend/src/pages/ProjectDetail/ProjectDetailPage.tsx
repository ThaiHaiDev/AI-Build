import { useEffect, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/Button'
import { toast } from '@/components/ui/Toast'
import { ROLES } from '@/shared/constants/roles'
import { useAuthStore } from '@/features/auth/store/authStore'
import { routes } from '@/router/routes'
import { projectService } from '@/features/projects/services/projectService'
import { parseProjectError } from '@/features/projects/utils/parseProjectError'
import { ProjectFormModal } from '@/features/projects/components/ProjectFormModal'
import { AddMemberModal } from '@/features/projects/components/AddMemberModal'
import { ConfirmDialog } from '@/features/projects/components/ConfirmDialog'
import type { Project, ProjectMember } from '@/features/projects/types/project.types'

type Tab = 'overview' | 'members'

export default function ProjectDetailPage() {
  const { t }    = useTranslation('projects')
  const { id }   = useParams<{ id: string }>()
  const navigate = useNavigate()
  const user     = useAuthStore((s) => s.user)
  const isSuperAdmin = user?.role === ROLES.SUPER_ADMIN

  const [project, setProject]       = useState<Project | null>(null)
  const [members, setMembers]       = useState<ProjectMember[]>([])
  const [tab, setTab]               = useState<Tab>('overview')
  const [loading, setLoading]       = useState(true)
  const [notFound, setNotFound]     = useState(false)
  const [editOpen, setEditOpen]     = useState(false)
  const [addMemOpen, setAddMemOpen] = useState(false)
  const [archiveConfirm, setArchiveConfirm] = useState<'archive' | 'unarchive' | null>(null)
  const [archiveLoading, setArchiveLoading] = useState(false)
  const [removeTarget, setRemoveTarget]     = useState<ProjectMember | null>(null)
  const [removeLoading, setRemoveLoading]   = useState(false)

  useEffect(() => {
    if (!id) return
    let cancel = false
    ;(async () => {
      setLoading(true)
      setNotFound(false)
      try {
        const res = await projectService.detail(id)
        if (!cancel) setProject(res.data.project)
      } catch (err) {
        if (cancel) return
        const parsed = parseProjectError(err)
        if (parsed.kind === 'forbidden') {
          toast.error(t('toast.no_access'))
          navigate(routes.projects, { replace: true })
        } else if (parsed.kind === 'not_found') {
          setNotFound(true)
        } else {
          toast.error(t('error.generic'))
        }
      } finally {
        if (!cancel) setLoading(false)
      }
    })()
    return () => { cancel = true }
  }, [id, navigate, t])

  const loadMembers = async () => {
    if (!id) return
    try {
      const res = await projectService.listMembers(id)
      setMembers(res.data.members)
    } catch (err) {
      const parsed = parseProjectError(err)
      if (parsed.kind === 'forbidden') {
        toast.error(t('toast.no_access'))
        navigate(routes.projects, { replace: true })
      } else {
        toast.error(t('error.generic'))
      }
    }
  }

  useEffect(() => {
    if (tab === 'members') void loadMembers()
  }, [tab, id])

  if (loading) {
    return <p className="p-6 text-sm text-gray-500">{t('common:loading', { defaultValue: 'Loading…' })}</p>
  }
  if (notFound || !project) {
    return (
      <div className="p-6">
        <p className="text-sm text-gray-700">{t('detail.not_found')}</p>
        <Link to={routes.projects} className="mt-2 inline-block text-sm text-blue-600">← {t('detail.back_to_list')}</Link>
      </div>
    )
  }

  const archived = project.status === 'archived'
  const canMutate = isSuperAdmin

  const runArchive = async () => {
    setArchiveLoading(true)
    try {
      const res = archiveConfirm === 'archive'
        ? await projectService.archive(project.id)
        : await projectService.unarchive(project.id)
      setProject(res.data.project)
      toast.success(t(archiveConfirm === 'archive' ? 'toast.archive_success' : 'toast.unarchive_success'))
      setArchiveConfirm(null)
    } catch (err) {
      const parsed = parseProjectError(err)
      if (parsed.kind === 'archived_readonly') toast.error(t('error.archived_readonly'))
      else toast.error(t('error.generic'))
    } finally {
      setArchiveLoading(false)
    }
  }

  const runRemove = async () => {
    if (!removeTarget) return
    setRemoveLoading(true)
    try {
      const res = await projectService.removeMember(project.id, removeTarget.userId)
      setMembers(res.data.members)
      toast.success(t('toast.remove_member_success'))
      setRemoveTarget(null)
    } catch (err) {
      const parsed = parseProjectError(err)
      if (parsed.kind === 'archived_readonly') toast.error(t('error.archived_readonly'))
      else toast.error(t('error.generic'))
    } finally {
      setRemoveLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-4xl p-6">
      <Link to={routes.projects} className="mb-4 inline-block text-sm text-blue-600">← {t('detail.back_to_list')}</Link>

      <header className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">{project.name}</h1>
          {archived && (
            <span className="mt-1 inline-block rounded bg-gray-200 px-2 py-0.5 text-xs text-gray-700">
              {t('status.archived')}
            </span>
          )}
        </div>
        {canMutate && (
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" disabled={archived} onClick={() => setEditOpen(true)}>
              {t('detail.edit')}
            </Button>
            {archived ? (
              <Button onClick={() => setArchiveConfirm('unarchive')}>{t('detail.unarchive')}</Button>
            ) : (
              <Button variant="secondary" onClick={() => setArchiveConfirm('archive')}>
                {t('detail.archive')}
              </Button>
            )}
          </div>
        )}
      </header>

      <nav className="mb-4 flex gap-2 border-b border-gray-200">
        {(['overview', 'members'] as Tab[]).map((k) => (
          <button
            key={k}
            onClick={() => setTab(k)}
            className={`px-4 py-2 text-sm font-medium ${
              tab === k ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {t(k === 'overview' ? 'detail.tab_overview' : 'detail.tab_members')}
          </button>
        ))}
      </nav>

      {tab === 'overview' && (
        <dl className="space-y-3 rounded border border-gray-200 bg-white p-4">
          <Row label={t('detail.description')} value={project.description} />
          <Row label={t('detail.tech_stack')} value={project.techStack} />
          <Row label={t('detail.partner_name')} value={project.partnerName} />
          <Row label={t('detail.partner_contact')} value={project.partnerContactName} />
          <Row label={t('detail.partner_email')} value={project.partnerEmail} />
          <Row label={t('detail.partner_phone')} value={project.partnerPhone} />
          <Row label={t('detail.created_at')} value={project.createdAt} />
          {archived && <Row label={t('detail.archived_at')} value={project.archivedAt} />}
        </dl>
      )}

      {tab === 'members' && (
        <div className="rounded border border-gray-200 bg-white p-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-base font-semibold text-gray-900">{t('members.title')}</h2>
            {canMutate && !archived && (
              <Button onClick={() => setAddMemOpen(true)}>{t('members.add')}</Button>
            )}
          </div>
          {members.length === 0 ? (
            <p className="text-sm text-gray-500">{t('members.empty')}</p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {members.map((m) => (
                <li key={m.id} className="flex items-center justify-between py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-gray-900">{m.name}</p>
                    <p className="truncate text-xs text-gray-500">{m.email} · {m.role}</p>
                  </div>
                  {canMutate && !archived && (
                    <Button
                      variant="ghost"
                      className="text-red-600 hover:bg-red-50"
                      onClick={() => setRemoveTarget(m)}
                      aria-label={t('members.remove')}
                    >
                      ×
                    </Button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <ProjectFormModal
        open={editOpen}
        mode="update"
        project={project}
        onClose={() => setEditOpen(false)}
        onSuccess={(p) => { setProject(p); setEditOpen(false) }}
      />

      <AddMemberModal
        open={addMemOpen}
        projectId={project.id}
        currentMembers={members}
        onClose={() => setAddMemOpen(false)}
        onSuccess={setMembers}
      />

      <ConfirmDialog
        open={!!archiveConfirm}
        title={t(archiveConfirm === 'archive' ? 'archive.confirm_title' : 'archive.unarchive_confirm_title')}
        body={t(archiveConfirm === 'archive' ? 'archive.confirm_body' : 'archive.unarchive_confirm_body')}
        loading={archiveLoading}
        onConfirm={runArchive}
        onCancel={() => setArchiveConfirm(null)}
      />

      <ConfirmDialog
        open={!!removeTarget}
        title={t('members.confirm_remove_title')}
        body={t('members.confirm_remove_body', { name: removeTarget?.name ?? '' })}
        loading={removeLoading}
        danger
        onConfirm={runRemove}
        onCancel={() => setRemoveTarget(null)}
      />
    </div>
  )
}

function Row({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="flex flex-col gap-1 sm:flex-row sm:gap-4">
      <dt className="w-40 shrink-0 text-sm text-gray-500">{label}</dt>
      <dd className="text-sm text-gray-900">{value || '—'}</dd>
    </div>
  )
}
