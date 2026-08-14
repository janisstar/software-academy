import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate } from 'react-router-dom'
import { confirmPasswordReset } from '../../api/auth'
import { ApiError } from '../../api/client'
import { AuthShell } from '../../components/login/AuthShell'
import { StepCard } from '../../components/login/StepCard'
import { Button } from '../../components/ui/Button'
import { TextField } from '../../components/ui/TextField'
import styles from './ForgotPasswordPage.module.css'

/** Должно совпадать с MIN_PASSWORD_LENGTH в backend/app/schemas/password.py. */
const MIN_PASSWORD_LENGTH = 8

/**
 * Публичный экран восстановления доступа (макет
 * docs/mockups/auth-flow-mockup.html, экран 2).
 *
 * Человек вводит логин, код от администратора (живёт 15 минут) и новый пароль.
 * Автологина здесь нет: эндпоинт публичный и сессию не создаёт — после успеха
 * показываем подтверждение прямо здесь и уводим на страницу входа.
 */
export function ForgotPasswordPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const [un, setUn] = useState('')
  const [code, setCode] = useState('')
  const [newPw, setNewPw] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  // Успех показываем на этой же странице, отдельного роута у него нет.
  const [isDone, setIsDone] = useState(false)

  // Правила пароля проверяет бэкенд; здесь только «поле не пустое», чтобы
  // не отправлять заведомо неполную форму.
  const isDisabled =
    un.trim().length === 0 ||
    code.trim().length === 0 ||
    newPw.length === 0 ||
    isSubmitting

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (isDisabled) {
      return
    }

    setError('')
    setIsSubmitting(true)

    try {
      await confirmPasswordReset(un.trim(), code.trim(), newPw)
      setIsDone(true)
    } catch (caughtError) {
      if (caughtError instanceof ApiError) {
        // 422 бэкенд отдаёт массивом объектов, а client.ts сводит его к
        // нечитаемой строке — правило длины объясняем своим текстом.
        // Остальное (неверный или просроченный код) показываем как есть.
        setError(
          caughtError.status === 422
            ? t('login.forgot.tooShort', { min: MIN_PASSWORD_LENGTH })
            : caughtError.detail,
        )
      } else {
        setError(t('login.unexpectedError'))
      }
    } finally {
      // Введённые значения намеренно не стираем: человек поправит одно поле.
      setIsSubmitting(false)
    }
  }

  if (isDone) {
    return (
      <AuthShell>
        <StepCard
          eyebrow={t('login.forgot.eyebrow')}
          title={t('login.forgot.doneTitle')}
          subtitle={t('login.forgot.doneSubtitle')}
        >
          {/* Переход делаем через navigate: кнопка внутри ссылки — невалидная
              вёрстка (<button> внутри <a>), а вид нужен именно кнопочный. */}
          <Button
            className={styles.submit}
            fullWidth
            onClick={() => navigate('/login')}
          >
            {t('login.forgot.doneSubmit')}
          </Button>
        </StepCard>
      </AuthShell>
    )
  }

  return (
    <AuthShell>
      <StepCard
        eyebrow={t('login.forgot.eyebrow')}
        title={t('login.forgot.title')}
        subtitle={t('login.forgot.subtitle')}
      >
        <form onSubmit={handleSubmit}>
          <TextField
            className={styles.field}
            label={t('login.forgot.usernameLabel')}
            value={un}
            onChange={(event) => setUn(event.target.value)}
            placeholder={t('login.forgot.usernamePlaceholder')}
            autoComplete="username"
          />
          {/* Код — случайные буквы и цифры (backend/app/core/security.py),
              поэтому регистр важен, а автозамены браузера только мешают. */}
          <TextField
            className={styles.field}
            label={t('login.forgot.codeLabel')}
            hint={t('login.forgot.codeHint')}
            value={code}
            onChange={(event) => setCode(event.target.value)}
            autoComplete="one-time-code"
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck={false}
          />
          <TextField
            className={styles.field}
            label={t('login.forgot.newPasswordLabel')}
            type="password"
            value={newPw}
            onChange={(event) => setNewPw(event.target.value)}
            placeholder={t('login.forgot.newPasswordPlaceholder', {
              min: MIN_PASSWORD_LENGTH,
            })}
            autoComplete="new-password"
          />

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
            disabled={isDisabled}
          >
            {isSubmitting ? t('common.saving') : t('login.forgot.submit')}
          </Button>
        </form>

        <p className={styles.below}>
          <Link className={styles.back} to="/login">
            <span aria-hidden="true">{t('common.arrowBack')}</span>{' '}
            {t('login.forgot.backToLogin')}
          </Link>
        </p>
      </StepCard>
    </AuthShell>
  )
}
