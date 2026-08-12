import type { ReactNode } from 'react'
import styles from './Chip.module.css'

type ChipProps = {
  children: ReactNode
}

/** Пилюля-ярлык: короткое значение вроде ключа роли в строке таблицы. */
export function Chip({ children }: ChipProps) {
  return <span className={styles.chip}>{children}</span>
}
