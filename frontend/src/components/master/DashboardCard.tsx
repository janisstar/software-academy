import type { PropsWithChildren, ReactNode } from 'react'
import { Card } from '../ui/Card'
import styles from './DashboardCard.module.css'

type DashboardCardProps = PropsWithChildren<{
  title: string
  /** Приписка справа в шапке: «156 completions total», «last 5». */
  meta?: ReactNode
}>

/**
 * Карточка дашборда: шапка «заголовок + приписка» и содержимое под ней.
 *
 * Отдельный компонент, чтобы у PopularLessons, RecentUsers и RecentCompanies
 * не было трёх одинаковых копий этой шапки.
 */
export function DashboardCard({ title, meta, children }: DashboardCardProps) {
  return (
    <Card>
      <div className={styles.head}>
        <h2 className={styles.title}>{title}</h2>
        {meta ? <span className={styles.meta}>{meta}</span> : null}
      </div>
      {children}
    </Card>
  )
}
