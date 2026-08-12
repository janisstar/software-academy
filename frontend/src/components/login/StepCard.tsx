import type { PropsWithChildren } from 'react'
import styles from './StepCard.module.css'

interface StepCardProps extends PropsWithChildren {
  /** Капсовая подпись над заголовком: «Первый вход · шаг 1 из 2». */
  eyebrow: string
  title: string
  subtitle?: string
  /** Сколько шагов всего. Меньше двух — полоску прогресса не рисуем. */
  total?: number
  /** Номер текущего шага, считая с 1. */
  current?: number
}

/** Класс сегмента полоски: пройденный, текущий или ещё предстоящий. */
function dotClassName(index: number, current: number): string {
  if (index < current - 1) {
    return `${styles.dot} ${styles.done}`
  }

  if (index === current - 1) {
    return `${styles.dot} ${styles.current}`
  }

  return styles.dot
}

/**
 * Карточка одного шага первого входа (макет docs/mockups/auth-flow-mockup.html,
 * `.step-card`): полоска прогресса, подпись, заголовок, пояснение и содержимое
 * шага — форма или список согласий.
 */
export function StepCard({
  eyebrow,
  title,
  subtitle,
  total,
  current,
  children,
}: StepCardProps) {
  // Один шаг — полоска не несёт информации, только шумит.
  const showProgress = total !== undefined && current !== undefined && total > 1

  return (
    <div className={styles.card}>
      {showProgress ? (
        <div className={styles.dots} aria-hidden="true">
          {Array.from({ length: total }, (_, index) => (
            <span key={index} className={dotClassName(index, current)} />
          ))}
        </div>
      ) : null}

      <p className={styles.eyebrow}>{eyebrow}</p>
      <h1 className={styles.title}>{title}</h1>
      {subtitle ? <p className={styles.subtitle}>{subtitle}</p> : null}

      {children}
    </div>
  )
}
