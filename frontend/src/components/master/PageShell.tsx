import type { PropsWithChildren, ReactNode } from 'react'
import styles from './PageShell.module.css'

type PageShellProps = PropsWithChildren<{
  /** Капсовый надзаголовок над h1. */
  eyebrow?: string
  title: string
  /** Главное действие раздела — встаёт справа от заголовка (например «+ Add user»). */
  actions?: ReactNode
}>

/** Общая шапка страницы раздела: надзаголовок + h1 + содержимое. */
export function PageShell({
  eyebrow,
  title,
  actions,
  children,
}: PageShellProps) {
  return (
    <>
      <div className={styles.head}>
        <div>
          {eyebrow ? <p className={styles.eyebrow}>{eyebrow}</p> : null}
          <h1 className={styles.title}>{title}</h1>
        </div>
        {actions ? <div className={styles.actions}>{actions}</div> : null}
      </div>
      <div className={styles.content}>{children}</div>
    </>
  )
}
