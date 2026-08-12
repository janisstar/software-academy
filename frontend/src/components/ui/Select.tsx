import { useId } from 'react'
import styles from './Select.module.css'

type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
  /**
   * Видимый ярлык над списком. Если его нет — имя для скринридера нужно
   * передать через `aria-label` (так сделан фильтр компаний в списке).
   */
  label?: string
  /** Пояснение под списком: зачем это поле и на что влияет. */
  hint?: string
  /** Растянуть на всю ширину контейнера — для форм. */
  fullWidth?: boolean
}

/**
 * Выпадающий список с собственной стрелкой — чтобы контрол выглядел
 * одинаково во всех браузерах.
 */
export function Select({
  label,
  hint,
  fullWidth = false,
  className,
  children,
  id,
  ...rest
}: SelectProps) {
  // useId даёт уникальный id, даже если списков на странице несколько.
  const generatedId = useId()
  const selectId = id ?? generatedId
  const hintId = `${selectId}-hint`

  const classNames = [
    styles.field,
    fullWidth ? styles.fullWidth : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={classNames}>
      {label ? (
        <label className={styles.label} htmlFor={selectId}>
          {label}
        </label>
      ) : null}
      <span className={styles.wrap}>
        <select
          className={styles.select}
          id={selectId}
          // Подсказку читает скринридер вместе с ярлыком.
          aria-describedby={hint ? hintId : undefined}
          {...rest}
        >
          {children}
        </select>
      </span>
      {hint ? (
        <p className={styles.hint} id={hintId}>
          {hint}
        </p>
      ) : null}
    </div>
  )
}
