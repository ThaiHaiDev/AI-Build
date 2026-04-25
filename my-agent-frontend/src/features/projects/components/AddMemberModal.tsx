import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { toast } from '@/components/ui/Toast'
import { projectService } from '../services/projectService'
import { parseProjectError } from '../utils/parseProjectError'
import type { ProjectMember, UserSummary, Environment } from '../types/project.types'

const ALL_ENVS: Environment[] = ['dev', 'staging', 'production']

interface Props {
  open:            boolean
  projectId:       string
  currentMembers:  ProjectMember[]
  onClose:         () => void
  onSuccess:       (members: ProjectMember[]) => void
}

export function AddMemberModal({ open, projectId, currentMembers, onClose, onSuccess }: Props) {
  const { t } = useTranslation('projects')
  const [query, setQuery]           = useState('')
  const [results, setResults]       = useState<UserSummary[]>([])
  const [loading, setLoading]       = useState(false)
  const [adding, setAdding]         = useState<string | null>(null)
  const [allowedEnvs, setAllowedEnvs] = useState<Environment[]>(['dev'])

  const activeIds = useMemo(() => new Set(currentMembers.map((m) => m.userId)), [currentMembers])

  const toggleEnv = (env: Environment) => {
    setAllowedEnvs((prev) =>
      prev.includes(env) ? prev.filter((e) => e !== env) : [...prev, env],
    )
  }

  useEffect(() => {
    if (!open) {
      setQuery('')
      setResults([])
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const q = query.trim()
    if (!q) {
      setResults([])
      return
    }
    const timer = setTimeout(async () => {
      setLoading(true)
      try {
        const res = await projectService.searchUsers(q)
        setResults(res.data.users)
      } catch {
        setResults([])
      } finally {
        setLoading(false)
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [query, open])

  const handleAdd = async (userId: string) => {
    setAdding(userId)
    try {
      const res = await projectService.addMember(projectId, userId, allowedEnvs)
      toast.success(t('toast.add_member_success'))
      onSuccess(res.data.members)
      onClose()
    } catch (err) {
      const parsed = parseProjectError(err)
      if (parsed.kind === 'rate_limit') toast.error(t('error.rate_limit'))
      else if (parsed.kind === 'archived_readonly') toast.error(t('error.archived_readonly'))
      else toast.error(t('error.generic'))
    } finally {
      setAdding(null)
    }
  }

  return (
    <Modal open={open} onClose={onClose}>
      <div className="w-[480px] max-w-full">
        <h2 className="mb-3 text-lg font-semibold text-gray-900">{t('members.search_title')}</h2>

        <div className="mb-3 flex flex-wrap gap-3">
          {ALL_ENVS.map((env) => (
            <label key={env} className="flex cursor-pointer items-center gap-1.5 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={allowedEnvs.includes(env)}
                onChange={() => toggleEnv(env)}
                className="h-4 w-4 rounded border-gray-300 accent-blue-600"
              />
              {t(`members.env_${env}`)}
            </label>
          ))}
        </div>

        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t('members.search_placeholder')}
          autoFocus
        />
        <div className="mt-3 max-h-72 overflow-y-auto rounded border border-gray-200">
          {loading && <p className="p-3 text-sm text-gray-500">{t('common:loading', { defaultValue: 'Loading…' })}</p>}
          {!loading && query.trim() && results.length === 0 && (
            <p className="p-3 text-sm text-gray-500">{t('members.no_results')}</p>
          )}
          {results.map((u) => {
            const already = activeIds.has(u.id)
            return (
              <div key={u.id} className="flex items-center justify-between gap-2 border-b border-gray-100 p-3 last:border-0">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-gray-900">{u.name}</p>
                  <p className="truncate text-xs text-gray-500">{u.email} · {u.role}</p>
                </div>
                <Button
                  variant="primary"
                  disabled={already || adding === u.id}
                  loading={adding === u.id}
                  onClick={() => handleAdd(u.id)}
                >
                  {already ? t('members.already_member') : t('members.add')}
                </Button>
              </div>
            )
          })}
        </div>
        <div className="mt-4 flex justify-end">
          <Button variant="secondary" onClick={onClose}>{t('action.cancel')}</Button>
        </div>
      </div>
    </Modal>
  )
}
