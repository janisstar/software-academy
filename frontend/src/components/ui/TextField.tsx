import { useId } from 'react'
import styles from './TextField.module.css'

type TextFieldProps = React.InputHTMLAttributes<HTMLInputElement> & {
  /** Текст ярлыка над полем. */
  label: string
  /** Ссылка на сам <input> — нужна, например, чтобы увести в него фокус. */
  ref?: React.Ref<HTMLInputElement>
}

/** Общее текстовое поле: капсовый ярлык + input с кольцом фокуса. */
export function TextField({ label, id, className, ...rest }: TextFieldProps) {
  // useId даёт уникальный id даже если полей на странице несколько.
  const generatedId = useId()
  const inputId = id ?? generatedId

  return (
    <div className={[styles.field, className].filter(Boolean).join(' ')}>
      <label className={styles.label} htmlFor={inputId}>
        {label}
      </label>
      <input className={styles.input} id={inputId} {...rest} />
    </div>
  )
}
