import { useTranslation } from 'react-i18next'
import { Link, useLocation } from 'react-router-dom'
import { Brand } from '../ui/Brand'
import { useAuth } from '../../hooks/useAuth'
import { activeRole } from '../../types/api'
import { AppUserBlock } from './AppUserBlock'
import { isAppNavItemActive, visibleAppNavItems } from './appNavConfig'
import styles from './AppHeader.module.css'

/**
 * Верхняя шапка учебной области (десктоп): знак продукта, горизонтальные
 * ссылки разделов и блок пользователя.
 *
 * Ниже 600px горизонтальные ссылки прячет CSS — там работает `AppTabBar`.
 * Решает это CSS, а не JS: так нет мигания при первой отрисовке и не нужен
 * слушатель resize (тот же приём, что у master SideNav / TabBar).
 */
export function AppHeader() {
  const { t } = useTranslation()
  const { pathname } = useLocation()
  const { user } = useAuth()

  const role = user ? activeRole(user.privileges) : null
  const items = visibleAppNavItems(role)

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Brand className={styles.brand} />

        <nav className={styles.nav} aria-label={t('app.nav.label')}>
          {items.map((item) => {
            const isActive = isAppNavItemActive(item, pathname)

            return (
              <Link
                key={item.path}
                to={item.path}
                className={[styles.link, isActive ? styles.active : '']
                  .filter(Boolean)
                  .join(' ')}
                // Подсветки цветом мало: сообщаем состояние и скринридеру.
                aria-current={isActive ? 'page' : undefined}
              >
                {t(item.labelKey)}
              </Link>
            )
          })}
        </nav>

        <AppUserBlock />
      </div>
    </header>
  )
}
