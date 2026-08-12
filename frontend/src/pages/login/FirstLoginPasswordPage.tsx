import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { changePassword } from '../../api/auth'
import { ApiError } from '../../api/client'
import { StepCard } from '../../components/login/StepCard'
import { Button } from '../../components/ui/Button'
import { TextField } from '../../components/ui/TextField'
import { useAuth } from '../../hooks/useAuth'
import { useFirstLoginProgress } from '../../hooks/useFirstLoginProgress'
import styles from './FirstLoginPasswordPage.module.css'

/** Должно совпадать с MIN_PASSWORD_LENGTH в backend/app/schemas/password.py. */
const MIN_PASSWORD_LENGTH = 8

/**
 * Шаг 1 первого входа: замена временного пароля на постоянный.
 *
 * Своей навигации у страницы нет. После успеха она только обновляет
 * пользователя через refresh(); флаг must_change_password снимается, и
 * FirstLoginLayout сам уводит на следующий шаг.
 */
export function FirstLoginPasswordPage() {
  const { t } = useTranslation()
  const { refresh } = useAuth()
  const { eyebrow, total, current } = useFirstLoginProgress('password')

  const [oldPw, setOldPw] = useState('')
  const [newPw, setNewPw] = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Подсказку о несовпадении показываем только когда во втором поле уже
  // что-то есть: иначе она загоралась бы с первой набранной буквы.
  const isMismatch = confirmPw.length > 0 && newPw !== confirmPw
  const isValid =
    oldPw.length > 0 &&
    newPw.length >= MIN_PASSWORD_LENGTH &&
    newPw === confirmPw

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!isValid || isSubmitting) {
      return
    }

    setError('')
    setIsSubmitting(true)

    try {
      await changePassword(oldPw, newPw)
      await refresh()
    } catch (caughtError) {
      if (caughtError instanceof ApiError) {
        // 422 бэкенд отдаёт массивом объектов, а client.ts сводит его к
        // нечитаемой строке — правило длины объясняем своим текстом.
        setError(
          caughtError.status === 422
            ? t('firstLogin.password.tooShort', { min: MIN_PASSWORD_LENGTH })
            : caughtError.detail,
        )
      } else {
        setError(t('login.unexpectedError'))
      }

      // Разблокируем форму только при ошибке: после успеха страница уже уезжает.
      setIsSubmitting(false)
    }
  }

  return (
    <StepCard
      eyebrow={eyebrow}
      title={t('firstLogin.password.title')}
      subtitle={t('firstLogin.password.subtitle')}
      total={total}
      current={current}
    >
      <form onSubmit={handleSubmit}>
        <TextField
          className={styles.field}
          label={t('firstLogin.password.tempLabel')}
          type="password"
          value={oldPw}
          onChange={(event) => setOldPw(event.target.value)}
          autoComplete="current-password"
        />
        <TextField
          className={styles.field}
          label={t('firstLogin.password.newLabel')}
          type="password"
          placeholder={t('firstLogin.password.newPlaceholder', {
            min: MIN_PASSWORD_LENGTH,
          })}
          value={newPw}
          onChange={(event) => setNewPw(event.target.value)}
          autoComplete="new-password"
        />
        <TextField
          className={styles.field}
          label={t('firstLogin.password.confirmLabel')}
          type="password"
          value={confirmPw}
          onChange={(event) => setConfirmPw(event.target.value)}
          autoComplete="new-password"
        />

        {/* aria-live: текст подсказки меняется по ходу ввода, и скринридер
            должен сообщить об этом, не перебивая набор. */}
        <p className={styles.hint} aria-live="polite">
          {isMismatch
            ? t('firstLogin.password.mismatchHint')
            : t('firstLogin.password.lengthHint', { min: MIN_PASSWORD_LENGTH })}
        </p>

        {error ? (
          <p className={styles.error} role="alert">
            {error}
          </p>
        ) : null}

        {/* type="submit" явно: у Button по умолчанию type="button". */}
        <Button
          className={styles.submit}
          type="submit"
          fullWidth
          disabled={!isValid || isSubmitting}
        >
          {isSubmitting ? t('common.saving') : t('firstLogin.password.submit')}
        </Button>
      </form>
    </StepCard>
  )
}
