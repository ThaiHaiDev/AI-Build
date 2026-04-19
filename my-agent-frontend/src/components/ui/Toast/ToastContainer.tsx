import { useToastStore } from './toastStore'
import styles from './Toast.module.scss'
import { cn } from '@/utils/cn'

export function ToastContainer() {
  const toasts = useToastStore((s) => s.toasts)
  const remove = useToastStore((s) => s.remove)
  return (
    <div className={styles.container} aria-live="polite" aria-atomic="true">
      {toasts.map((t) => (
        <div
          key={t.id}
          role={t.kind === 'error' ? 'alert' : 'status'}
          className={cn(styles.toast, styles[t.kind])}
          onClick={() => remove(t.id)}
        >
          {t.msg}
        </div>
      ))}
    </div>
  )
}
