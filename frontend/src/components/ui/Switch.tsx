import styles from './Switch.module.css'

type SwitchProps = {
  /** Включён = «доступ открыт». */
  checked: boolean
  onChange: (next: boolean) => void
  disabled?: boolean
  /**
   * Подпись для скринридера и всплывающей подсказки. Обязательна: видимого
   * текста у переключателя нет, без неё он «кнопка без имени».
   */
  label: string
}

/**
 * Переключатель-тумблер.
 *
 * Это `button role="switch"`, а не `input[type=checkbox]`: у нас нет видимой
 * подписи рядом, зато нужен полный контроль над отрисовкой дорожки и бегунка.
 */
export function Switch({
  checked,
  onChange,
  disabled = false,
  label,
}: SwitchProps) {
  const classNames = [styles.switch, checked ? '' : styles.off]
    .filter(Boolean)
    .join(' ')

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      title={label}
      disabled={disabled}
      className={classNames}
      onClick={() => onChange(!checked)}
    >
      {/* Дорожка и бегунок — чистая декорация: состояние уже сказано
          через role/aria-checked, повторять его скринридеру не нужно. */}
      <span className={styles.track} aria-hidden="true">
        <span className={styles.knob} />
      </span>
    </button>
  )
}
