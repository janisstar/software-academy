import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '../ui/Button'
import { TextField } from '../ui/TextField'
import styles from './LoginBook.module.css'

/** Пауза перед переводом фокуса: ждём, пока страница книги довернётся. */
const FOCUS_DELAY_MS = 500

/** Элементы, клик по которым не переключает книгу, а работает сам по себе. */
const CONTROL_SELECTOR = 'input, button, label, a, select, textarea'

interface LoginBookProps {
  un: string
  pw: string
  onUnChange: (value: string) => void
  onPwChange: (value: string) => void
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void
  isSubmitting: boolean
  isDisabled: boolean
}

/** Книжка входа: обложка + страница с логином + страница с паролем. */
export function LoginBook({
  un,
  pw,
  onUnChange,
  onPwChange,
  onSubmit,
  isSubmitting,
  isDisabled,
}: LoginBookProps) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const usernameRef = useRef<HTMLInputElement>(null)
  const coverRef = useRef<HTMLButtonElement>(null)

  // После открытия уводим фокус в поле username — но только когда
  // переворот закончился, иначе фокус «прыгает» посреди анимации.
  useEffect(() => {
    if (!open) {
      return
    }

    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches

    if (prefersReducedMotion) {
      usernameRef.current?.focus()
      return
    }

    const timer = window.setTimeout(
      () => usernameRef.current?.focus(),
      FOCUS_DELAY_MS,
    )
    return () => window.clearTimeout(timer)
  }, [open])

  function closeBook() {
    setOpen(false)
    // Половинки снова станут inert — уводим фокус на обложку,
    // иначе он «потеряется» на body.
    coverRef.current?.focus()
  }

  /** Клик по свободному полю разворота: закрытую книгу открывает,
   *  открытую — закрывает. Клики по полям и кнопкам не трогаем. */
  function handleBodyClick(event: React.MouseEvent<HTMLFormElement>) {
    if ((event.target as HTMLElement).closest(CONTROL_SELECTOR)) {
      return
    }

    if (open) {
      closeBook()
    } else {
      setOpen(true)
    }
  }

  /** Escape закрывает книгу — клавиатурная замена клику по полю. */
  function handleKeyDown(event: React.KeyboardEvent<HTMLFormElement>) {
    if (open && event.key === 'Escape') {
      closeBook()
    }
  }

  return (
    <div className={[styles.book, open ? styles.open : ''].join(' ')}>
      <p className={styles.eyebrow}>{t('login.eyebrow')}</p>
      <h1 className={styles.title}>
        {t('login.title')}{' '}
        <span className={styles.muted}>{t('login.titleAccent')}</span>
      </h1>

      {/* Форма охватывает обе страницы, поэтому Enter в любом поле = отправка. */}
      <form
        className={styles.body}
        onSubmit={onSubmit}
        onClick={handleBodyClick}
        onKeyDown={handleKeyDown}
      >
        {/* inert висит на половинках, а не на форме: иначе обложка,
            которая лежит внутри формы, перестала бы ловить клики.
            Пока книжка закрыта, поля вне tab-порядка и не читаются скринридером. */}
        <div className={styles.left} inert={!open}>
          <TextField
            ref={usernameRef}
            label={t('login.username')}
            value={un}
            onChange={(event) => onUnChange(event.target.value)}
            placeholder={t('login.usernamePlaceholder')}
            autoComplete="username"
          />
        </div>

        <div className={styles.right} inert={!open}>
          <TextField
            label={t('login.password')}
            type="password"
            value={pw}
            onChange={(event) => onPwChange(event.target.value)}
            placeholder={t('login.passwordPlaceholder')}
            autoComplete="current-password"
          />
          <div className={styles.row}>
            <Button
              className={styles.submit}
              type="submit"
              disabled={isDisabled}
            >
              {isSubmitting ? t('login.submitting') : t('login.submit')}
            </Button>
          </div>
        </div>

        {/* Обложка: книжка открывается только по клику, автопереворота нет. */}
        <button
          ref={coverRef}
          className={styles.cover}
          type="button"
          aria-expanded={open}
          onClick={() => setOpen(true)}
        >
          <small>{t('login.cover.above')}</small>
          <span className={styles.coverWord}>{t('login.cover.word')}</span>
          <small>{t('login.cover.below')}</small>
        </button>
      </form>
    </div>
  )
}
