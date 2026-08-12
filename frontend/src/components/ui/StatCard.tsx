import type { ReactNode } from 'react'
import { Card } from './Card'
import styles from './StatCard.module.css'

type StatCardProps = {
  /**
   * ReactNode, а не строка: в акцентную карточку рядом с подписью
   * встраивается индикатор (пульсирующая точка «в сети сейчас»).
   */
  label: ReactNode
  value: ReactNode
  /**
   * Уточнение под числом. Тоже ReactNode — чтобы часть текста можно было
   * подсветить, например «3 locked» опасным цветом.
   */
  sub?: ReactNode
  /** Тёмно-бирюзовая заливка: выделяет одну карточку в ряду. */
  accent?: boolean
}

/** Карточка-счётчик: подпись, крупное число и необязательное уточнение. */
export function StatCard({ label, value, sub, accent = false }: StatCardProps) {
  return (
    <Card className={accent ? styles.accent : undefined}>
      <p className={styles.label}>{label}</p>
      <p className={styles.value}>{value}</p>
      {sub ? <p className={styles.sub}>{sub}</p> : null}
    </Card>
  )
}
