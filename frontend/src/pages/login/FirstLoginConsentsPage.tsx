import { useId, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { acceptPrivacy, acceptTerms } from '../../api/auth'
import { ApiError } from '../../api/client'
import { StepCard } from '../../components/login/StepCard'
import { Button } from '../../components/ui/Button'
import { LEGAL_PATHS } from '../../constants/routes'
import { useAuth } from '../../hooks/useAuth'
import { useFirstLoginProgress } from '../../hooks/useFirstLoginProgress'
import { useLogout } from '../../hooks/useLogout'
import { markLandingSeen } from '../../utils/storage'
import styles from './FirstLoginConsentsPage.module.css'

/* Обязательные документы. Ключи — из backend/app/services/consent_service.py
   (PRIVACY_POLICY / TERMS), те же значения приходят в user.pending_consents.

   ВАЖНО: новый обязательный документ на бэкенде = одна запись здесь. Без неё
   пункт не отрисуется, список непринятого не опустеет и первый вход не
   закроется. */
const CONSENT_DOCUMENTS = [
  {
    key: 'privacy_policy',
    labelKey: 'firstLogin.consents.privacyLabel',
    noteKey: 'firstLogin.consents.privacyNote',
    path: LEGAL_PATHS.privacy,
    accept: acceptPrivacy,
  },
  {
    key: 'terms_and_conditions',
    labelKey: 'firstLogin.consents.termsLabel',
    noteKey: 'firstLogin.consents.termsNote',
    path: LEGAL_PATHS.terms,
    accept: acceptTerms,
  },
] as const

/**
 * Шаг 2 первого входа: согласие с обязательными документами (GDPR).
 *
 * Пункты строятся по user.pending_consents, а не забиты в разметку: если
 * пользователь принял один документ раньше, показывается только второй.
 * Своей навигации у страницы нет — после refresh() список непринятого
 * опустеет, и FirstLoginLayout уведёт в портал.
 */
export function FirstLoginConsentsPage() {
  const { t } = useTranslation()
  const { user, refresh } = useAuth()
  const { eyebrow, total, current } = useFirstLoginProgress('consents')
  const logOut = useLogout()
  const baseId = useId()

  const [checked, setChecked] = useState<Record<string, boolean>>({})
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const pending = user?.pending_consents ?? []
  const items = CONSENT_DOCUMENTS.filter((doc) => pending.includes(doc.key))
  const allChecked =
    items.length > 0 && items.every((doc) => checked[doc.key] === true)

  // Бэкенд требует документ, которого нет в CONSENT_DOCUMENTS: отметить его
  // нечем, список непринятого не опустеет — сценарий не закрыть. Молча
  // показывать заблокированную кнопку нельзя, поэтому объясняем и даём выйти.
  const hasUnknownDocuments = items.length < pending.length

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!allChecked || isSubmitting) {
      return
    }

    setError('')
    setIsSubmitting(true)

    try {
      // Параллельно: документы пишутся независимо друг от друга, а сами
      // запросы идемпотентны — повторное принятие ничего не ломает.
      await Promise.all(items.map((doc) => doc.accept()))

      // Онбординг пройден — лендинг этому человеку больше не показываем.
      // Ставим флаг ДО refresh(): после него страницу уже сменит редирект.
      markLandingSeen()
      await refresh()
    } catch (caughtError) {
      if (caughtError instanceof ApiError) {
        setError(caughtError.detail)
      } else {
        setError(t('login.unexpectedError'))
      }

      // Разблокируем форму только при ошибке: после успеха страница уезжает.
      // Галочки остаются на месте, повторное нажатие просто доотправит своё.
      setIsSubmitting(false)
    }
  }

  return (
    <StepCard
      eyebrow={eyebrow}
      title={t('firstLogin.consents.title')}
      subtitle={t('firstLogin.consents.subtitle')}
      total={total}
      current={current}
    >
      <form onSubmit={handleSubmit}>
        <ul className={styles.list}>
          {items.map((doc) => {
            const checkboxId = `${baseId}-${doc.key}`

            return (
              <li className={styles.item} key={doc.key}>
                <input
                  className={styles.check}
                  id={checkboxId}
                  type="checkbox"
                  checked={checked[doc.key] === true}
                  onChange={(event) =>
                    setChecked((previous) => ({
                      ...previous,
                      [doc.key]: event.target.checked,
                    }))
                  }
                />
                <span className={styles.text}>
                  {/* Ссылка намеренно ВНЕ <label>: внутри клик по ней заодно
                      ставил бы галочку, и согласие оказалось бы отмечено, хотя
                      документ ещё не открывали. */}
                  <label className={styles.label} htmlFor={checkboxId}>
                    {t(doc.labelKey)}
                  </label>
                  <Link
                    className={styles.link}
                    to={doc.path}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {t('firstLogin.consents.openDocument')}{' '}
                    <span aria-hidden="true">{t('common.externalArrow')}</span>
                  </Link>
                  <small className={styles.note}>{t(doc.noteKey)}</small>
                </span>
              </li>
            )
          })}
        </ul>

        {hasUnknownDocuments ? (
          <div className={styles.notice} role="alert">
            <p>{t('firstLogin.consents.unavailable')}</p>
            <button
              className={styles.logout}
              type="button"
              onClick={() => void logOut()}
            >
              {t('common.logOut')}
            </button>
          </div>
        ) : null}

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
          disabled={!allChecked || isSubmitting}
        >
          {isSubmitting ? t('common.saving') : t('firstLogin.consents.submit')}
        </Button>
      </form>
    </StepCard>
  )
}
