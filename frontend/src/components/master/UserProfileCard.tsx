import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { RoleChip } from './RoleChip'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'
import { Select } from '../ui/Select'
import { TextField } from '../ui/TextField'
import { activeRole, type RoleOut, type UserOut } from '../../types/api'
import { formatShortDate } from '../../utils/date'
import styles from './UserProfileCard.module.css'

/** Что можно поменять в профиле. Роль меняется отдельно — правила у неё свои. */
export type ProfileValues = {
  name: string
  un: string
  email: string
}

type UserProfileCardProps = {
  user: UserOut
  /** Справочник ролей: и названия, и варианты для смены. */
  roles: RoleOut[]
  companyName: string | null
  /** Можно ли менять роль этому человеку (нельзя себе и нельзя master). */
  canChangeRole: boolean
  /** Сохранить. Возвращает текст ошибки — или null, если всё прошло. */
  onSaveProfile: (values: ProfileValues) => Promise<string | null>
  onSaveRole: (roleKey: string) => Promise<string | null>
}

/** Что сейчас редактируем: ничего, профиль или роль. */
type Mode = 'view' | 'profile' | 'role'

/** Левая карточка страницы пользователя: кто это и как его поменять. */
export function UserProfileCard({
  user,
  roles,
  companyName,
  canChangeRole,
  onSaveProfile,
  onSaveRole,
}: UserProfileCardProps) {
  const { t } = useTranslation()

  const [mode, setMode] = useState<Mode>('view')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Черновики формы. Заполняются в момент входа в режим правки, чтобы
  // «Cancel» просто вернул то, что пришло с бэкенда.
  const [draft, setDraft] = useState<ProfileValues>({
    name: '',
    un: '',
    email: '',
  })
  const [draftRole, setDraftRole] = useState('')

  const role = activeRole(user.privileges)
  const roleName = roles.find((item) => item.key === role)?.name ?? role ?? ''
  // master не выдаётся через API — это singleton-роль вендора (docs/06 §3).
  const assignableRoles = roles.filter((item) => item.key !== 'master')

  const startProfileEdit = () => {
    setDraft({ name: user.name, un: user.un, email: user.email ?? '' })
    setError(null)
    setMode('profile')
  }

  const startRoleEdit = () => {
    setDraftRole(role ?? '')
    setError(null)
    setMode('role')
  }

  const cancel = () => {
    setError(null)
    setMode('view')
  }

  /** Общий хвост для обоих сохранений: занять кнопки, показать ошибку, выйти. */
  const runSave = (save: () => Promise<string | null>) => {
    setBusy(true)
    setError(null)

    void save()
      .then((message) => {
        setError(message)
        if (message === null) {
          setMode('view')
        }
      })
      .finally(() => setBusy(false))
  }

  return (
    <Card>
      <h2 className={styles.title}>{t('people.user.profileTitle')}</h2>

      {mode === 'profile' ? (
        <div className={styles.form}>
          <TextField
            tone="surface"
            label={t('people.user.fieldName')}
            value={draft.name}
            onChange={(event) =>
              setDraft({ ...draft, name: event.target.value })
            }
          />
          <TextField
            tone="surface"
            label={t('people.user.fieldUsername')}
            value={draft.un}
            onChange={(event) => setDraft({ ...draft, un: event.target.value })}
          />
          <TextField
            tone="surface"
            type="email"
            label={t('people.user.fieldEmail')}
            value={draft.email}
            onChange={(event) =>
              setDraft({ ...draft, email: event.target.value })
            }
          />
        </div>
      ) : (
        <>
          <div className={styles.row}>
            <span className={styles.label}>{t('people.user.fieldName')}</span>
            <span>{user.name}</span>
          </div>
          <div className={styles.row}>
            <span className={styles.label}>
              {t('people.user.fieldUsername')}
            </span>
            <span>{user.un}</span>
          </div>
          <div className={styles.row}>
            <span className={styles.label}>{t('people.user.fieldEmail')}</span>
            {user.email ? (
              <span>{user.email}</span>
            ) : (
              <span className={styles.empty}>{t('people.users.noValue')}</span>
            )}
          </div>
          <div className={styles.row}>
            <span className={styles.label}>
              {t('people.user.fieldCompany')}
            </span>
            {companyName ? (
              <span>{companyName}</span>
            ) : (
              <span className={styles.empty}>{t('people.users.noValue')}</span>
            )}
          </div>
          <div className={styles.row}>
            <span className={styles.label}>{t('people.user.fieldRole')}</span>
            <span className={styles.roleRow}>
              {mode === 'role' ? (
                <>
                  <Select
                    aria-label={t('people.user.changeRole')}
                    value={draftRole}
                    disabled={busy}
                    onChange={(event) => setDraftRole(event.target.value)}
                  >
                    {assignableRoles.map((item) => (
                      <option key={item.key} value={item.key}>
                        {item.name}
                      </option>
                    ))}
                  </Select>
                  <Button
                    disabled={busy || draftRole === ''}
                    onClick={() => runSave(() => onSaveRole(draftRole))}
                  >
                    {busy ? t('common.saving') : t('common.save')}
                  </Button>
                  <Button variant="ghost" disabled={busy} onClick={cancel}>
                    {t('common.cancel')}
                  </Button>
                </>
              ) : (
                <>
                  <RoleChip role={role} name={roleName} />
                  {canChangeRole ? (
                    <Button variant="outline" onClick={startRoleEdit}>
                      {t('people.user.changeRole')}
                    </Button>
                  ) : null}
                </>
              )}
            </span>
          </div>
          <div className={styles.row}>
            <span className={styles.label}>
              {t('people.user.fieldCreated')}
            </span>
            <span>{formatShortDate(user.created_at)}</span>
          </div>
        </>
      )}

      {error ? <p className={styles.error}>{error}</p> : null}

      <div className={styles.actions}>
        {mode === 'profile' ? (
          <>
            <Button
              disabled={busy}
              onClick={() => runSave(() => onSaveProfile(draft))}
            >
              {busy ? t('common.saving') : t('common.save')}
            </Button>
            <Button variant="ghost" disabled={busy} onClick={cancel}>
              {t('common.cancel')}
            </Button>
          </>
        ) : null}

        {mode === 'view' ? (
          <Button variant="outline" onClick={startProfileEdit}>
            {t('people.user.editProfile')}
          </Button>
        ) : null}
      </div>
    </Card>
  )
}
