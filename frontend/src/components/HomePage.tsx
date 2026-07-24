import { useAuth } from '../hooks/useAuth'
import styles from './HomePage.module.css'

export function HomePage() {
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
            <h1>Home</h1>
            <p className={styles.subtitle}>
              Signed in as {user?.name ?? 'Unknown user'}
            </p>
          </div>
          <button
            className={styles.logout}
            type="button"
            onClick={handleLogout}
          >
            Выйти
          </button>
        </div>

        <div className={styles.grid}>
          <div className={styles.stat}>
            <span>Username</span>
            <strong>{user?.un}</strong>
          </div>
          <div className={styles.stat}>
            <span>Role</span>
            <strong>{privileges.join(', ') || 'none'}</strong>
          </div>
          <div className={styles.stat}>
            <span>Company ID</span>
            <strong>{user?.companyid}</strong>
          </div>
        </div>

        {user?.must_change_password ? (
          <div className={styles.banner}>You must change your password.</div>
        ) : null}

        {user?.pending_consents.length ? (
          <div className={styles.banner}>
            Pending consents: {user.pending_consents.join(', ')}
          </div>
        ) : null}
      </section>
    </div>
  )
}
