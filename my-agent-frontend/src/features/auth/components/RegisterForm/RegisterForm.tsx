import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '@/features/auth/store/authStore'
import { authService } from '@/features/auth/services/authService'
import { parseAuthError } from '@/features/auth/utils/parseAuthError'
import { useZodForm } from '@/shared/hooks/useForm'
import { registerSchema, passwordStrength, type RegisterInput } from '@/shared/schemas/auth.schema'
import { FormField } from '@/shared/components/FormField'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { toast } from '@/components/ui/Toast'
import { routes } from '@/router/routes'
import { logger } from '@/lib/logger'
import { cn } from '@/utils/cn'
import styles from './RegisterForm.module.scss'

export function RegisterForm() {
  const { t } = useTranslation('auth')
  const navigate = useNavigate()
  const setAuth = useAuthStore((s) => s.setAuth)
  const [showPwd, setShowPwd] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useZodForm<RegisterInput>(registerSchema, {
    defaultValues: { name: '', email: '', password: '', passwordConfirm: '' },
  })

  const pwd      = watch('password')
  const strength = pwd ? passwordStrength(pwd) : null

  const onSubmit = async (data: RegisterInput) => {
    try {
      const res = await authService.register({
        email:    data.email,
        name:     data.name,
        password: data.password,
      })
      setAuth(res.data.user, res.data.accessToken)
      toast.success(t('toast.register_success'))
      navigate(routes.me, { replace: true })
    } catch (err) {
      logger.warn('Register failed', { err })
      toast.error(parseAuthError(err))
    }
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit(onSubmit)} noValidate>
      <FormField label={t('register.name')} htmlFor="reg-name" error={errors.name?.message}>
        <Input
          id="reg-name"
          type="text"
          autoComplete="name"
          placeholder={t('register.name_ph')}
          invalid={!!errors.name}
          aria-invalid={!!errors.name}
          {...register('name')}
        />
      </FormField>

      <FormField label={t('register.email')} htmlFor="reg-email" error={errors.email?.message}>
        <Input
          id="reg-email"
          type="email"
          autoComplete="email"
          placeholder={t('register.email_ph')}
          invalid={!!errors.email}
          aria-invalid={!!errors.email}
          {...register('email')}
        />
      </FormField>

      <FormField label={t('register.password')} htmlFor="reg-pwd" error={errors.password?.message}>
        <div className={styles.pwdWrap}>
          <Input
            id="reg-pwd"
            type={showPwd ? 'text' : 'password'}
            autoComplete="new-password"
            placeholder={t('register.password_ph')}
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
        {strength && (
          <div className={styles.strength}>
            <div className={cn(styles.bar, styles[strength])} />
            <span className={styles.strengthLabel}>{t(`register.strength.${strength}`)}</span>
          </div>
        )}
      </FormField>

      <FormField
        label={t('register.password_confirm')}
        htmlFor="reg-pwd2"
        error={errors.passwordConfirm?.message}
      >
        <Input
          id="reg-pwd2"
          type={showPwd ? 'text' : 'password'}
          autoComplete="new-password"
          placeholder={t('register.password_ph')}
          invalid={!!errors.passwordConfirm}
          aria-invalid={!!errors.passwordConfirm}
          {...register('passwordConfirm')}
        />
      </FormField>

      <Button type="submit" loading={isSubmitting} className={styles.submit}>
        {isSubmitting ? t('register.submitting') : t('register.submit')}
      </Button>

      <p className={styles.link}>
        {t('register.has_account')}{' '}
        <Link to={routes.login} className={styles.linkAnchor}>{t('register.to_login')}</Link>
      </p>
    </form>
  )
}
