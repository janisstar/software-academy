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
}

/** Статус строкой: цветная точка и подпись рядом. */
export function StatusBadge({ variant, label }: StatusBadgeProps) {
  return (
    <span className={[styles.status, styles[variant]].join(' ')}>{label}</span>
  )
}
