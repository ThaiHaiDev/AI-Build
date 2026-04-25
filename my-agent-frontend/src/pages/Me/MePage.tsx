import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/features/auth/store/authStore';
import { meService } from '@/features/me/services/meService';
import { logger } from '@/lib/logger';
import styles from './MePage.module.scss';

const TEAMS = ['Engineering', 'Product', 'Design', 'Data', 'Operations'];

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
  const user = useAuthStore((s) => s.user);

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [form, setForm] = useState({ name: '', team: 'Engineering', manager: '' });

  useEffect(() => {
    if (user) {
      setForm({ name: user.name ?? '', team: 'Engineering', manager: '' });
    }
  }, [user]);

  if (!user) return null;

  const ini = avatarInitials(user.name || user.email);

  const joinedDate = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString(
        i18n.resolvedLanguage === 'vi' ? 'vi-VN' : 'en-US',
        { year: 'numeric', month: 'long', day: 'numeric' }
      )
    : '—';

  const handleSave = async () => {
    setSaving(true);
    try {
      await meService.updateProfile({ name: form.name, team: form.team, manager: form.manager });
      setEditing(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 1800);
    } catch (err) {
      logger.warn('Profile update failed', { err });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setForm({ name: user.name ?? '', team: 'Engineering', manager: '' });
    setEditing(false);
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
        {/* Dark banner */}
        <div className={styles.identityBanner}>
          <div className={styles.identityGridBg} />
          <div className={styles.identityBlob} />
        </div>

        {/* Avatar + info row */}
        <div className={styles.identityRow}>
          <div className={styles.avatar}>{ini}</div>
          <div className={styles.identityInfo}>
            <span className={styles.identityName}>{user.name}</span>
            <span className={styles.rolePill}>{user.role}</span>
            <span className={styles.identitySub}>
              {user.email}
            </span>
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
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              />
            ) : (
              <span className={styles.infoValue}>{form.name || '—'}</span>
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

          {/* Team — editable */}
          <div className={styles.infoField}>
            <span className={styles.infoLabel}>{t('team')}</span>
            {editing ? (
              <select
                className={styles.infoSelect}
                value={form.team}
                onChange={(e) => setForm((f) => ({ ...f, team: e.target.value }))}
              >
                {TEAMS.map((tm) => (
                  <option key={tm} value={tm}>{tm}</option>
                ))}
              </select>
            ) : (
              <span className={styles.infoValue}>{form.team}</span>
            )}
          </div>

          {/* Manager — editable */}
          <div className={styles.infoField}>
            <span className={styles.infoLabel}>{t('manager')}</span>
            {editing ? (
              <input
                className={styles.infoInput}
                value={form.manager}
                placeholder="—"
                onChange={(e) => setForm((f) => ({ ...f, manager: e.target.value }))}
              />
            ) : (
              <span className={styles.infoValue}>{form.manager || '—'}</span>
            )}
          </div>

          {/* Joined — read-only */}
          <div className={styles.infoField}>
            <span className={styles.infoLabel}>{t('joined')}</span>
            <span className={`${styles.infoValue} ${styles.mono}`}>{joinedDate}</span>
          </div>
        </div>

        {/* Edit actions footer */}
        {editing && (
          <div className={styles.editFooter}>
            <button type="button" className={styles.cancelBtn} onClick={handleCancel}>
              {t('cancel')}
            </button>
            <button
              type="button"
              className={styles.saveBtn}
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? '…' : t('save')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
