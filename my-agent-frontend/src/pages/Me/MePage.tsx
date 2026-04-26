import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/features/auth/store/authStore';
import { meService } from '@/features/me/services/meService';
import styles from './MePage.module.scss';

function avatarInitials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('');
}

export default function MePage() {
  const { t, i18n } = useTranslation('me');
  const user    = useAuthStore((s) => s.user);
  const setAuth = useAuthStore((s) => s.setAuth);
  const token   = useAuthStore((s) => s.token);

  const [editing, setEditing] = useState(false);
  const [saving,  setSaving]  = useState(false);
  const [saved,   setSaved]   = useState(false);
  const [nameVal, setNameVal] = useState('');

  const [pwForm,    setPwForm]    = useState({ current: '', next: '', confirm: '' });
  const [pwSaving,  setPwSaving]  = useState(false);
  const [pwError,   setPwError]   = useState('');
  const [pwSaved,   setPwSaved]   = useState(false);

  useEffect(() => {
    if (user) setNameVal(user.name ?? '');
  }, [user]);

  if (!user) return null;

  const ini       = avatarInitials(user.name || user.email);
  const joinedDate = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString(
        i18n.resolvedLanguage === 'vi' ? 'vi-VN' : 'en-US',
        { year: 'numeric', month: 'long', day: 'numeric' },
      )
    : '—';

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await meService.updateName(nameVal.trim());
      setAuth({ ...user, name: res.data.user.name }, token ?? '');
      setEditing(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 1800);
    } catch {
      // name update failed — keep editing open
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setNameVal(user.name ?? '');
    setEditing(false);
  };

  const handlePwChange = async () => {
    setPwError('');
    if (pwForm.next !== pwForm.confirm) {
      setPwError(t('error_password_mismatch'));
      return;
    }
    setPwSaving(true);
    try {
      await meService.changePassword(pwForm.current, pwForm.next);
      setPwForm({ current: '', next: '', confirm: '' });
      setPwSaved(true);
      setTimeout(() => setPwSaved(false), 1800);
    } catch (err: unknown) {
      const code = (err as { response?: { data?: { error?: { code?: string } } } })
        ?.response?.data?.error?.code;
      setPwError(code === 'VALIDATION' ? t('error_wrong_password') : t('error_generic'));
    } finally {
      setPwSaving(false);
    }
  };

  return (
    <div className={styles.page}>
      {/* Page header */}
      <div className={styles.pageHeader}>
        <div>
          <p className={styles.pageMeta}>
            <span className={styles.greenDot} />
            <span>{t('meta')}</span>
          </p>
          <h1 className={styles.pageTitle}>{t('title')}</h1>
          <p className={styles.pageSub}>{t('sub')}</p>
        </div>
        {saved && (
          <div className={styles.savedFlash}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M4 12l6 6L20 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {t('saved')}
          </div>
        )}
      </div>

      {/* Identity strip card */}
      <div className={styles.identityCard}>
        <div className={styles.identityRow}>
          <div className={styles.avatar}>{ini}</div>
          <div className={styles.identityInfo}>
            <span className={styles.identityName}>{user.name}</span>
            <span className={styles.rolePill}>{user.role}</span>
            <span className={styles.identitySub}>{user.email}</span>
          </div>
          {!editing && (
            <button type="button" className={styles.editBtn} onClick={() => setEditing(true)}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M4 20h4L20 8l-4-4L4 16v4z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
              </svg>
              {t('edit_btn')}
            </button>
          )}
        </div>
      </div>

      {/* Personal info card */}
      <div className={styles.infoCard}>
        <div className={styles.infoCardHead}>
          <span className={styles.infoCardTitle}>{t('personal')}</span>
          <span className={styles.infoCardSub}>{t('personal_sub')}</span>
        </div>

        <div className={styles.infoGrid}>
          {/* Name — editable */}
          <div className={styles.infoField}>
            <span className={styles.infoLabel}>{t('name')}</span>
            {editing ? (
              <input
                className={styles.infoInput}
                value={nameVal}
                onChange={(e) => setNameVal(e.target.value)}
              />
            ) : (
              <span className={styles.infoValue}>{nameVal || '—'}</span>
            )}
          </div>

          {/* Email — locked */}
          <div className={styles.infoField}>
            <span className={styles.infoLabelRow}>
              <span className={styles.infoLabel}>{t('email')}</span>
              <span className={styles.infoLocked}>{t('email_locked')}</span>
            </span>
            <span className={styles.infoValue}>{user.email}</span>
          </div>

          {/* Employee ID — read-only */}
          <div className={styles.infoField}>
            <span className={styles.infoLabel}>{t('employee_id')}</span>
            <span className={`${styles.infoValue} ${styles.mono}`}>EMP-{user.id.slice(0, 6).toUpperCase()}</span>
          </div>

          {/* Joined — read-only */}
          <div className={styles.infoField}>
            <span className={styles.infoLabel}>{t('joined')}</span>
            <span className={`${styles.infoValue} ${styles.mono}`}>{joinedDate}</span>
          </div>
        </div>

        {editing && (
          <div className={styles.editFooter}>
            <button type="button" className={styles.cancelBtn} onClick={handleCancel}>
              {t('cancel')}
            </button>
            <button
              type="button"
              className={styles.saveBtn}
              onClick={handleSave}
              disabled={saving || nameVal.trim() === ''}
            >
              {saving ? '…' : t('save')}
            </button>
          </div>
        )}
      </div>

      {/* Change password card */}
      <div className={styles.infoCard}>
        <div className={styles.infoCardHead}>
          <span className={styles.infoCardTitle}>{t('password_section')}</span>
          <span className={styles.infoCardSub}>{t('password_section_sub')}</span>
        </div>

        <div className={styles.infoGrid} style={{ gridTemplateColumns: '1fr' }}>
          <div className={styles.infoField}>
            <span className={styles.infoLabel}>{t('current_password')}</span>
            <input
              type="password"
              className={styles.infoInput}
              value={pwForm.current}
              onChange={(e) => setPwForm((f) => ({ ...f, current: e.target.value }))}
              autoComplete="current-password"
            />
          </div>
          <div className={styles.infoField}>
            <span className={styles.infoLabel}>{t('new_password')}</span>
            <input
              type="password"
              className={styles.infoInput}
              value={pwForm.next}
              onChange={(e) => setPwForm((f) => ({ ...f, next: e.target.value }))}
              autoComplete="new-password"
            />
          </div>
          <div className={styles.infoField}>
            <span className={styles.infoLabel}>{t('confirm_password')}</span>
            <input
              type="password"
              className={styles.infoInput}
              value={pwForm.confirm}
              onChange={(e) => setPwForm((f) => ({ ...f, confirm: e.target.value }))}
              autoComplete="new-password"
            />
          </div>
          {pwError && <p className="text-xs text-red-600">{pwError}</p>}
          {pwSaved && <p className="text-xs text-green-600">{t('password_saved')}</p>}
        </div>

        <div className={styles.editFooter}>
          <button
            type="button"
            className={styles.saveBtn}
            onClick={handlePwChange}
            disabled={pwSaving || !pwForm.current || !pwForm.next || !pwForm.confirm}
          >
            {pwSaving ? '…' : t('change_password_btn')}
          </button>
        </div>
      </div>
    </div>
  );
}
