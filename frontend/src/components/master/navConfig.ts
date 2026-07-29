/**
 * Единственное описание структуры бокового меню и нижних табов master-интерфейса.
 *
 * Новый пункт меню = ОДНА запись в `NAV_ITEMS`. Компоненты `SideNav`, `NavGroup`
 * и `TabBar` рисуются по этому массиву — JSX при добавлении пункта не трогаем.
 */

import type { RoleKey } from '../../types/api'

/** Имя иконки; сопоставление с компонентом — в `MasterIcons.tsx`. */
export type NavIcon =
  | 'dashboard'
  | 'content'
  | 'categories'
  | 'lessons'
  | 'people'
  | 'users'
  | 'companies'
  | 'reports'
  | 'settings'

/**
 * Ключ i18n хранится ЦЕЛИКОМ (`'master.nav.lessons'`), а не по кусочкам —
 * тогда `t(entry.labelKey)` проходит проверку ключей из `types/i18next.d.ts`.
 */
type NavLabelKey =
  | 'master.nav.dashboard'
  | 'master.nav.content'
  | 'master.nav.categories'
  | 'master.nav.lessons'
  | 'master.nav.people'
  | 'master.nav.users'
  | 'master.nav.companies'
  | 'master.nav.reports'
  | 'master.nav.settings'

/** Пункт-ссылка: ведёт на конкретный роут. */
export interface NavLeaf {
  labelKey: NavLabelKey
  path: string
  icon: NavIcon
  /** Если задано — пункт видят только эти роли. Не задано = видят все. */
  roles?: readonly RoleKey[]
}

/** Группа: собственного роута нет, только раскрывающийся список подпунктов. */
export interface NavGroup {
  labelKey: NavLabelKey
  icon: NavIcon
  children: readonly NavLeaf[]
}

export type NavEntry = NavLeaf | NavGroup

/** Привилегированные роли (docs/06 §2 + docs/07): им доступен раздел Users. */
const PRIVILEGED_ROLES = ['master', 'admin', 'manager', 'site'] as const

export const NAV_ITEMS: readonly NavEntry[] = [
  {
    labelKey: 'master.nav.dashboard',
    path: '/home',
    icon: 'dashboard',
  },
  {
    labelKey: 'master.nav.content',
    icon: 'content',
    children: [
      {
        labelKey: 'master.nav.categories',
        path: '/content/categories',
        icon: 'categories',
      },
      {
        labelKey: 'master.nav.lessons',
        path: '/content/lessons',
        icon: 'lessons',
      },
    ],
  },
  {
    labelKey: 'master.nav.people',
    icon: 'people',
    children: [
      {
        labelKey: 'master.nav.users',
        path: '/people/users',
        icon: 'users',
        roles: PRIVILEGED_ROLES,
      },
      {
        labelKey: 'master.nav.companies',
        path: '/people/companies',
        icon: 'companies',
        // master — singleton-роль вендора, компании ведёт только он (docs/06 §3).
        roles: ['master'],
      },
    ],
  },
  {
    labelKey: 'master.nav.reports',
    path: '/reports',
    icon: 'reports',
  },
  {
    labelKey: 'master.nav.settings',
    path: '/settings',
    icon: 'settings',
  },
]

/**
 * Ключи i18n для названий ролей. Явная таблица, а не сборка ключа строкой:
 * так проверка ключей из `types/i18next.d.ts` ловит забытый перевод.
 */
export const ROLE_LABEL_KEYS = {
  master: 'master.roles.master',
  admin: 'master.roles.admin',
  manager: 'master.roles.manager',
  site: 'master.roles.site',
  inspector: 'master.roles.inspector',
  user: 'master.roles.user',
  fitter: 'master.roles.fitter',
} as const satisfies Record<RoleKey, string>

/** Отличает группу от обычного пункта. */
export function isGroup(entry: NavEntry): entry is NavGroup {
  return 'children' in entry
}

function isAllowed(leaf: NavLeaf, role: RoleKey | null): boolean {
  if (!leaf.roles) {
    return true
  }
  return role !== null && leaf.roles.includes(role)
}

/**
 * Меню для конкретной роли: скрывает недоступные подпункты и выбрасывает
 * группы, у которых после фильтрации не осталось ни одного подпункта.
 */
export function visibleNavItems(role: RoleKey | null): NavEntry[] {
  const items: NavEntry[] = []

  for (const entry of NAV_ITEMS) {
    if (!isGroup(entry)) {
      if (isAllowed(entry, role)) {
        items.push(entry)
      }
      continue
    }

    const children = entry.children.filter((child) => isAllowed(child, role))
    if (children.length > 0) {
      items.push({ ...entry, children })
    }
  }

  return items
}

/**
 * Куда ведёт пункт верхнего уровня: у группы своего роута нет, поэтому
 * ведём на первый доступный подпункт (нужно для нижних табов на мобильном).
 */
export function entryTargetPath(entry: NavEntry): string {
  return isGroup(entry) ? entry.children[0].path : entry.path
}

/** Активен ли пункт верхнего уровня при текущем адресе. */
export function isEntryActive(entry: NavEntry, pathname: string): boolean {
  return isGroup(entry)
    ? entry.children.some((child) => child.path === pathname)
    : entry.path === pathname
}
