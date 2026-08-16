import styles from './StatusBadge.module.css'

/**
 * Варианты состояния.
 *
 * Аккаунт человека: «работает», «первый вход не пройден», «доступ закрыт».
 * Прогресс по уроку: «пройден», «в работе», «не начат» — те же точка плюс
 * подпись, только цвета берутся из токенов `--color-status-*`.
 */
export type StatusVariant =
  'active' | 'pending' | 'locked' | 'completed' | 'inProgress' | 'notStarted'

type StatusBadgeProps = {
  variant: StatusVariant
  /** Текст статуса — УЖЕ переведённый вызывающим компонентом. */
  label: string
  /**
   * Красить в цвет статуса не только точку, но и подпись.
   *
   * Нужно там, где статус — главное, что человек ищет глазами: на карточке
   * учебного каталога. В плотных списках (недавние уроки на дашборде, таблицы
   * People) он остаётся спокойным серым, иначе строки пестрят.
   */
  strong?: boolean
}

/** Статус строкой: цветная точка и подпись рядом. */
export function StatusBadge({
  variant,
  label,
  strong = false,
}: StatusBadgeProps) {
  const classNames = [
    styles.status,
    styles[variant],
    strong ? styles.strong : '',
  ]
    .filter(Boolean)
    .join(' ')

  return <span className={classNames}>{label}</span>
}
