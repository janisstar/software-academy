import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate } from 'react-router-dom'
import { createCompany } from '../../api/companies'
import { PageShell } from '../../components/master/PageShell'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { TextField } from '../../components/ui/TextField'
import { PEOPLE_PATHS } from '../../constants/routes'
import type { CompanyCreatePayload } from '../../types/api'
import { apiErrorText } from '../../utils/apiError'
import styles from './NewCompanyPage.module.css'

export function NewCompanyPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [businessId, setBusinessId] = useState('')
  const [email, setEmail] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const canSubmit = name.trim() !== ''

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()

    if (!canSubmit || busy) {
      return
    }

    const payload: CompanyCreatePayload = {
      name: name.trim(),
      // Пустое поле = «не указано», поэтому null, а не пустая строка.
      businessid: businessId.trim() === '' ? null : businessId.trim(),
      email: email.trim() === '' ? null : email.trim(),
    }

    setBusy(true)
    setError(null)

    void createCompany(payload)
      // Отдельного экрана-подтверждения тут не нужно: секрета, который видно
      // один раз, у компании нет — сразу возвращаемся к списку.
      .then(() => navigate(PEOPLE_PATHS.companies))
      .catch((caught: unknown) =>
        setError(apiErrorText(caught, t('people.newCompany.createError'))),
      )
      .finally(() => setBusy(false))
  }

  return (
    <>
      <Link className={styles.backlink} to={PEOPLE_PATHS.companies}>
        {t('common.arrowBack')} {t('people.companies.title')}
      </Link>

      <PageShell
        eyebrow={t('people.users.eyebrow')}
        title={t('people.newCompany.title')}
      >
        <Card>
          <form className={styles.form} onSubmit={handleSubmit}>
            <TextField
              tone="surface"
              label={t('people.newCompany.name')}
              value={name}
              onChange={(event) => setName(event.target.value)}
            />

            <TextField
              tone="surface"
              label={t('people.newCompany.businessId')}
              hint={t('people.newCompany.businessIdHint')}
              value={businessId}
              onChange={(event) => setBusinessId(event.target.value)}
            />

            <TextField
              tone="surface"
              type="email"
              label={t('people.newCompany.email')}
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />

            {error ? <p className={styles.error}>{error}</p> : null}

            <div className={styles.actions}>
              <Button type="submit" disabled={!canSubmit || busy}>
                {busy
                  ? t('people.newCompany.submitting')
                  : t('people.newCompany.submit')}
              </Button>
              <Button
                variant="ghost"
                disabled={busy}
                onClick={() => navigate(PEOPLE_PATHS.companies)}
              >
                {t('common.cancel')}
              </Button>
            </div>
          </form>
        </Card>
      </PageShell>
    </>
  )
}
