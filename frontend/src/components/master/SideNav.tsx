import { useTranslation } from 'react-i18next'
import { Brand } from '../ui/Brand'
import { Button } from '../ui/Button'
import { useAuth } from '../../hooks/useAuth'
import { activeRole } from '../../types/api'
import { NavGroup } from './NavGroup'
import { NavItemLink } from './NavItemLink'
import { isGroup, ROLE_LABEL_KEYS, visibleNavItems } from './navConfig'
import styles from './SideNav.module.css'

/**
 * Боковое меню (десктоп). На ширине < 600px скрывается — там работает `TabBar`.
 * Состав пунктов приходит из `navConfig`, роль — из существующей `activeRole`.
 */
export function SideNav() {
  const { t } = useTranslation()
  const { user, logout } = useAuth()

  const role = user ? activeRole(user.privileges) : null
  const items = visibleNavItems(role)

  const displayName = user?.name || user?.un || t('master.unknownUser')
  const initial = displayName.charAt(0).toUpperCase()

  async function handleLogout() {
    await logout()
    // Полная перезагрузка страницы: гарантированно сбрасывает состояние
    // приложения после выхода.
    window.location.assign('/login')
  }

  return (
    <nav className={styles.sidenav} aria-label={t('master.nav.label')}>
      <Brand className={styles.brand} />

      <ul className={styles.list}>
        {items.map((entry) =>
          isGroup(entry) ? (
            <NavGroup key={entry.labelKey} group={entry} />
          ) : (
            <NavItemLink key={entry.path} item={entry} />
          ),
        )}
      </ul>

      {/* Распорка прижимает блок пользователя к низу меню. */}
      <div className={styles.spacer} />

      <div className={styles.user}>
        <span className={styles.avatar} aria-hidden="true">
          {initial}
        </span>
        <span className={styles.userText}>
          <span className={styles.userName}>{displayName}</span>
          {role ? (
            <small className={styles.userRole}>
              {t(ROLE_LABEL_KEYS[role])}
            </small>
          ) : null}
        </span>
      </div>

      <Button variant="ghost" fullWidth onClick={handleLogout}>
        {t('common.logOut')}
      </Button>
    </nav>
  )
}
