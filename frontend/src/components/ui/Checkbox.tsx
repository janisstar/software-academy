import type { ReactNode } from 'react'
import styles from './Checkbox.module.css'

type CheckboxProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  'type' | 'children'
> & {
  /** Подпись рядом с галкой. ReactNode — чтобы выделять часть жирным. */
  label: ReactNode
  /**
   * Приглушить строку. Отдельно от `disabled`, потому что смысл другой:
   * галка не сломана, а временно ни на что не влияет — и это должно быть
   * видно, а не только не нажиматься.
   */
  dimmed?: boolean
}

/**
 * Чекбокс с подписью. Кликается вся строка: сам квадратик — цель мелкая,
 * поэтому её растягивает <label>.
 */
export function Checkbox({
  label,
  dimmed = false,
  className,
  ...rest
}: CheckboxProps) {
  const classNames = [styles.row, dimmed ? styles.dimmed : '', className]
    .filter(Boolean)
    .join(' ')

  return (
    <label className={classNames}>
      <input className={styles.input} type="checkbox" {...rest} />
      <span className={styles.label}>{label}</span>
    </label>
  )
}
