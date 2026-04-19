import { useTranslation } from 'react-i18next'
import { AuthCard } from '@/features/auth/components/AuthCard'
import { LoginForm } from '@/features/auth/components/LoginForm'

export default function LoginPage() {
  const { t } = useTranslation('auth')
  return (
    <AuthCard title={t('login.title')} subtitle={t('login.subtitle')}>
      <LoginForm />
    </AuthCard>
  )
}
