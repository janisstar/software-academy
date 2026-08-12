import { useEffect, useId, useRef, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import styles from './Modal.module.css'

type ModalProps = {
  /** Заголовок окна: он же имя диалога для скринридера. */
  title: string
  /** Закрыть окно: крестика нет, закрывают Esc, фон и кнопки в actions. */
  onClose: () => void
  children: ReactNode
  /** Кнопки внизу окна. */
  actions?: ReactNode
}

/**
 * Модальное окно.
 *
 * Рисуется через портал прямо в <body>: иначе любой предок с transform или
 * filter стал бы точкой отсчёта для `position: fixed` и затемнение легло бы
 * не на весь экран.
 *
 * Ловушки фокуса внутри окна пока нет — Tab может уйти на страницу под ним.
 * Esc и клик по фону закрывают, фокус при открытии уходит в окно.
 */
export function Modal({ title, onClose, children, actions }: ModalProps) {
  const titleId = useId()
  const modalRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    // Фокус уводим в окно, иначе он остался бы на кнопке под затемнением.
    modalRef.current?.focus()

    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  return createPortal(
    // Клик мимо окна закрывает. Проверяем именно target: клик ВНУТРИ окна
    // тоже всплывает сюда, и без проверки окно закрывалось бы от любого клика.
    <div
      className={styles.backdrop}
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onClose()
        }
      }}
    >
      <div
        ref={modalRef}
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
      >
        <h2 className={styles.title} id={titleId}>
          {title}
        </h2>
        {children}
        {actions ? <div className={styles.actions}>{actions}</div> : null}
      </div>
    </div>,
    document.body,
  )
}
