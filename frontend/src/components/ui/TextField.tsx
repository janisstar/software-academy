import { useId } from 'react'
import styles from './TextField.module.css'

type TextFieldProps = React.InputHTMLAttributes<HTMLInputElement> & {
  /** Текст ярлыка над полем. */
  label: string
  /**
   * На каком фоне стоит поле: `panel` — тёмно-бирюзовая панель входа
   * (по умолчанию), `surface` — белая карточка. От этого зависят цвета
   * ярлыка и рамки: светлый ярлык на белом фоне просто не виден.
   */
  tone?: 'panel' | 'surface'
  /** Пояснение под полем: что сюда писать и какие есть ограничения. */
  hint?: string
  /** Ссылка на сам <input> — нужна, например, чтобы увести в него фокус. */
  ref?: React.Ref<HTMLInputElement>
}

/** Общее текстовое поле: капсовый ярлык + input с кольцом фокуса. */
export function TextField({
  label,
  tone = 'panel',
  hint,
  id,
  className,
  ...rest
}: TextFieldProps) {
  // useId даёт уникальный id даже если полей на странице несколько.
  const generatedId = useId()
  const inputId = id ?? generatedId
  const hintId = `${inputId}-hint`

  return (
    <div
      className={[styles.field, styles[tone], className]
        .filter(Boolean)
        .join(' ')}
    >
      <label className={styles.label} htmlFor={inputId}>
        {label}
      </label>
      <input
        className={styles.input}
        id={inputId}
        // Подсказку читает скринридер вместе с ярлыком.
        aria-describedby={hint ? hintId : undefined}
        {...rest}
      />
      {hint ? (
        <p className={styles.hint} id={hintId}>
          {hint}
        </p>
      ) : null}
    </div>
  )
}
