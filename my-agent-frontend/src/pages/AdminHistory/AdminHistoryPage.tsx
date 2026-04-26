import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from '@/components/ui/Toast'
import { historyService } from '@/features/history/services/historyService'
import { MetaBlock } from '@/features/history/components/MetaBlock'
import type { HistoryEntry, ResourceType, HistoryGlobalParams } from '@/features/history/types/history.types'

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

export default function AdminHistoryPage() {
  const { t, i18n } = useTranslation('history')
  const lang = i18n.resolvedLanguage ?? 'vi'

  const [entries,  setEntries]  = useState<HistoryEntry[]>([])
  const [total,    setTotal]    = useState(0)
  const [page,     setPage]     = useState(1)
  const [loading,  setLoading]  = useState(true)

  const [typeFilter,   setTypeFilter]   = useState<ResourceType | ''>('')
  const [actorFilter,  setActorFilter]  = useState('')
  const [actorInput,   setActorInput]   = useState('')
  const [fromDate,     setFromDate]     = useState('')
  const [toDate,       setToDate]       = useState('')

  const buildParams = (p: number): HistoryGlobalParams => ({
    resourceType: typeFilter || undefined,
    actorId:      actorFilter || undefined,
    from:         fromDate || undefined,
    to:           toDate || undefined,
    page:         p,
    limit:        PAGE_LIMIT,
  })

  const load = async (p: number) => {
    setLoading(true)
    try {
      const res = await historyService.listGlobal(buildParams(p))
      setEntries(res.data.entries)
      setTotal(res.data.total)
    } catch {
      toast.error(t('common:error_network'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { void load(1); setPage(1) }, [typeFilter, actorFilter, fromDate, toDate])

  const applyFilters = () => {
    setActorFilter(actorInput)
  }

  const totalPages = Math.ceil(total / PAGE_LIMIT)
  const pageRange = Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
    const start = Math.max(1, Math.min(page - 2, totalPages - 4))
    return start + i
  })

  const goPage = (p: number) => { setPage(p); void load(p) }

  const actionLabel = (action: string) => t(`action.${action}`, { defaultValue: action })
  const typeLabel   = (rt: ResourceType) => t(`resource_type.${rt}`, { defaultValue: rt })

  return (
    <div className="mx-auto max-w-6xl p-6">
      <h1 className="mb-5 text-2xl font-semibold text-gray-900">{t('page_title')}</h1>

      {/* Filters */}
      <div className="mb-4 flex flex-wrap items-end gap-3 rounded border border-gray-200 bg-gray-50 p-3">
        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-500">{t('table.resource')}</label>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as ResourceType | '')}
            className="rounded border border-gray-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">{t('filter.type_all')}</option>
            {RESOURCE_TYPES.map((rt) => (
              <option key={rt} value={rt}>{typeLabel(rt)}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-500">{t('table.actor')}</label>
          <input
            value={actorInput}
            onChange={(e) => setActorInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
            placeholder={t('filter.actor_ph')}
            className="rounded border border-gray-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-500">{t('filter.date_from')}</label>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="rounded border border-gray-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-500">{t('filter.date_to')}</label>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="rounded border border-gray-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <button
          onClick={applyFilters}
          className="rounded bg-blue-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
        >
          {t('filter.apply')}
        </button>
      </div>

      {/* Table */}
      {loading ? (
        <p className="py-12 text-center text-sm text-gray-400">{t('common:loading')}</p>
      ) : entries.length === 0 ? (
        <p className="py-12 text-center text-sm text-gray-400">{t('empty')}</p>
      ) : (
        <div className="overflow-x-auto rounded border border-gray-200 bg-white">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-100 bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-4 py-3 w-24">{t('table.time')}</th>
                <th className="px-4 py-3">{t('table.actor')}</th>
                <th className="px-4 py-3">{t('table.action')}</th>
                <th className="px-4 py-3">{t('table.resource')}</th>
                <th className="px-4 py-3">{t('table.project')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {entries.map((e) => (
                <tr key={e.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-xs text-gray-400 whitespace-nowrap">
                    {timeAgo(e.createdAt, lang)}
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900 truncate max-w-[180px]">{e.actorName}</p>
                    <p className="text-xs text-gray-500 truncate max-w-[180px]">{e.actorEmail}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700">
                      {actionLabel(e.action)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-gray-900 truncate max-w-[180px]">{e.resourceName}</p>
                    <p className="text-xs text-gray-500">{typeLabel(e.resourceType)}</p>
                    <MetaBlock entry={e} />
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">{e.projectName ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
          <span>
            {t('pagination', {
              from: (page - 1) * PAGE_LIMIT + 1,
              to:   Math.min(page * PAGE_LIMIT, total),
              total,
            })}
          </span>
          <div className="flex gap-1">
            <button
              onClick={() => goPage(page - 1)}
              disabled={page <= 1}
              className="rounded border px-2 py-1 text-xs disabled:opacity-40 hover:bg-gray-50"
            >
              ←
            </button>
            {pageRange.map((p) => (
              <button
                key={p}
                onClick={() => goPage(p)}
                className={`rounded border px-2.5 py-1 text-xs ${p === page ? 'bg-blue-600 text-white border-blue-600' : 'hover:bg-gray-50'}`}
              >
                {p}
              </button>
            ))}
            <button
              onClick={() => goPage(page + 1)}
              disabled={page >= totalPages}
              className="rounded border px-2 py-1 text-xs disabled:opacity-40 hover:bg-gray-50"
            >
              →
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
