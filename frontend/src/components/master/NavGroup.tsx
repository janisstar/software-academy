import { useId, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation } from 'react-router-dom'
import { ChevronIcon, NavGlyph } from './MasterIcons'
import { NavItemLink } from './NavItemLink'
import type { NavGroup as NavGroupData } from './navConfig'
import styles from './SideNav.module.css'

interface NavGroupProps {
  group: NavGroupData
}

/** Раскрывающаяся группа бокового меню: заголовок-кнопка + список подпунктов. */
export function NavGroup({ group }: NavGroupProps) {
  const { t } = useTranslation()
  const { pathname } = useLocation()
  // useId даёт стабильный id для связки aria-controls ↔ id списка.
  const listId = useId()

  const hasActiveChild = group.children.some((child) => child.path === pathname)

  // По умолчанию все группы раскрыты.
  const [open, setOpen] = useState(true)

  // Переход внутрь группы должен её раскрыть. Правим состояние прямо во время
  // отрисовки (приём из документации React «Adjusting state when props change»),
  // а не в useEffect: эффект дал бы лишний проход отрисовки и мигание меню.
  // `seenPath` запоминает адрес, для которого состояние уже пересчитано, —
  // поэтому свернуть активную группу руками по-прежнему можно.
  const [seenPath, setSeenPath] = useState(pathname)
  if (seenPath !== pathname) {
    setSeenPath(pathname)
    if (hasActiveChild) {
      setOpen(true)
    }
  }

  const headerClassName = [
    styles.navItem,
    styles.groupHeader,
    hasActiveChild ? styles.activeParent : '',
  ]
    .filter(Boolean)
    .join(' ')

  const chevronClassName = [styles.chevron, open ? '' : styles.chevronCollapsed]
    .filter(Boolean)
    .join(' ')

  return (
    <li>
      <button
        type="button"
        className={headerClassName}
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => setOpen((previous) => !previous)}
      >
        <NavGlyph name={group.icon} className={styles.icon} />
        <span className={styles.label}>{t(group.labelKey)}</span>
        <ChevronIcon className={chevronClassName} />
      </button>

      <ul className={styles.subList} id={listId} hidden={!open}>
        {group.children.map((child) => (
          <NavItemLink key={child.path} item={child} nested />
        ))}
      </ul>
    </li>
  )
}
