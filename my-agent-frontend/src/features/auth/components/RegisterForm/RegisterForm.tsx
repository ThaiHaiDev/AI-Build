import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/features/auth/store/authStore';
import { authService } from '@/features/auth/services/authService';
import { parseAuthError } from '@/features/auth/utils/parseAuthError';
import { useZodForm } from '@/shared/hooks/useForm';
import { registerSchema, passwordStrength, type RegisterInput } from '@/shared/schemas/auth.schema';
import { routes } from '@/router/routes';
import { logger } from '@/lib/logger';
import {
  UserIcon, TeamIcon, MailIcon, LockIcon,
  EyeIcon, EyeOffIcon, ArrowRightIcon, SpinIcon, AlertCircleIcon,
} from '../icons';
import styles from './RegisterForm.module.scss';

const TEAMS = ['Engineering', 'Product', 'Design', 'Data', 'Operations'] as const;

export function RegisterForm() {
  const { t } = useTranslation('auth');
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [bannerError, setBannerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useZodForm<RegisterInput>(registerSchema, {
    defaultValues: { name: '', team: 'Engineering' as const, email: '', password: '', passwordConfirm: '' },
  });

  const pwd = watch('password');
  const strength = pwd ? passwordStrength(pwd) : null;

  const strengthSegments = strength === 'weak' ? 1 : strength === 'medium' ? 2 : strength === 'strong' ? 4 : 0;
  const strengthColor = strength === 'weak' ? 'var(--danger)' : strength === 'medium' ? 'var(--warn)' : 'var(--accent)';

  const onSubmit = async (data: RegisterInput) => {
    setBannerError(null);
    setSubmitting(true);
    try {
      const res = await authService.register({ email: data.email, name: data.name, password: data.password });
      setAuth(res.data.user, res.data.accessToken);
      navigate(routes.me, { replace: true });
    } catch (err) {
      logger.warn('Register failed', { err });
      setBannerError(parseAuthError(err));
      setSubmitting(false);
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit(onSubmit)} noValidate>
      {bannerError && (
        <div className={styles.banner} role="alert">
          <AlertCircleIcon className={styles.bannerIcon} />
          <span>{bannerError}</span>
        </div>
      )}

      {/* Name + Team — side by side */}
      <div className={styles.row2}>
        <div className={styles.fieldGroup}>
          <label htmlFor="reg-name" className={styles.label}>{t('register.name')}</label>
          <div className={`${styles.inputWrap} ${errors.name ? styles.inputInvalid : ''}`}>
            <UserIcon className={styles.inputIcon} />
            <input
              id="reg-name"
              type="text"
              autoComplete="name"
              placeholder={t('register.name_ph')}
              aria-invalid={!!errors.name}
              className={styles.input}
              {...register('name')}
            />
          </div>
          <div className={styles.errorSlot}>{errors.name && <span>{t(errors.name.message as string)}</span>}</div>
        </div>

        <div className={styles.fieldGroup}>
          <label htmlFor="reg-team" className={styles.label}>{t('register.team')}</label>
          <div className={`${styles.inputWrap} ${errors.team ? styles.inputInvalid : ''}`}>
            <TeamIcon className={styles.inputIcon} />
            <select id="reg-team" className={styles.select} {...register('team')}>
              {TEAMS.map((team) => (
                <option key={team} value={team}>{team}</option>
              ))}
            </select>
          </div>
          <div className={styles.errorSlot} />
        </div>
      </div>

      {/* Email */}
      <div className={styles.fieldGroup}>
        <label htmlFor="reg-email" className={styles.label}>{t('register.email')}</label>
        <div className={`${styles.inputWrap} ${errors.email ? styles.inputInvalid : ''}`}>
          <MailIcon className={styles.inputIcon} />
          <input
            id="reg-email"
            type="email"
            autoComplete="email"
            placeholder={t('register.email_ph')}
            aria-invalid={!!errors.email}
            className={styles.input}
            {...register('email')}
          />
        </div>
        <div className={styles.errorSlot}>{errors.email && <span>{t(errors.email.message as string)}</span>}</div>
      </div>

      {/* Password */}
      <div className={styles.fieldGroup}>
        <label htmlFor="reg-pwd" className={styles.label}>{t('register.password')}</label>
        <div className={`${styles.inputWrap} ${errors.password ? styles.inputInvalid : ''}`}>
          <LockIcon className={styles.inputIcon} />
          <input
            id="reg-pwd"
            type={showPwd ? 'text' : 'password'}
            autoComplete="new-password"
            placeholder={t('register.password_new_ph')}
            aria-invalid={!!errors.password}
            className={styles.input}
            {...register('password')}
          />
          <button type="button" className={styles.eyeBtn} onClick={() => setShowPwd((v) => !v)}>
            {showPwd ? <EyeOffIcon /> : <EyeIcon />}
          </button>
        </div>
        {/* Strength meter */}
        {pwd && (
          <div className={styles.strengthMeter}>
            <div className={styles.strengthBars}>
              {[1, 2, 3, 4].map((i) => (
                <span
                  key={i}
                  className={styles.strengthSeg}
                  style={{ background: i <= strengthSegments ? strengthColor : 'var(--line)' }}
                />
              ))}
            </div>
            {strength && (
              <span className={styles.strengthLabel} style={{ color: strengthColor, fontFamily: "'JetBrains Mono', monospace" }}>
                {t(`register.strength.${strength}`)}
              </span>
            )}
          </div>
        )}
        <div className={styles.errorSlot}>{errors.password && <span>{t(errors.password.message as string)}</span>}</div>
      </div>

      {/* Confirm password */}
      <div className={styles.fieldGroup}>
        <label htmlFor="reg-pwd2" className={styles.label}>{t('register.password_confirm')}</label>
        <div className={`${styles.inputWrap} ${errors.passwordConfirm ? styles.inputInvalid : ''}`}>
          <LockIcon className={styles.inputIcon} />
          <input
            id="reg-pwd2"
            type={showConfirm ? 'text' : 'password'}
            autoComplete="new-password"
            placeholder={t('register.password_confirm')}
            aria-invalid={!!errors.passwordConfirm}
            className={styles.input}
            {...register('passwordConfirm')}
          />
          <button type="button" className={styles.eyeBtn} onClick={() => setShowConfirm((v) => !v)}>
            {showConfirm ? <EyeOffIcon /> : <EyeIcon />}
          </button>
        </div>
        <div className={styles.errorSlot}>{errors.passwordConfirm && <span>{t(errors.passwordConfirm.message as string)}</span>}</div>
      </div>

      <button
        type="submit"
        disabled={submitting}
        className={`${styles.submitBtn} ${submitting ? styles.submitBtnDisabled : ''}`}
      >
        {submitting ? (
          <>
            <SpinIcon />
            <span>{t('register.submitting')}</span>
          </>
        ) : (
          <>
            <span>{t('register.submit')}</span>
            <ArrowRightIcon className={styles.arrowIcon} />
          </>
        )}
      </button>

      <p className={styles.footerHint}>{t('register.tos')}</p>

      <p className={styles.switchLink}>
        {t('register.has_account')}{' '}
        <Link to={routes.login} className={styles.switchAnchor}>{t('register.to_login')}</Link>
      </p>
    </form>
  );
}
