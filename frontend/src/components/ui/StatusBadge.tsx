import styles from './StatusBadge.module.css'

/** Варианты состояния: «работает», «ещё не начал», «доступ закрыт». */
export type StatusVariant = 'active' | 'pending' | 'locked'

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
