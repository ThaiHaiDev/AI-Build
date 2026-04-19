import { useTranslation } from 'react-i18next'
import { AuthCard } from '@/features/auth/components/AuthCard'
import { RegisterForm } from '@/features/auth/components/RegisterForm'

export default function RegisterPage() {
  const { t } = useTranslation('auth')
  return (
    <AuthCard title={t('register.title')} subtitle={t('register.subtitle')}>
      <RegisterForm />
    </AuthCard>
  )
}
