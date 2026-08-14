import { useId } from 'react'
import styles from './TextArea.module.css'

type TextAreaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  /** Текст ярлыка над полем. */
  label: string
  /** Пояснение под полем: что сюда писать. */
  hint?: string
}

/**
 * Многострочное поле — брат `TextField` для длинных текстов.
 *
 * Тона (`panel` / `surface`), как у TextField, здесь нет: длинные тексты
 * встречаются только на белых карточках. Понадобится тёмная панель —
 * добавим тон тем же способом.
 */
export function TextArea({
  label,
  hint,
  id,
  className,
  ...rest
}: TextAreaProps) {
  // useId даёт уникальный id, даже если полей на странице несколько.
  const generatedId = useId()
  const fieldId = id ?? generatedId
  const hintId = `${fieldId}-hint`

  return (
    <div className={[styles.field, className].filter(Boolean).join(' ')}>
      <label className={styles.label} htmlFor={fieldId}>
        {label}
      </label>
      <textarea
        className={styles.input}
        id={fieldId}
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
