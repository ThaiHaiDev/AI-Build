import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { ENVIRONMENTS } from '../types/project.types'
import type { TestAccount, CreateTestAccountInput, Environment } from '../types/project.types'

const schema = z.object({
  environment: z.enum(ENVIRONMENTS as [Environment, ...Environment[]]),
  label:       z.string().trim().min(1, 'Required').max(200),
  username:    z.string().trim().min(1, 'Required').max(320),
  password:    z.string().min(1, 'Required'),
  url:         z.string().url('Invalid URL').max(500).or(z.literal('')).optional().transform((v) => v || null),
  note:        z.string().max(5000).optional().transform((v) => v || null),
})

type FormValues = z.infer<typeof schema>

interface Props {
  open:       boolean
  mode:       'create' | 'edit'
  initial?:   TestAccount
  submitting: boolean
  onClose:    () => void
  onSubmit:   (values: CreateTestAccountInput) => void
}

export function VaultFormModal({ open, mode, initial, submitting, onClose, onSubmit }: Props) {
  const { t } = useTranslation('projects')

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      environment: 'dev',
      label:       '',
      username:    '',
      password:    '',
      url:         '',
      note:        '',
    },
  })

  useEffect(() => {
    if (open) {
      reset(initial
        ? { environment: initial.environment, label: initial.label, username: initial.username, password: initial.password, url: initial.url ?? '', note: initial.note ?? '' }
        : { environment: 'dev', label: '', username: '', password: '', url: '', note: '' }
      )
    }
  }, [open, initial, reset])

  const fieldCls = (hasErr?: boolean) =>
    `w-full rounded border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 ${hasErr ? 'border-red-400 bg-red-50' : 'border-gray-300 bg-white'}`

  return (
    <Modal open={open} onClose={onClose}>
      <div className="w-[480px] max-w-full">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">
          {t(mode === 'create' ? 'vault.modal_title_create' : 'vault.modal_title_edit')}
        </h2>

        <form onSubmit={handleSubmit((v) => onSubmit(v as CreateTestAccountInput))} noValidate>
          <div className="space-y-4">
            {/* Environment */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">{t('vault.field_env')} *</label>
              <select className={fieldCls(!!errors.environment)} {...register('environment')}>
                {ENVIRONMENTS.map((e) => (
                  <option key={e} value={e}>{t(`vault.env_${e}`)}</option>
                ))}
              </select>
            </div>

            {/* Label */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">{t('vault.field_label')} *</label>
              <input
                type="text"
                placeholder={t('vault.field_label_ph')}
                className={fieldCls(!!errors.label)}
                {...register('label')}
              />
              {errors.label && <p className="mt-1 text-xs text-red-600">{errors.label.message}</p>}
            </div>

            {/* Username */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">{t('vault.field_username')} *</label>
              <input
                type="text"
                autoComplete="off"
                placeholder={t('vault.field_username_ph')}
                className={fieldCls(!!errors.username)}
                {...register('username')}
              />
              {errors.username && <p className="mt-1 text-xs text-red-600">{errors.username.message}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">{t('vault.field_password')} *</label>
              <input
                type="text"
                autoComplete="new-password"
                className={fieldCls(!!errors.password)}
                {...register('password')}
              />
              {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>}
            </div>

            {/* URL */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">{t('vault.field_url')}</label>
              <input
                type="url"
                placeholder={t('vault.field_url_ph')}
                className={fieldCls(!!errors.url)}
                {...register('url')}
              />
              {errors.url && <p className="mt-1 text-xs text-red-600">{errors.url.message}</p>}
            </div>

            {/* Note */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">{t('vault.field_note')}</label>
              <textarea
                rows={2}
                className={`${fieldCls(false)} resize-none`}
                {...register('note')}
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={onClose} disabled={submitting}>
              {t('action.cancel')}
            </Button>
            <Button type="submit" loading={submitting}>
              {t('action.confirm')}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  )
}
