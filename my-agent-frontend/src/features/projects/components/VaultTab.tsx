import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/Button'
import { toast } from '@/components/ui/Toast'
import { ConfirmDialog } from './ConfirmDialog'
import { VaultFormModal } from './VaultFormModal'
import { vaultService } from '../services/vaultService'
import type { AccountsByEnv, TestAccount, CreateTestAccountInput, Environment } from '../types/project.types'

interface Props {
  projectId: string
  canWrite:  boolean
}

const ENV_LABELS: Record<Environment, string> = {
  dev:        'vault.env_dev',
  staging:    'vault.env_staging',
  production: 'vault.env_production',
}

function CopyButton({ value, label }: { value: string; label: string }) {
  const { t } = useTranslation('projects')
  const [flash, setFlash] = useState(false)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value)
      setFlash(true)
      setTimeout(() => setFlash(false), 2000)
    } catch {
      toast.error(t('vault.copy_fail'))
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      className="ml-1 rounded px-1.5 py-0.5 text-xs text-gray-500 hover:bg-gray-100 hover:text-gray-800"
      title={label}
    >
      {flash ? t('vault.copied') : t('vault.copy')}
    </button>
  )
}

function PasswordCell({ password }: { password: string }) {
  const { t } = useTranslation('projects')
  const [revealed, setRevealed] = useState(false)
  return (
    <span className="inline-flex items-center gap-1">
      <span className="font-mono text-xs">{revealed ? password : '••••••••'}</span>
      <button
        type="button"
        onClick={() => setRevealed((v) => !v)}
        className="rounded px-1 py-0.5 text-xs text-gray-400 hover:text-gray-700"
      >
        {t(revealed ? 'vault.hide' : 'vault.reveal')}
      </button>
      <CopyButton value={password} label={t('vault.copy')} />
    </span>
  )
}

export function VaultTab({ projectId, canWrite }: Props) {
  const { t } = useTranslation('projects')
  const [accounts, setAccounts]       = useState<AccountsByEnv>({})
  const [grantedEnvs, setGrantedEnvs] = useState<Environment[]>([])
  const [loading, setLoading]         = useState(true)
  const [formOpen, setFormOpen] = useState(false)
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create')
  const [editing, setEditing]   = useState<TestAccount | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<TestAccount | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  useEffect(() => {
    let cancel = false
    setLoading(true)
    vaultService.list(projectId)
      .then((res) => {
        if (!cancel) {
          setAccounts(res.data.accounts)
          setGrantedEnvs(res.data.grantedEnvs)
        }
      })
      .catch(() => { if (!cancel) toast.error(t('vault.error_generic')) })
      .finally(() => { if (!cancel) setLoading(false) })
    return () => { cancel = true }
  }, [projectId, t])

  const openCreate = () => { setEditing(null); setFormMode('create'); setFormOpen(true) }
  const openEdit   = (a: TestAccount) => { setEditing(a); setFormMode('edit'); setFormOpen(true) }

  const handleSubmit = async (values: CreateTestAccountInput) => {
    setSubmitting(true)
    try {
      if (formMode === 'create') {
        const res = await vaultService.create(projectId, values)
        const a = res.data.account
        setAccounts((prev) => ({
          ...prev,
          [a.environment]: [...(prev[a.environment as Environment] ?? []), a],
        }))
        toast.success(t('vault.toast_created'))
      } else if (editing) {
        const res = await vaultService.update(projectId, editing.id, values)
        const updated = res.data.account
        setAccounts((prev) => ({
          ...prev,
          [editing.environment]: (prev[editing.environment] ?? []).filter((x: TestAccount) => x.id !== editing.id),
          [updated.environment]: [...(prev[updated.environment as Environment] ?? []).filter((x: TestAccount) => x.id !== updated.id), updated],
        }))
        toast.success(t('vault.toast_updated'))
      }
      setFormOpen(false)
    } catch {
      toast.error(t('vault.error_generic'))
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleteLoading(true)
    try {
      await vaultService.remove(projectId, deleteTarget.id)
      const env = deleteTarget.environment
      setAccounts((prev) => ({ ...prev, [env]: (prev[env] ?? []).filter((a: TestAccount) => a.id !== deleteTarget.id) }))
      toast.success(t('vault.toast_deleted'))
      setDeleteTarget(null)
    } catch {
      toast.error(t('vault.error_generic'))
    } finally {
      setDeleteLoading(false)
    }
  }

  if (loading) {
    return <p className="py-4 text-sm text-gray-500">{t('common:loading', { defaultValue: 'Loading…' })}</p>
  }

  if (grantedEnvs.length === 0) {
    return (
      <div className="rounded border border-dashed border-gray-300 p-10 text-center text-sm text-gray-500">
        🔒
        <p className="mt-2">{t('vault.empty_access')}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {grantedEnvs.map((env) => (
        <section key={env}>
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
              {t(ENV_LABELS[env])}
            </h3>
            {canWrite && (
              <Button variant="secondary" onClick={openCreate} className="text-xs px-2 py-1">
                {t('vault.add')}
              </Button>
            )}
          </div>

          {(accounts[env] ?? []).length === 0 ? (
            <p className="rounded border border-dashed border-gray-200 px-4 py-3 text-sm text-gray-400">
              {t('vault.empty_env')}
            </p>
          ) : (
            <ul className="divide-y divide-gray-100 rounded border border-gray-200 bg-white">
              {(accounts[env] ?? []).map((a) => (
                <li key={a.id} className="px-4 py-3">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-medium text-gray-900">{a.label}</p>
                    {canWrite && (
                      <div className="flex shrink-0 gap-1">
                        <Button variant="ghost" className="text-xs px-2 py-0.5" onClick={() => openEdit(a)}>
                          {t('vault.edit')}
                        </Button>
                        <Button
                          variant="ghost"
                          className="text-xs px-2 py-0.5 text-red-600 hover:bg-red-50"
                          onClick={() => setDeleteTarget(a)}
                        >
                          {t('vault.delete')}
                        </Button>
                      </div>
                    )}
                  </div>
                  <dl className="mt-1.5 space-y-1 text-sm text-gray-700">
                    <div className="flex items-center gap-2">
                      <dt className="w-24 shrink-0 text-xs text-gray-400">{t('vault.field_username')}</dt>
                      <dd className="font-mono text-xs">{a.username}</dd>
                      <CopyButton value={a.username} label={t('vault.copy')} />
                    </div>
                    <div className="flex items-center gap-2">
                      <dt className="w-24 shrink-0 text-xs text-gray-400">{t('vault.field_password')}</dt>
                      <dd><PasswordCell password={a.password} /></dd>
                    </div>
                    {a.url && (
                      <div className="flex items-center gap-2">
                        <dt className="w-24 shrink-0 text-xs text-gray-400">URL</dt>
                        <dd>
                          <a href={a.url} target="_blank" rel="noreferrer" className="text-xs text-blue-600 hover:underline">
                            {a.url}
                          </a>
                          <CopyButton value={a.url} label={t('vault.copy')} />
                        </dd>
                      </div>
                    )}
                    {a.note && (
                      <div className="flex items-start gap-2">
                        <dt className="w-24 shrink-0 text-xs text-gray-400">{t('vault.field_note')}</dt>
                        <dd className="text-xs text-gray-600">{a.note}</dd>
                      </div>
                    )}
                  </dl>
                </li>
              ))}
            </ul>
          )}
        </section>
      ))}

      <VaultFormModal
        open={formOpen}
        mode={formMode}
        initial={editing ?? undefined}
        submitting={submitting}
        onClose={() => setFormOpen(false)}
        onSubmit={handleSubmit}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        title={t('vault.confirm_delete_title')}
        body={t('vault.confirm_delete_body', { label: deleteTarget?.label ?? '' })}
        loading={deleteLoading}
        danger
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
