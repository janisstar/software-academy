/**
 * Единственное описание пунктов навигации учебной области `app`.
 *
 * Новый пункт = ОДНА запись в `APP_NAV_ITEMS`: `AppHeader` (десктоп) и
 * `AppTabBar` (мобильный) рисуются по этому массиву, их JSX при добавлении
 * пункта не трогаем. Тот же приём, что в `master/navConfig.ts`, но проще:
 * групп с подпунктами здесь нет — навигация плоская.
 */

import { APP_PATHS, PEOPLE_PATHS } from '../../constants/routes'
import type { RoleKey } from '../../types/api'

/** Имя иконки; сопоставление с компонентом — в `AppIcons.tsx`. */
export type AppNavIcon =
  'dashboard' | 'lessons' | 'reports' | 'people' | 'settings'

/**
 * Ключ i18n хранится ЦЕЛИКОМ (`'app.nav.lessons'`), а не по кусочкам —
 * тогда `t(item.labelKey)` проходит проверку ключей из `types/i18next.d.ts`.
 */
type AppNavLabelKey =
  | 'app.nav.dashboard'
  | 'app.nav.lessons'
  | 'app.nav.reports'
  | 'app.nav.people'
  | 'app.nav.settings'

export interface AppNavItem {
  labelKey: AppNavLabelKey
  path: string
  icon: AppNavIcon
  /** Если задано — пункт видят только эти роли. Не задано = видят все. */
  roles?: readonly RoleKey[]
}

/**
 * Роли, которые ведут людей своей компании (docs/06 §2). Роли master здесь
 * нет намеренно: master в учебную область не заходит, и решает это не конфиг,
 * а шлюз `AreaGate`.
 */
const PRIVILEGED_ROLES = ['admin', 'manager', 'site'] as const

export const APP_NAV_ITEMS: readonly AppNavItem[] = [
  {
    labelKey: 'app.nav.dashboard',
    path: APP_PATHS.dashboard,
    icon: 'dashboard',
  },
  {
    labelKey: 'app.nav.lessons',
    path: APP_PATHS.lessons,
    icon: 'lessons',
  },
  {
    labelKey: 'app.nav.reports',
    path: APP_PATHS.reports,
    icon: 'reports',
  },
  {
    labelKey: 'app.nav.people',
    // Ведёт на СУЩЕСТВУЮЩИЙ список пользователей раздела People —
    // второй такой страницы мы не заводим.
    path: PEOPLE_PATHS.users,
    icon: 'people',
    roles: PRIVILEGED_ROLES,
  },
  {
    labelKey: 'app.nav.settings',
    path: APP_PATHS.settings,
    icon: 'settings',
  },
]

/** Меню для конкретной роли: скрывает пункты, до которых её не допускают. */
export function visibleAppNavItems(role: RoleKey | null): AppNavItem[] {
  return APP_NAV_ITEMS.filter(
    (item) => !item.roles || (role !== null && item.roles.includes(role)),
  )
}

/**
 * Активен ли пункт при текущем адресе — сам путь или что-то вложенное в него.
 * Вложенное учитываем, чтобы на странице вида `/people/users/i.ivanov` пункт
 * «People» оставался подсвеченным (так же считает master `isEntryActive`).
 */
export function isAppNavItemActive(
  item: AppNavItem,
  pathname: string,
): boolean {
  return pathname === item.path || pathname.startsWith(`${item.path}/`)
}
