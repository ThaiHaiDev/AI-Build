import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDebounce } from '@/hooks/useDebounce'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { toast } from '@/components/ui/Toast'
import { ConfirmDialog } from '@/features/projects/components/ConfirmDialog'
import { adminService } from '@/features/admin/services/adminService'
import { ROLES } from '@/shared/constants/roles'
import type { AdminUser, CreateUserInput } from '@/features/admin/types/admin.types'
import type { Role } from '@/shared/constants/roles'

const ROLE_OPTIONS: Role[] = [ROLES.USER, ROLES.ADMIN, ROLES.SUPER_ADMIN]

const ROLE_COLOR: Record<string, string> = {
  super_admin: 'bg-purple-100 text-purple-700',
  admin:       'bg-blue-100 text-blue-700',
  user:        'bg-gray-100 text-gray-600',
}

export default function AdminUsersPage() {
  const { t } = useTranslation('admin')

  const [users,        setUsers]        = useState<(AdminUser & { isActive: boolean })[]>([])
  const [loading,      setLoading]      = useState(true)
  const [search,       setSearch]       = useState('')
  const [roleFilter,   setRoleFilter]   = useState<Role | ''>('')
  const [statusFilter, setStatusFilter] = useState<'' | 'true' | 'false'>('')

  const debouncedSearch = useDebounce(search, 300)

  const [createOpen,    setCreateOpen]    = useState(false)
  const [createSaving,  setCreateSaving]  = useState(false)
  const [createForm,    setCreateForm]    = useState<CreateUserInput>({ email: '', name: '', password: '', role: ROLES.USER })
  const [createError,   setCreateError]   = useState('')

  const [roleTarget,   setRoleTarget]   = useState<AdminUser | null>(null)
  const [pendingRole,  setPendingRole]  = useState<Role | null>(null)
  const [roleSaving,   setRoleSaving]   = useState(false)

  const [deactivateTarget,  setDeactivateTarget]  = useState<AdminUser | null>(null)
  const [deactivateSaving,  setDeactivateSaving]  = useState(false)

  const loadUsers = async () => {
    setLoading(true)
    try {
      const params: { role?: Role; isActive?: 'true' | 'false'; search?: string } = {}
      if (roleFilter)      params.role     = roleFilter as Role
      if (statusFilter)    params.isActive = statusFilter as 'true' | 'false'
      if (debouncedSearch) params.search   = debouncedSearch

      const [allRes, deactivatedRes] = await Promise.all([
        adminService.listUsers(params),
        statusFilter === '' ? adminService.listUsers({ ...params, isActive: 'false' }) : Promise.resolve(null),
      ])

      const deactivatedIds = new Set(
        deactivatedRes ? deactivatedRes.data.users.map((u) => u.id) : [],
      )

      const merged = allRes.data.users.map((u) => ({
        ...u,
        isActive: statusFilter === 'false' ? false : !deactivatedIds.has(u.id),
      }))
      setUsers(merged)
    } catch {
      toast.error(t('error.generic'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { void loadUsers() }, [roleFilter, statusFilter, debouncedSearch])

  const handleCreate = async () => {
    setCreateError('')
    setCreateSaving(true)
    try {
      const res = await adminService.createUser(createForm)
      setUsers((prev) => [{ ...res.data.user, isActive: true }, ...prev])
      toast.success(t('toast.created'))
      setCreateOpen(false)
      setCreateForm({ email: '', name: '', password: '', role: ROLES.USER })
    } catch (err: unknown) {
      const code = (err as { response?: { data?: { error?: { code?: string } } } })
        ?.response?.data?.error?.code
      setCreateError(code === 'CONFLICT' ? t('error.email_duplicate') : t('error.generic'))
    } finally {
      setCreateSaving(false)
    }
  }

  const confirmRoleChange = (user: AdminUser, role: Role) => {
    setRoleTarget(user)
    setPendingRole(role)
  }

  const handleRoleChange = async () => {
    if (!roleTarget || !pendingRole) return
    setRoleSaving(true)
    try {
      const res = await adminService.changeRole(roleTarget.id, pendingRole)
      setUsers((prev) => prev.map((u) => u.id === roleTarget.id ? { ...u, ...res.data.user } : u))
      toast.success(t('toast.role_changed'))
      setRoleTarget(null)
    } catch (err: unknown) {
      const code = (err as { response?: { data?: { error?: { code?: string } } } })
        ?.response?.data?.error?.code
      if (code === 'SELF_ACTION_FORBIDDEN') toast.error(t('error.self_action'))
      else toast.error(t('error.generic'))
    } finally {
      setRoleSaving(false)
    }
  }

  const handleDeactivate = async () => {
    if (!deactivateTarget) return
    setDeactivateSaving(true)
    try {
      await adminService.deactivateUser(deactivateTarget.id)
      setUsers((prev) => prev.map((u) => u.id === deactivateTarget.id ? { ...u, isActive: false } : u))
      toast.success(t('toast.deactivated'))
      setDeactivateTarget(null)
    } catch (err: unknown) {
      const code = (err as { response?: { data?: { error?: { code?: string } } } })
        ?.response?.data?.error?.code
      if (code === 'SELF_ACTION_FORBIDDEN') toast.error(t('error.self_action'))
      else toast.error(t('error.generic'))
    } finally {
      setDeactivateSaving(false)
    }
  }

  return (
    <div className="mx-auto max-w-5xl p-6">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">{t('title')}</h1>
          <p className="mt-1 text-sm text-gray-500">{t('sub')}</p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>{t('create_btn')}</Button>
      </div>

      {/* Search */}
      <div className="mb-3">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t('search_placeholder')}
          className="max-w-sm"
        />
      </div>

      {/* Filters */}
      <div className="mb-4 flex flex-wrap gap-3">
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value as Role | '')}
          className="rounded border border-gray-300 px-3 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">{t('filter.role_all')}</option>
          {ROLE_OPTIONS.map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as '' | 'true' | 'false')}
          className="rounded border border-gray-300 px-3 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">{t('filter.status_all')}</option>
          <option value="true">{t('filter.status_active')}</option>
          <option value="false">{t('filter.status_deactivated')}</option>
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <p className="py-8 text-center text-sm text-gray-500">Loading…</p>
      ) : (
        <div className="overflow-x-auto rounded border border-gray-200 bg-white">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-100 bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-4 py-3">{t('table.name')}</th>
                <th className="px-4 py-3">{t('table.role')}</th>
                <th className="px-4 py-3">{t('table.status')}</th>
                <th className="px-4 py-3">{t('table.created_at')}</th>
                <th className="px-4 py-3 text-right">{t('table.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map((u) => (
                <tr key={u.id} className={u.isActive ? '' : 'opacity-50'}>
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900">{u.name}</p>
                    <p className="text-xs text-gray-500">{u.email}</p>
                  </td>
                  <td className="px-4 py-3">
                    {u.isActive ? (
                      <select
                        value={u.role}
                        onChange={(e) => confirmRoleChange(u, e.target.value as Role)}
                        className={`rounded px-2 py-0.5 text-xs font-medium ${ROLE_COLOR[u.role] ?? 'bg-gray-100 text-gray-600'} border-0 outline-none cursor-pointer`}
                      >
                        {ROLE_OPTIONS.map((r) => (
                          <option key={r} value={r}>{r}</option>
                        ))}
                      </select>
                    ) : (
                      <span className={`rounded px-2 py-0.5 text-xs font-medium ${ROLE_COLOR[u.role] ?? 'bg-gray-100 text-gray-600'}`}>
                        {u.role}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {u.isActive ? (
                      <span className="rounded bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                        {t('badge.active')}
                      </span>
                    ) : (
                      <span className="rounded bg-gray-200 px-2 py-0.5 text-xs font-medium text-gray-500">
                        {t('badge.deactivated')}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {u.isActive && (
                      <Button
                        variant="ghost"
                        className="text-xs text-red-600 hover:bg-red-50"
                        onClick={() => setDeactivateTarget(u)}
                      >
                        {t('deactivate.btn')}
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {users.length === 0 && (
            <p className="py-6 text-center text-sm text-gray-400">
              {debouncedSearch ? t('no_search_results', { q: debouncedSearch }) : '—'}
            </p>
          )}
        </div>
      )}

      {/* Create user modal */}
      <Modal open={createOpen} onClose={() => setCreateOpen(false)}>
        <div className="w-[440px] max-w-full space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">{t('create_modal.title')}</h2>
          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">{t('create_modal.email')}</label>
              <Input
                type="email"
                value={createForm.email}
                onChange={(e) => setCreateForm((f) => ({ ...f, email: e.target.value }))}
                autoFocus
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">{t('create_modal.name')}</label>
              <Input
                value={createForm.name}
                onChange={(e) => setCreateForm((f) => ({ ...f, name: e.target.value }))}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">{t('create_modal.password')}</label>
              <Input
                type="password"
                value={createForm.password}
                onChange={(e) => setCreateForm((f) => ({ ...f, password: e.target.value }))}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">{t('create_modal.role')}</label>
              <select
                value={createForm.role}
                onChange={(e) => setCreateForm((f) => ({ ...f, role: e.target.value as Role }))}
                className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {ROLE_OPTIONS.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
          </div>
          {createError && <p className="text-xs text-red-600">{createError}</p>}
          <div className="flex justify-end gap-2 pt-1">
            <Button variant="secondary" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button
              disabled={createSaving || !createForm.email || !createForm.name || !createForm.password}
              loading={createSaving}
              onClick={handleCreate}
            >
              {t('create_modal.submit')}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Confirm role change */}
      <ConfirmDialog
        open={!!roleTarget}
        title={t('change_role.confirm_title')}
        body={t('change_role.confirm_body', { name: roleTarget?.name ?? '', role: pendingRole ?? '' })}
        loading={roleSaving}
        onConfirm={handleRoleChange}
        onCancel={() => setRoleTarget(null)}
      />

      {/* Confirm deactivate */}
      <ConfirmDialog
        open={!!deactivateTarget}
        title={t('deactivate.confirm_title')}
        body={t('deactivate.confirm_body', { name: deactivateTarget?.name ?? '' })}
        loading={deactivateSaving}
        danger
        onConfirm={handleDeactivate}
        onCancel={() => setDeactivateTarget(null)}
      />
    </div>
  )
}
