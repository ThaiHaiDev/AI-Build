import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/features/auth/store/authStore';
import { authService } from '@/features/auth/services/authService';
import { parseAuthError } from '@/features/auth/utils/parseAuthError';
import { useZodForm } from '@/shared/hooks/useForm';
import { loginSchema, type LoginInput } from '@/shared/schemas/auth.schema';
import { routes } from '@/router/routes';
import { logger } from '@/lib/logger';
import {
  MailIcon, LockIcon, EyeIcon, EyeOffIcon,
  ArrowRightIcon, SpinIcon, CheckIcon, AlertCircleIcon,
} from '../icons';
import styles from './LoginForm.module.scss';

export function LoginForm() {
  const { t } = useTranslation('auth');
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [showPwd, setShowPwd] = useState(false);
  const [submitState, setSubmitState] = useState<'idle' | 'submitting' | 'success'>('idle');
  const [bannerError, setBannerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useZodForm<LoginInput>(loginSchema, {
    defaultValues: { email: '', password: '', remember: true },
  });

  const onSubmit = async (data: LoginInput) => {
    setBannerError(null);
    setSubmitState('submitting');
    try {
      const res = await authService.login({ email: data.email, password: data.password });
      setAuth(res.data.user, res.data.accessToken);
      setSubmitState('success');
      const redirect = params.get('redirect') ?? routes.me;
      setTimeout(() => navigate(redirect, { replace: true }), 600);
    } catch (err) {
      logger.warn('Login failed', { err });
      setBannerError(parseAuthError(err));
      setSubmitState('idle');
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit(onSubmit)} noValidate>
      {/* Top-of-form error banner */}
      {bannerError && (
        <div className={styles.banner} role="alert">
          <AlertCircleIcon className={styles.bannerIcon} />
          <span>{bannerError}</span>
        </div>
      )}

      {/* Email field */}
      <div className={styles.fieldGroup}>
        <div className={styles.labelRow}>
          <label htmlFor="login-email" className={styles.label}>{t('login.email')}</label>
        </div>
        <div className={`${styles.inputWrap} ${errors.email ? styles.inputInvalid : ''}`}>
          <MailIcon className={styles.inputIcon} />
          <input
            id="login-email"
            type="email"
            autoComplete="email"
            placeholder={t('login.email_ph')}
            aria-invalid={!!errors.email}
            className={styles.input}
            {...register('email')}
          />
        </div>
        <div className={styles.errorSlot}>{errors.email && <span>{t(errors.email.message as string)}</span>}</div>
      </div>

      {/* Password field */}
      <div className={styles.fieldGroup}>
        <div className={styles.labelRow}>
          <label htmlFor="login-password" className={styles.label}>{t('login.password')}</label>
          <span className={styles.labelHint}>{t('login.forgot')}</span>
        </div>
        <div className={`${styles.inputWrap} ${errors.password ? styles.inputInvalid : ''}`}>
          <LockIcon className={styles.inputIcon} />
          <input
            id="login-password"
            type={showPwd ? 'text' : 'password'}
            autoComplete="current-password"
            placeholder={t('login.password_ph')}
            aria-invalid={!!errors.password}
            className={styles.input}
            {...register('password')}
          />
          <button
            type="button"
            className={styles.eyeBtn}
            onClick={() => setShowPwd((v) => !v)}
            aria-label={showPwd ? 'Hide password' : 'Show password'}
          >
            {showPwd ? <EyeOffIcon /> : <EyeIcon />}
          </button>
        </div>
        <div className={styles.errorSlot}>{errors.password && <span>{t(errors.password.message as string)}</span>}</div>
      </div>

      {/* Remember checkbox */}
      <label className={styles.checkLabel}>
        <span className={styles.checkWrap}>
          <input type="checkbox" className={styles.checkInput} {...register('remember')} />
          <span className={styles.checkBox} aria-hidden="true" />
        </span>
        <span>{t('login.remember')}</span>
      </label>

      {/* Submit button */}
      <button
        type="submit"
        disabled={submitState !== 'idle'}
        className={`${styles.submitBtn} ${submitState !== 'idle' ? styles.submitBtnDisabled : ''}`}
      >
        {submitState === 'submitting' && (
          <>
            <SpinIcon />
            <span>{t('login.submitting')}</span>
          </>
        )}
        {submitState === 'success' && (
          <>
            <CheckIcon className={styles.tickAnim} />
            <span>{t('login.success')}</span>
          </>
        )}
        {submitState === 'idle' && (
          <>
            <span>{t('login.submit')}</span>
            <ArrowRightIcon className={styles.arrowIcon} />
          </>
        )}
      </button>

      <p className={styles.footerHint}>{t('login.hint')}</p>

      <p className={styles.switchLink}>
        {t('login.no_account')}{' '}
        <Link to={routes.register} className={styles.switchAnchor}>{t('login.to_register')}</Link>
      </p>
    </form>
  );
}
