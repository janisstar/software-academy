import { useTranslation } from 'react-i18next'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { activeRole } from '../../types/api'
import { NavGlyph } from './MasterIcons'
import { entryTargetPath, isEntryActive, visibleNavItems } from './navConfig'
import styles from './TabBar.module.css'

/**
 * Нижние табы (мобильный, < 600px). Показывают только верхний уровень меню:
 * подменю на телефоне не раскрываются, тап по группе ведёт на её первый
 * доступный подпункт.
 */
export function TabBar() {
  const { t } = useTranslation()
  const { pathname } = useLocation()
  const { user } = useAuth()

  const role = user ? activeRole(user.privileges) : null
  const items = visibleNavItems(role)

  return (
    <nav className={styles.tabbar} aria-label={t('master.nav.tabsLabel')}>
      {items.map((entry) => {
        const isActive = isEntryActive(entry, pathname)

        return (
          <Link
            key={entry.labelKey}
            to={entryTargetPath(entry)}
            className={[styles.tab, isActive ? styles.active : '']
              .filter(Boolean)
              .join(' ')}
            // Подсветки цветом мало: сообщаем состояние и скринридеру.
            aria-current={isActive ? 'page' : undefined}
          >
            <NavGlyph name={entry.icon} size={22} />
            <span className={styles.label}>{t(entry.labelKey)}</span>
          </Link>
        )
      })}
    </nav>
  )
}
