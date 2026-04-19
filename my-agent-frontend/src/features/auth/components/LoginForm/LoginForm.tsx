import { useState } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '@/features/auth/store/authStore'
import { authService } from '@/features/auth/services/authService'
import { parseAuthError } from '@/features/auth/utils/parseAuthError'
import { useZodForm } from '@/shared/hooks/useForm'
import { loginSchema, type LoginInput } from '@/shared/schemas/auth.schema'
import { FormField } from '@/shared/components/FormField'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { toast } from '@/components/ui/Toast'
import { routes } from '@/router/routes'
import { logger } from '@/lib/logger'
import styles from './LoginForm.module.scss'

export function LoginForm() {
  const { t } = useTranslation('auth')
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const setAuth = useAuthStore((s) => s.setAuth)
  const [showPwd, setShowPwd] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useZodForm<LoginInput>(loginSchema, {
    defaultValues: { email: '', password: '', remember: false },
  })

  const onSubmit = async (data: LoginInput) => {
    try {
      const res = await authService.login({ email: data.email, password: data.password })
      setAuth(res.data.user, res.data.accessToken)
      toast.success(t('toast.login_success'))
      const redirect = params.get('redirect') ?? routes.me
      navigate(redirect, { replace: true })
    } catch (err) {
      logger.warn('Login failed', { err })
      toast.error(parseAuthError(err))
    }
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit(onSubmit)} noValidate>
      <FormField label={t('login.email')} htmlFor="login-email" error={errors.email?.message}>
        <Input
          id="login-email"
          type="email"
          autoComplete="email"
          placeholder={t('login.email_ph')}
          invalid={!!errors.email}
          aria-invalid={!!errors.email}
          {...register('email')}
        />
      </FormField>

      <FormField label={t('login.password')} htmlFor="login-password" error={errors.password?.message}>
        <div className={styles.pwdWrap}>
          <Input
            id="login-password"
            type={showPwd ? 'text' : 'password'}
            autoComplete="current-password"
            placeholder={t('login.password_ph')}
            invalid={!!errors.password}
            aria-invalid={!!errors.password}
            {...register('password')}
          />
          <button
            type="button"
            className={styles.eye}
            onClick={() => setShowPwd((v) => !v)}
            aria-label={showPwd ? 'Hide password' : 'Show password'}
          >
            {showPwd ? '🙈' : '👁'}
          </button>
        </div>
      </FormField>

      <label className={styles.remember}>
        <input type="checkbox" {...register('remember')} />
        <span>{t('login.remember')}</span>
      </label>

      <Button type="submit" loading={isSubmitting} className={styles.submit}>
        {isSubmitting ? t('login.submitting') : t('login.submit')}
      </Button>

      <p className={styles.link}>
        {t('login.no_account')}{' '}
        <Link to={routes.register} className={styles.linkAnchor}>{t('login.to_register')}</Link>
      </p>
    </form>
  )
}
