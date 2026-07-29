import type { PropsWithChildren } from 'react'
import styles from './PageShell.module.css'

type PageShellProps = PropsWithChildren<{
  /** Капсовый надзаголовок над h1. */
  eyebrow?: string
  title: string
}>

/** Общая шапка страницы раздела: надзаголовок + h1 + содержимое. */
export function PageShell({ eyebrow, title, children }: PageShellProps) {
  return (
    <>
      {eyebrow ? <p className={styles.eyebrow}>{eyebrow}</p> : null}
      <h1 className={styles.title}>{title}</h1>
      {children}
    </>
  )
}
