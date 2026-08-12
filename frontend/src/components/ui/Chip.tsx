import type { ReactNode } from 'react'
import styles from './Chip.module.css'

type ChipProps = {
  children: ReactNode
  /**
   * Класс вызывающего компонента, который перекрашивает пилюлю: он должен
   * задать переменные `--chip-bg` и `--chip-text` (см. master/RoleChip).
   * Через переменные, а не через прямые `background`/`color`, потому что
   * два класса из разных CSS-модулей на одном элементе имеют одинаковую
   * специфичность — кто победит, зависело бы от порядка сборки.
   */
  className?: string
}

/** Пилюля-ярлык: короткое значение вроде роли пользователя в строке таблицы. */
export function Chip({ children, className }: ChipProps) {
  return (
    <span className={[styles.chip, className].filter(Boolean).join(' ')}>
      {children}
    </span>
  )
}
