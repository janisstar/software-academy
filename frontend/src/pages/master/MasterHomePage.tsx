import { useTranslation } from 'react-i18next'
import { useAuth } from '../../hooks/useAuth'
import styles from './MasterHomePage.module.css'

export function MasterHomePage() {
  const { t } = useTranslation()
  const { user, logout } = useAuth()

  const privileges = Object.entries(user?.privileges ?? {})
    .filter(([, value]) => value === 1)
    .map(([key]) => key)

  async function handleLogout() {
    await logout()
    window.location.assign('/login')
  }

  return (
    <div className={styles.page}>
      <section className={styles.card}>
        <div className={styles.header}>
          <div>
            <h1>{t('master.heading')}</h1>
            <p className={styles.subtitle}>
              {t('master.signedInAs', {
                name: user?.name ?? t('master.unknownUser'),
              })}
            </p>
          </div>
          <button
            className={styles.logout}
            type="button"
            onClick={handleLogout}
          >
            {t('common.logOut')}
          </button>
        </div>

        <div className={styles.grid}>
          <div className={styles.stat}>
            <span>{t('master.username')}</span>
            <strong>{user?.un}</strong>
          </div>
          <div className={styles.stat}>
            <span>{t('master.role')}</span>
            <strong>{privileges.join(', ') || t('master.roleNone')}</strong>
          </div>
          <div className={styles.stat}>
            <span>{t('master.companyId')}</span>
            <strong>{user?.companyid}</strong>
          </div>
        </div>

        {user?.must_change_password ? (
          <div className={styles.banner}>{t('master.mustChangePassword')}</div>
        ) : null}

        {user?.pending_consents.length ? (
          <div className={styles.banner}>
            {t('master.pendingConsents', {
              list: user.pending_consents.join(', '),
            })}
          </div>
        ) : null}
      </section>
    </div>
  )
}
