import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { ApiError } from '../../api/client'
import { AUTH_PATHS, homePathFor } from '../../constants/routes'
import { useAuth } from '../../hooks/useAuth'
import { activeRole } from '../../types/api'
import { LoginBook } from '../../components/login/LoginBook'
// Тот же вариант знака, что в шапке лендинга — фон здесь тоже светлый.
import logoMark from '../../assets/logo-mark-light.png'
import styles from './LoginPage.module.css'

export function LoginPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { login, user, loading } = useAuth()
  const [un, setUn] = useState('')
  const [pw, setPw] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const isDisabled =
    un.trim().length === 0 || pw.trim().length === 0 || isSubmitting

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')

    if (isDisabled) {
      return
    }

    try {
      setIsSubmitting(true)
      // Куда вести, решает роль из ответа входа: master — в свой интерфейс,
      // остальные — в учебный. Незакрытый первый вход перехватит FirstLoginGate.
      const response = await login(un, pw)
      navigate(homePathFor(activeRole(response.user.privileges)), {
        replace: true,
      })
    } catch (caughtError) {
      if (caughtError instanceof ApiError) {
        setError(caughtError.detail)
      } else {
        setError(t('login.unexpectedError'))
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  // Ждём проверку сессии, иначе форма мигнёт перед редиректом.
  if (loading) {
    return <div className={styles.loading}>{t('common.loading')}</div>
  }

  // Уже вошедшему пользователю форма входа не нужна.
  if (user) {
    return <Navigate to={homePathFor(activeRole(user.privileges))} replace />
  }

  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        {/* Знак с названием — ссылка обратно на лендинг. */}
        <Link className={styles.brand} to="/">
          {/* alt="" — знак декоративный, название написано текстом рядом. */}
          <img
            className={styles.logo}
            src={logoMark}
            alt=""
            aria-hidden="true"
          />
          <span className={styles.brandName}>{t('brand.name')}</span>
        </Link>
      </header>

      <div className={styles.center}>
        <LoginBook
          un={un}
          pw={pw}
          onUnChange={setUn}
          onPwChange={setPw}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          isDisabled={isDisabled}
        />

        {error ? (
          <p className={styles.error} role="alert">
            {error}
          </p>
        ) : null}

        <div className={styles.below}>
          <Link className={styles.forgot} to={AUTH_PATHS.forgotPassword}>
            {t('login.forgotPassword')}
          </Link>
          <p className={styles.hint}>{t('login.accessHint')}</p>
        </div>
      </div>
    </div>
  )
}
