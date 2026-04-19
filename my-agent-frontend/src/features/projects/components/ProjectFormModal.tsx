import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Modal } from '@/components/ui/Modal'
import { toast } from '@/components/ui/Toast'
import { projectService } from '../services/projectService'
import { parseProjectError } from '../utils/parseProjectError'
import { ProjectForm } from './ProjectForm'
import type { Project, CreateProjectInput } from '../types/project.types'

interface Props {
  open:       boolean
  mode:       'create' | 'update'
  project?:   Project
  onClose:    () => void
  onSuccess:  (project: Project) => void
}

export function ProjectFormModal({ open, mode, project, onClose, onSuccess }: Props) {
  const { t } = useTranslation('projects')
  const [submitting, setSubmitting] = useState(false)
  const [nameError, setNameError] = useState<string | null>(null)

  const handleSubmit = async (values: CreateProjectInput) => {
    setSubmitting(true)
    setNameError(null)
    try {
      const res = mode === 'create'
        ? await projectService.create(values)
        : await projectService.update(project!.id, values)
      toast.success(t(mode === 'create' ? 'toast.create_success' : 'toast.update_success'))
      onSuccess(res.data.project)
    } catch (err) {
      const parsed = parseProjectError(err)
      if (parsed.kind === 'name_duplicate') {
        setNameError(t('error.name_duplicate'))
      } else if (parsed.kind === 'rate_limit') {
        toast.error(t('error.rate_limit'))
      } else if (parsed.kind === 'archived_readonly') {
        toast.error(t('error.archived_readonly'))
      } else {
        toast.error(t('error.generic'))
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose}>
      <div>
        <h2 className="mb-4 text-lg font-semibold text-gray-900">
          {t(mode === 'create' ? 'form.title_create' : 'form.title_update')}
        </h2>
        <ProjectForm
          key={project?.id ?? 'new'}
          initial={project}
          submitting={submitting}
          submitKey={mode === 'create' ? 'submit_create' : 'submit_update'}
          nameError={nameError}
          onCancel={onClose}
          onSubmit={handleSubmit}
        />
      </div>
    </Modal>
  )
}
