import { useState } from 'react'
import { Button } from './Button'
import styles from './CodePanel.module.css'

type CodePanelProps = {
  /** Сам секрет: временный пароль или одноразовый код. */
  code: string
  /** Подпись над кодом, например «Temporary password». */
  caption?: string
  /** Мелкий текст под кнопкой — предупреждение о том, что показано один раз. */
  note?: string
  copyLabel: string
  /** Подпись кнопки после успешного копирования. */
  copiedLabel: string
}

/**
 * Панель с секретом, который показывается один раз: крупный код и кнопка
 * «скопировать». Используют экран созданного пользователя и окно кода сброса.
 */
export function CodePanel({
  code,
  caption,
  note,
  copyLabel,
  copiedLabel,
}: CodePanelProps) {
  const [copied, setCopied] = useState(false)

  const copy = () => {
    void navigator.clipboard
      .writeText(code)
      .then(() => setCopied(true))
      // Буфер обмена может быть недоступен (нет https, отказ в правах) —
      // тогда код всё равно виден на экране и его можно выделить руками.
      .catch(() => setCopied(false))
  }

  return (
    <div className={styles.panel}>
      {caption ? <p className={styles.caption}>{caption}</p> : null}
      <p className={styles.code}>{code}</p>
      <Button variant="outline" onClick={copy}>
        {copied ? copiedLabel : copyLabel}
      </Button>
      {note ? <p className={styles.note}>{note}</p> : null}
    </div>
  )
}
