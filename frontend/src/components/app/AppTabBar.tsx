import { useTranslation } from 'react-i18next'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { activeRole } from '../../types/api'
import { AppNavGlyph } from './AppIcons'
import { isAppNavItemActive, visibleAppNavItems } from './appNavConfig'
import styles from './AppTabBar.module.css'

/**
 * Нижние табы учебной области (мобильный, < 600px). Состав пунктов тот же,
 * что в шапке, — оба рисуются по `appNavConfig`.
 */
export function AppTabBar() {
  const { t } = useTranslation()
  const { pathname } = useLocation()
  const { user } = useAuth()

  const role = user ? activeRole(user.privileges) : null
  const items = visibleAppNavItems(role)

  return (
    <nav className={styles.tabbar} aria-label={t('app.nav.tabsLabel')}>
      {items.map((item) => {
        const isActive = isAppNavItemActive(item, pathname)

        return (
          <Link
            key={item.path}
            to={item.path}
            className={[styles.tab, isActive ? styles.active : '']
              .filter(Boolean)
              .join(' ')}
            // Подсветки цветом мало: сообщаем состояние и скринридеру.
            aria-current={isActive ? 'page' : undefined}
          >
            <AppNavGlyph name={item.icon} size={22} />
            <span className={styles.label}>{t(item.labelKey)}</span>
          </Link>
        )
      })}
    </nav>
  )
}
