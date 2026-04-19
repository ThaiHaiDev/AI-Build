import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { projectFormSchema, normalizeProjectForm, type ProjectFormValues } from '../schemas/project.schema'
import type { CreateProjectInput } from '../types/project.types'
import type { Project } from '../types/project.types'

interface Props {
  initial?:   Partial<Project>
  submitting: boolean
  submitKey:  'submit_create' | 'submit_update'
  nameError?: string | null
  onCancel:   () => void
  onSubmit:   (values: CreateProjectInput) => void
}

export function ProjectForm({ initial, submitting, submitKey, nameError, onCancel, onSubmit }: Props) {
  const { t } = useTranslation('projects')
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProjectFormValues>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: {
      name:               initial?.name ?? '',
      description:        initial?.description ?? '',
      techStack:          initial?.techStack ?? '',
      partnerName:        initial?.partnerName ?? '',
      partnerContactName: initial?.partnerContactName ?? '',
      partnerEmail:       initial?.partnerEmail ?? '',
      partnerPhone:       initial?.partnerPhone ?? '',
    },
  })

  const submit = (values: ProjectFormValues) => onSubmit(normalizeProjectForm(values))

  return (
    <form onSubmit={handleSubmit(submit)} className="w-[540px] max-w-full space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">{t('form.name')} *</label>
        <Input
          {...register('name')}
          invalid={!!errors.name || !!nameError}
          placeholder={t('form.name_placeholder')}
          aria-invalid={!!errors.name || !!nameError}
        />
        {(errors.name || nameError) && (
          <p className="mt-1 text-xs text-red-600">{nameError ?? errors.name?.message}</p>
        )}
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">{t('form.description')}</label>
        <textarea
          {...register('description')}
          rows={3}
          className="w-full rounded border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-200"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">{t('form.tech_stack')}</label>
        <Input {...register('techStack')} placeholder={t('form.tech_stack_placeholder')} />
      </div>

      <fieldset className="rounded border border-gray-200 p-3">
        <legend className="px-1 text-xs font-medium text-gray-500">{t('form.partner_section')}</legend>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs text-gray-600">{t('form.partner_name')}</label>
            <Input {...register('partnerName')} />
          </div>
          <div>
            <label className="mb-1 block text-xs text-gray-600">{t('form.partner_contact')}</label>
            <Input {...register('partnerContactName')} />
          </div>
          <div>
            <label className="mb-1 block text-xs text-gray-600">{t('form.partner_email')}</label>
            <Input {...register('partnerEmail')} invalid={!!errors.partnerEmail} />
            {errors.partnerEmail && (
              <p className="mt-1 text-xs text-red-600">{errors.partnerEmail.message}</p>
            )}
          </div>
          <div>
            <label className="mb-1 block text-xs text-gray-600">{t('form.partner_phone')}</label>
            <Input {...register('partnerPhone')} />
          </div>
        </div>
      </fieldset>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={submitting}>
          {t('action.cancel')}
        </Button>
        <Button type="submit" variant="primary" loading={submitting}>
          {t(`form.${submitKey}`)}
        </Button>
      </div>
    </form>
  )
}
