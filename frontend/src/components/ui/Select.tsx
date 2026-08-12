import styles from './Select.module.css'

type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement>

/**
 * Выпадающий список с собственной стрелкой — чтобы контрол выглядел
 * одинаково во всех браузерах.
 *
 * Видимого ярлыка у него нет: имя для скринридера передаётся через
 * `aria-label` (или `aria-labelledby`, если подпись стоит рядом).
 */
export function Select({ className, children, ...rest }: SelectProps) {
  return (
    <span className={[styles.wrap, className].filter(Boolean).join(' ')}>
      <select className={styles.select} {...rest}>
        {children}
      </select>
    </span>
  )
}
