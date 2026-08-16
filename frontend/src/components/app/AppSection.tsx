import type { PropsWithChildren, ReactNode } from 'react'
import styles from './AppSection.module.css'

type AppSectionProps = PropsWithChildren<{
  title: string
  /** Действие справа от заголовка — например ссылка «All lessons →». */
  action?: ReactNode
}>

/**
 * Секция страницы учебной области: заголовок, необязательное действие справа
 * и содержимое под ними.
 *
 * Отдельный компонент, чтобы у блоков дашборда не было нескольких копий
 * одной и той же шапки (та же роль, что у `master/DashboardCard`, только без
 * белой карточки: содержимое секции само решает, во что оно завёрнуто).
 */
export function AppSection({ title, action, children }: AppSectionProps) {
  return (
    <section>
      <div className={styles.head}>
        <h2>{title}</h2>
        {action}
      </div>
      {children}
    </section>
  )
}
