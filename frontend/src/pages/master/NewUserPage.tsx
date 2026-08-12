import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate } from 'react-router-dom'
import { createUser } from '../../api/users'
import { PageShell } from '../../components/master/PageShell'
import { UserCreatedPanel } from '../../components/master/UserCreatedPanel'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Select } from '../../components/ui/Select'
import { TextField } from '../../components/ui/TextField'
import { PEOPLE_PATHS } from '../../constants/routes'
import { useAuth } from '../../hooks/useAuth'
import { useDirectories } from '../../hooks/useDirectories'
import {
  activeRole,
  type UserCreatePayload,
  type UserCreated,
} from '../../types/api'
import { apiErrorText } from '../../utils/apiError'
import styles from './NewUserPage.module.css'

/** Пустое значение селекта: пока ничего не выбрано. */
const NOT_SELECTED = ''

export function NewUserPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { user: me } = useAuth()

  // master заводит людей в любой компании, поэтому выбирает её сам.
  // Остальным ролям бэкенд подставляет их собственную компанию.
  const isMaster = me ? activeRole(me.privileges) === 'master' : false
  const { roles, companies } = useDirectories(isMaster)

  const [name, setName] = useState('')
  const [un, setUn] = useState('')
  const [email, setEmail] = useState('')
  const [companyId, setCompanyId] = useState(NOT_SELECTED)
  const [roleKey, setRoleKey] = useState(NOT_SELECTED)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  // Пока не null — показываем экран с временным паролем вместо формы.
  const [created, setCreated] = useState<UserCreated | null>(null)

  // master — singleton-роль вендора, через API она не выдаётся (docs/06 §3).
  const assignableRoles = roles.filter((role) => role.key !== 'master')

  const canSubmit =
    name.trim() !== '' &&
    un.trim() !== '' &&
    roleKey !== NOT_SELECTED &&
    (!isMaster || companyId !== NOT_SELECTED)

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()

    if (!canSubmit || busy) {
      return
    }

    // Логин уходит в адрес страницы пользователя, пробелов в нём быть не должно.
    if (/\s/.test(un.trim())) {
      setError(t('people.newUser.usernameSpaces'))
      return
    }

    const payload: UserCreatePayload = {
      un: un.trim(),
      name: name.trim(),
      role: roleKey,
      email: email.trim() === '' ? null : email.trim(),
      // Не master — companyid не передаём вовсе, бэкенд знает компанию сам.
      companyid: isMaster ? Number(companyId) : undefined,
    }

    setBusy(true)
    setError(null)

    void createUser(payload)
      .then((result) => setCreated(result))
      .catch((caught: unknown) =>
        setError(apiErrorText(caught, t('people.newUser.createError'))),
      )
      .finally(() => setBusy(false))
  }

  return (
    <>
      <Link className={styles.backlink} to={PEOPLE_PATHS.users}>
        {t('common.arrowBack')} {t('people.users.title')}
      </Link>

      <PageShell
        eyebrow={t('people.users.eyebrow')}
        title={
          created
            ? t('people.newUser.createdTitle')
            : t('people.users.newTitle')
        }
      >
        {created ? (
          <UserCreatedPanel created={created} />
        ) : (
          <Card>
            <form className={styles.form} onSubmit={handleSubmit}>
              <TextField
                tone="surface"
                label={t('people.newUser.fullName')}
                value={name}
                onChange={(event) => setName(event.target.value)}
              />

              <TextField
                tone="surface"
                label={t('people.newUser.username')}
                hint={t('people.newUser.usernameHint')}
                value={un}
                onChange={(event) => setUn(event.target.value)}
              />

              <TextField
                tone="surface"
                type="email"
                label={t('people.newUser.email')}
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />

              {isMaster ? (
                <Select
                  fullWidth
                  label={t('people.newUser.company')}
                  value={companyId}
                  onChange={(event) => setCompanyId(event.target.value)}
                >
                  <option value={NOT_SELECTED}>
                    {t('people.newUser.choose')}
                  </option>
                  {companies.map((company) => (
                    <option key={company.id} value={company.id}>
                      {company.name}
                    </option>
                  ))}
                </Select>
              ) : null}

              <Select
                fullWidth
                label={t('people.newUser.role')}
                hint={t('people.newUser.roleHint')}
                value={roleKey}
                onChange={(event) => setRoleKey(event.target.value)}
              >
                <option value={NOT_SELECTED}>
                  {t('people.newUser.choose')}
                </option>
                {assignableRoles.map((role) => (
                  <option key={role.key} value={role.key}>
                    {role.name}
                  </option>
                ))}
              </Select>

              {error ? <p className={styles.error}>{error}</p> : null}

              <div className={styles.actions}>
                <Button type="submit" disabled={!canSubmit || busy}>
                  {busy
                    ? t('people.newUser.submitting')
                    : t('people.newUser.submit')}
                </Button>
                <Button
                  variant="ghost"
                  disabled={busy}
                  onClick={() => navigate(PEOPLE_PATHS.users)}
                >
                  {t('common.cancel')}
                </Button>
              </div>
            </form>
          </Card>
        )}
      </PageShell>
    </>
  )
}
