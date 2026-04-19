import type { ReactNode } from 'react'
import styles from './AuthCard.module.scss'

interface Props {
  title:     string
  subtitle?: string
  footer?:   ReactNode
  children:  ReactNode
}

export function AuthCard({ title, subtitle, footer, children }: Props) {
  return (
    <section className={styles.card}>
      <header className={styles.header}>
        <h1 className={styles.title}>{title}</h1>
        {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
      </header>
      <div className={styles.body}>{children}</div>
      {footer && <div className={styles.footer}>{footer}</div>}
    </section>
  )
}
