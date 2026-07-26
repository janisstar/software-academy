/**
 * Иконки лендинга — инлайновые SVG.
 *
 * Почему инлайн, а не картинки: иконка наследует цвет текста через
 * `stroke="currentColor"`, поэтому одна и та же иконка работает и на
 * светлой карточке, и на залитой тёмной — без второго файла.
 *
 * Все иконки декоративные (рядом всегда есть текст), поэтому
 * `aria-hidden` и `focusable="false"` — скринридер их пропускает.
 */

interface IconProps {
  /** Размер в px (иконка всегда квадратная). */
  size?: number
  className?: string
}

/** Общие атрибуты всех иконок — чтобы не повторять в каждой. */
function iconProps({ size = 24, className }: IconProps) {
  return {
    className,
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.6,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true,
    focusable: 'false' as const,
  }
}

/** Плей в круге — короткое видео. */
export function PlayIcon(props: IconProps) {
  return (
    <svg {...iconProps(props)}>
      <circle cx="12" cy="12" r="9" />
      <path d="M10 8.5l5.5 3.5L10 15.5V8.5z" />
    </svg>
  )
}

/** Два человека — роли в команде. */
export function UsersIcon(props: IconProps) {
  return (
    <svg {...iconProps(props)}>
      <circle cx="9" cy="8" r="3.2" />
      <path d="M3.5 19.5c0-3 2.5-4.8 5.5-4.8s5.5 1.8 5.5 4.8" />
      <path d="M16 5.4a3.2 3.2 0 010 5.6" />
      <path d="M17.5 14.9c1.8.5 3 1.9 3 4.6" />
    </svg>
  )
}

/** Столбики — личный прогресс. */
export function ChartIcon(props: IconProps) {
  return (
    <svg {...iconProps(props)}>
      <path d="M4 20h16" />
      <path d="M7.5 20v-6" />
      <path d="M12 20V7" />
      <path d="M16.5 20v-9" />
    </svg>
  )
}

/** Искры сварки — категория Welding. */
export function WeldingIcon(props: IconProps) {
  return (
    <svg {...iconProps(props)}>
      <path d="M13.5 3l-6 9h4l-1.5 9 6-9h-4L13.5 3z" />
      <path d="M4 6.5L2.5 5M4 16.5L2.5 18M20.5 7.5L22 6M20.5 15.5L22 17" />
    </svg>
  )
}

/** Лупа с галочкой — категория Inspection. */
export function InspectionIcon(props: IconProps) {
  return (
    <svg {...iconProps(props)}>
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="M8 10.6l2 2 3.2-3.6" />
      <path d="M15.5 15.5L21 21" />
    </svg>
  )
}

/** Гаечный ключ — категория Installation. */
export function InstallationIcon(props: IconProps) {
  return (
    <svg {...iconProps(props)}>
      <path d="M14.5 3.5a4.5 4.5 0 00-5.9 5.9L3.9 14.1a2 2 0 000 2.8l3.2 3.2a2 2 0 002.8 0l4.7-4.7a4.5 4.5 0 005.9-5.9l-2.6 2.6-2.9-2.9 2.6-2.6z" />
    </svg>
  )
}

/** Планшет со сводкой — категория Management & analytics. */
export function ManagementIcon(props: IconProps) {
  return (
    <svg {...iconProps(props)}>
      <rect x="4" y="3" width="16" height="18" rx="2.5" />
      <path d="M8 8h8" />
      <path d="M8 12h8" />
      <path d="M8 16h4" />
    </svg>
  )
}
