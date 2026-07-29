import { useTranslation } from 'react-i18next'
import { NavLink } from 'react-router-dom'
import { NavGlyph } from './MasterIcons'
import type { NavLeaf } from './navConfig'
import styles from './SideNav.module.css'

interface NavItemLinkProps {
  item: NavLeaf
  /** Подпункт группы: сдвинут вправо и не показывает собственную иконку крупно. */
  nested?: boolean
}

/**
 * Пункт-ссылка бокового меню. Один компонент и для верхнего уровня, и для
 * подпунктов внутри группы — чтобы состояния (hover / focus / active) не
 * расползались по двум копиям.
 */
export function NavItemLink({ item, nested = false }: NavItemLinkProps) {
  const { t } = useTranslation()

  return (
    <li>
      <NavLink
        to={item.path}
        // NavLink сам подставляет isActive по текущему адресу.
        className={({ isActive }) =>
          [
            styles.navItem,
            nested ? styles.subItem : '',
            isActive ? styles.active : '',
          ]
            .filter(Boolean)
            .join(' ')
        }
      >
        <NavGlyph name={item.icon} className={styles.icon} />
        <span className={styles.label}>{t(item.labelKey)}</span>
      </NavLink>
    </li>
  )
}
