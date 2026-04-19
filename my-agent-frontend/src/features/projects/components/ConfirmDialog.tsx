import { useTranslation } from 'react-i18next'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'

interface Props {
  open:       boolean
  title:      string
  body:       string
  loading?:   boolean
  danger?:    boolean
  onConfirm:  () => void
  onCancel:   () => void
}

export function ConfirmDialog({ open, title, body, loading, danger, onConfirm, onCancel }: Props) {
  const { t } = useTranslation('projects')
  return (
    <Modal open={open} onClose={onCancel}>
      <div className="w-[420px] max-w-full">
        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
        <p className="mt-2 text-sm text-gray-600">{body}</p>
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="secondary" onClick={onCancel} disabled={loading}>
            {t('action.cancel')}
          </Button>
          <Button
            variant="primary"
            onClick={onConfirm}
            loading={loading}
            className={danger ? 'bg-red-600 hover:bg-red-700' : ''}
          >
            {t('action.confirm')}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
