/**
 * Иконки навигации учебной области — инлайновые SVG по мокапу
 * `docs/mockups/app-shell-dashboard-mockup.html` (экран 4, нижние табы).
 *
 * Почему инлайн, а не библиотека иконок: `stroke="currentColor"` заставляет
 * иконку наследовать цвет таба, поэтому активное и обычное состояние работают
 * без второго файла. Тот же приём — в `master/MasterIcons.tsx` и
 * `landing/LandingIcons.tsx`: у каждой области интерфейса свой набор,
 * нарисованный по её мокапу.
 *
 * Все иконки декоративные (рядом всегда есть подпись), поэтому `aria-hidden`
 * и `focusable="false"` — скринридер их пропускает.
 */

import type { AppNavIcon } from './appNavConfig'

interface IconProps {
  /** Размер в px (иконка всегда квадратная). */
  size?: number
  className?: string
}

/** Общие атрибуты всех иконок — чтобы не повторять в каждой. */
function iconProps({ size = 22, className }: IconProps) {
  return {
    className,
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true,
    focusable: 'false' as const,
  }
}

/** Домик — Dashboard. */
function DashboardIcon(props: IconProps) {
  return (
    <svg {...iconProps(props)}>
      <path d="M4 11l8-7 8 7v9a1 1 0 0 1-1 1h-5v-6h-4v6H5a1 1 0 0 1-1-1z" />
    </svg>
  )
}

/** Экран с плеем — Lessons. */
function LessonsIcon(props: IconProps) {
  return (
    <svg {...iconProps(props)}>
      <rect x="4" y="5" width="16" height="14" rx="2" />
      <path d="M10 9.5v5l4.5-2.5z" />
    </svg>
  )
}

/** Столбики — Reports. */
function ReportsIcon(props: IconProps) {
  return (
    <svg {...iconProps(props)}>
      <path d="M5 20V10M12 20V4M19 20v-7" />
    </svg>
  )
}

/** Два человека — People. */
function PeopleIcon(props: IconProps) {
  return (
    <svg {...iconProps(props)}>
      <circle cx="9" cy="8.5" r="3" />
      <path d="M3.5 19c.7-3 2.9-4.5 5.5-4.5S13.8 16 14.5 19" />
      <circle cx="16.5" cy="9.5" r="2.4" />
      <path d="M15.5 14.7c2.4.2 4.3 1.6 5 4.3" />
    </svg>
  )
}

/** Шестерёнка — Settings. */
function SettingsIcon(props: IconProps) {
  return (
    <svg {...iconProps(props)}>
      <circle cx="12" cy="12" r="3.2" />
      <path d="M12 4.5v2M12 17.5v2M4.5 12h2M17.5 12h2M6.7 6.7l1.4 1.4M15.9 15.9l1.4 1.4M17.3 6.7l-1.4 1.4M8.1 15.9l-1.4 1.4" />
    </svg>
  )
}

/** Таблица «имя иконки из конфига → компонент». Наружу не выходит. */
const APP_NAV_ICONS: Record<
  AppNavIcon,
  (props: IconProps) => React.ReactElement
> = {
  dashboard: DashboardIcon,
  lessons: LessonsIcon,
  reports: ReportsIcon,
  people: PeopleIcon,
  settings: SettingsIcon,
}

/**
 * Рисует иконку по её имени из `appNavConfig`. Благодаря этому в конфиге лежат
 * только строки, а табы не знают, какая иконка чему соответствует.
 */
export function AppNavGlyph({
  name,
  ...rest
}: IconProps & { name: AppNavIcon }) {
  const Icon = APP_NAV_ICONS[name]
  return <Icon {...rest} />
}
