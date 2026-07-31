import { useTranslation } from 'react-i18next'
import { Brand } from '../ui/Brand'
import { Button } from '../ui/Button'
import { useAuth } from '../../hooks/useAuth'
import { useLogout } from '../../hooks/useLogout'
import { activeRole } from '../../types/api'
import { NavGroup } from './NavGroup'
import { NavItemLink } from './NavItemLink'
import { UserIdentity } from './UserIdentity'
import { isGroup, visibleNavItems } from './navConfig'
import styles from './SideNav.module.css'

/**
 * Боковое меню (десктоп). На ширине < 600px скрывается — там работает `TabBar`.
 * Состав пунктов приходит из `navConfig`, роль — из существующей `activeRole`.
 */
export function SideNav() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const handleLogout = useLogout()

  const role = user ? activeRole(user.privileges) : null
  const items = visibleNavItems(role)

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

      <UserIdentity className={styles.user} />

      <Button variant="ghost" fullWidth onClick={handleLogout}>
        {t('common.logOut')}
      </Button>
    </nav>
  )
}
