import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from '@/components/ui/Toast'
import { historyService } from '../services/historyService'
import { MetaBlock } from './MetaBlock'
import type { HistoryEntry, ResourceType, HistoryProjectParams } from '../types/history.types'

const RESOURCE_TYPES: ResourceType[] = ['test_account', 'project', 'member', 'user']
const PAGE_LIMIT = 20

function timeAgo(dateStr: string, lang: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60_000)
  if (mins < 1) return lang === 'vi' ? 'vừa xong' : 'just now'
  if (mins < 60) return lang === 'vi' ? `${mins} phút trước` : `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return lang === 'vi' ? `${hrs} giờ trước` : `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  if (days === 1) return lang === 'vi' ? 'hôm qua' : 'yesterday'
  return lang === 'vi' ? `${days} ngày trước` : `${days}d ago`
}

function initials(email: string): string {
  return email.slice(0, 2).toUpperCase()
}

interface Props {
  projectId: string
}

export function HistoryTab({ projectId }: Props) {
  const { t, i18n } = useTranslation('history')
  const lang = i18n.resolvedLanguage ?? 'vi'

  const [entries,    setEntries]    = useState<HistoryEntry[]>([])
  const [total,      setTotal]      = useState(0)
  const [page,       setPage]       = useState(1)
  const [loading,    setLoading]    = useState(true)
  const [loadingMore,setLoadingMore]= useState(false)
  const [typeFilter, setTypeFilter] = useState<ResourceType | ''>('')
  const load = async (params: HistoryProjectParams, append = false) => {
    append ? setLoadingMore(true) : setLoading(true)
    try {
      const res = await historyService.listByProject(projectId, params)
      const data = res.data
      setTotal(data.total)
      setEntries((prev) => append ? [...prev, ...data.entries] : data.entries)
    } catch {
      toast.error(t('common:error_network'))
    } finally {
      append ? setLoadingMore(false) : setLoading(false)
    }
  }

  useEffect(() => {
    setPage(1)
    void load({ resourceType: typeFilter || undefined, page: 1, limit: PAGE_LIMIT })
  }, [projectId, typeFilter])

  const loadMore = () => {
    const next = page + 1
    setPage(next)
    void load({ resourceType: typeFilter || undefined, page: next, limit: PAGE_LIMIT }, true)
  }

  const actionLabel = (action: string) => t(`action.${action}`, { defaultValue: action })
  const typeLabel   = (rt: ResourceType) => t(`resource_type.${rt}`, { defaultValue: rt })

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-2">
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as ResourceType | '')}
          className="rounded border border-gray-300 px-3 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">{t('filter.type_all')}</option>
          {RESOURCE_TYPES.map((rt) => (
            <option key={rt} value={rt}>{typeLabel(rt)}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <p className="py-8 text-center text-sm text-gray-400">{t('common:loading')}</p>
      ) : entries.length === 0 ? (
        <p className="py-8 text-center text-sm text-gray-400">{t('empty')}</p>
      ) : (
        <ul className="divide-y divide-gray-100 rounded border border-gray-200 bg-white">
          {entries.map((e) => (
            <li key={e.id} className="flex items-start gap-3 px-4 py-3">
              <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gray-200 text-xs font-semibold text-gray-600">
                {initials(e.actorEmail)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm text-gray-900">
                  <span className="font-medium">{e.actorEmail}</span>
                  {' · '}
                  <span>{actionLabel(e.action)}</span>
                </p>
                <p className="text-sm text-gray-600">{e.resourceName}</p>
                <MetaBlock entry={e} />
              </div>
              <time className="shrink-0 text-xs text-gray-400">{timeAgo(e.createdAt, lang)}</time>
            </li>
          ))}
        </ul>
      )}

      {!loading && entries.length < total && (
        <div className="mt-4 text-center">
          <button
            onClick={loadMore}
            disabled={loadingMore}
            className="rounded border border-gray-300 px-4 py-1.5 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50"
          >
            {loadingMore ? t('common:loading') : t('load_more')}
          </button>
        </div>
      )}
    </div>
  )
}
