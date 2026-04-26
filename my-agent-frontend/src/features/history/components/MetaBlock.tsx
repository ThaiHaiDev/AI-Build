import { useTranslation } from 'react-i18next'
import type { HistoryEntry } from '../types/history.types'

interface Props {
  entry: Pick<HistoryEntry, 'action' | 'meta'>
}

const ENV_LABELS: Record<string, string> = { dev: 'Dev', staging: 'Staging', production: 'Production' }
const ROLE_LABELS: Record<string, string> = { super_admin: 'Super Admin', admin: 'Admin', user: 'User' }

function fmt(v: unknown): string {
  if (v === null || v === undefined || v === '') return '—'
  if (Array.isArray(v)) return v.map((e) => ENV_LABELS[e as string] ?? e).join(', ')
  return ROLE_LABELS[v as string] ?? String(v)
}

export function MetaBlock({ entry }: Props) {
  const { t } = useTranslation('history')
  const { action, meta } = entry
  if (!meta) return null

  const { before, after } = meta

  if (action === 'update' && before && after) {
    const changed = Object.keys(after).filter((k) => before[k] !== after[k])
    if (changed.length === 0) return null
    return (
      <div className="mt-1 rounded bg-gray-50 px-2 py-1 text-xs font-mono text-gray-500">
        {changed.map((k) => (
          <div key={k}>
            <span className="text-red-500">- {t(`field.${k}`, { defaultValue: k })}: {fmt(before[k])}</span>
            <br />
            <span className="text-green-600">+ {t(`field.${k}`, { defaultValue: k })}: {fmt(after[k])}</span>
          </div>
        ))}
      </div>
    )
  }

  if ((action === 'create') && after) {
    const fields = Object.entries(after).filter(([, v]) => v !== null && v !== undefined && v !== '')
    if (fields.length === 0) return null
    return (
      <div className="mt-1 rounded bg-gray-50 px-2 py-1 text-xs font-mono text-gray-500">
        {fields.map(([k, v]) => (
          <div key={k}>
            <span className="text-green-600">+ {t(`field.${k}`, { defaultValue: k })}: {fmt(v)}</span>
          </div>
        ))}
      </div>
    )
  }

  if (action === 'delete' && before) {
    const fields = Object.entries(before).filter(([, v]) => v !== null && v !== undefined && v !== '')
    if (fields.length === 0) return null
    return (
      <div className="mt-1 rounded bg-gray-50 px-2 py-1 text-xs font-mono text-gray-500">
        {fields.map(([k, v]) => (
          <div key={k}>
            <span className="text-red-500">- {t(`field.${k}`, { defaultValue: k })}: {fmt(v)}</span>
          </div>
        ))}
      </div>
    )
  }

  if ((action === 'add_member' || action === 'update_env_access') && after?.allowedEnvs) {
    return (
      <div className="mt-1 rounded bg-gray-50 px-2 py-1 text-xs text-gray-500">
        {t('field.allowedEnvs')}: {fmt(after.allowedEnvs)}
      </div>
    )
  }

  if (action === 'change_role' && after?.role) {
    return (
      <div className="mt-1 rounded bg-gray-50 px-2 py-1 text-xs font-mono text-gray-500">
        {before?.role && (
          <span className="text-red-500">- {t('field.role')}: {fmt(before.role)}<br /></span>
        )}
        <span className="text-green-600">+ {t('field.role')}: {fmt(after.role)}</span>
      </div>
    )
  }

  return null
}
