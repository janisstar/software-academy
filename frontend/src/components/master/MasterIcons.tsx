/**
 * Иконки навигации master-интерфейса — инлайновые SVG.
 *
 * Почему инлайн, а не библиотека иконок: `stroke="currentColor"` заставляет
 * иконку наследовать цвет пункта меню, поэтому активное и обычное состояние
 * работают без второго файла. Тот же приём — в `landing/LandingIcons.tsx`.
 *
 * Все иконки декоративные (рядом всегда есть подпись), поэтому `aria-hidden`
 * и `focusable="false"` — скринридер их пропускает.
 */

import type { NavIcon } from './navConfig'

interface IconProps {
  /** Размер в px (иконка всегда квадратная). */
  size?: number
  className?: string
}

/** Общие атрибуты всех иконок — чтобы не повторять в каждой. */
function iconProps({ size = 20, className }: IconProps) {
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
      <path d="M3 11.5 12 4l9 7.5" />
      <path d="M5.5 10v9h13v-9" />
    </svg>
  )
}

/** Стопка слоёв — группа Content. */
function ContentIcon(props: IconProps) {
  return (
    <svg {...iconProps(props)}>
      <path d="m12 3 8.5 4.5L12 12 3.5 7.5 12 3z" />
      <path d="m3.5 12 8.5 4.5 8.5-4.5" />
      <path d="m3.5 16.5 8.5 4.5 8.5-4.5" />
    </svg>
  )
}

/** Папка — Categories. */
function CategoriesIcon(props: IconProps) {
  return (
    <svg {...iconProps(props)}>
      <path d="M3.5 7.5a2 2 0 0 1 2-2h3.2l1.8 2.2h8a2 2 0 0 1 2 2v7.8a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2V7.5z" />
    </svg>
  )
}

/** Экран с плеем — Lessons. */
function LessonsIcon(props: IconProps) {
  return (
    <svg {...iconProps(props)}>
      <rect x="4" y="5" width="16" height="13" rx="2" />
      <path d="m10 9.5 4 2.5-4 2.5z" fill="currentColor" stroke="none" />
    </svg>
  )
}

/** Два человека — группа People и пункт Users. */
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

/** Здание — Companies. */
function CompaniesIcon(props: IconProps) {
  return (
    <svg {...iconProps(props)}>
      <path d="M4 20V6a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v14" />
      <path d="M14 10h4a2 2 0 0 1 2 2v8" />
      <path d="M3 20h18" />
      <path d="M7.5 8h3M7.5 12h3M7.5 16h3" />
    </svg>
  )
}

/** Столбики — Reports. */
function ReportsIcon(props: IconProps) {
  return (
    <svg {...iconProps(props)}>
      <path d="M5 19V9m7 10V5m7 14v-7" />
    </svg>
  )
}

/** Шестерёнка — Settings. */
function SettingsIcon(props: IconProps) {
  return (
    <svg {...iconProps(props)}>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 4v2m0 12v2M4 12h2m12 0h2M6.3 6.3l1.4 1.4m8.6 8.6 1.4 1.4m0-11.4-1.4 1.4M7.7 16.3l-1.4 1.4" />
    </svg>
  )
}

/** Шеврон вниз — индикатор раскрытой группы. */
export function ChevronIcon(props: IconProps) {
  return (
    <svg {...iconProps({ size: 16, ...props })}>
      <path d="m6 9.5 6 5.5 6-5.5" />
    </svg>
  )
}

/** Таблица «имя иконки из конфига → компонент». Наружу не выходит. */
const NAV_ICONS: Record<NavIcon, (props: IconProps) => React.ReactElement> = {
  dashboard: DashboardIcon,
  content: ContentIcon,
  categories: CategoriesIcon,
  lessons: LessonsIcon,
  people: PeopleIcon,
  users: PeopleIcon,
  companies: CompaniesIcon,
  reports: ReportsIcon,
  settings: SettingsIcon,
}

/**
 * Рисует иконку по её имени из `navConfig`. Благодаря этому в конфиге лежат
 * только строки, а компоненты меню не знают, какая иконка чему соответствует.
 */
export function NavGlyph({ name, ...rest }: IconProps & { name: NavIcon }) {
  const Icon = NAV_ICONS[name]
  return <Icon {...rest} />
}
