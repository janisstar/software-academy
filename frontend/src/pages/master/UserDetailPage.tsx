import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  createResetCode,
  deleteUser,
  lockUser,
  updateUser,
} from '../../api/users'
import { ResetCodeModal } from '../../components/master/ResetCodeModal'
import { UserAccessCard } from '../../components/master/UserAccessCard'
import { UserDangerZone } from '../../components/master/UserDangerZone'
import {
  UserProfileCard,
  type ProfileValues,
} from '../../components/master/UserProfileCard'
import { Avatar } from '../../components/ui/Avatar'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Modal } from '../../components/ui/Modal'
import { StatusBadge } from '../../components/ui/StatusBadge'
import { PEOPLE_PATHS, userPath } from '../../constants/routes'
import { useAuth } from '../../hooks/useAuth'
import { useUser } from '../../hooks/useUser'
import {
  activeRole,
  isLocked,
  type ResetCode,
  type UserUpdatePayload,
} from '../../types/api'
import { apiErrorText } from '../../utils/apiError'
import { userStatus } from '../../utils/users'
import styles from './UserDetailPage.module.css'

/** Ключ i18n для подписи статуса в шапке. */
const STATUS_LABEL_KEYS = {
  active: 'people.users.statusActive',
  pending: 'people.users.statusPending',
  locked: 'people.users.statusLocked',
} as const

export function UserDetailPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { username } = useParams()
  const { user: me, company: myCompany } = useAuth()

  const isMaster = me ? activeRole(me.privileges) === 'master' : false

  const { user, roles, companies, loading, failed, reload } = useUser({
    un: username ?? '',
    withCompanies: isMaster,
  })

  // Блокировка и код сброса делят одно состояние: обе кнопки живут в карточке
  // Access, и одновременно их всё равно не нажать.
  const [accessBusy, setAccessBusy] = useState(false)
  const [accessError, setAccessError] = useState<string | null>(null)
  const [deleteBusy, setDeleteBusy] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [resetCode, setResetCode] = useState<ResetCode | null>(null)

  const backLink = (
    <Link className={styles.backlink} to={PEOPLE_PATHS.users}>
      {t('common.arrowBack')} {t('people.users.title')}
    </Link>
  )

  if (loading) {
    return (
      <>
        {backLink}
        <Card>{t('common.loading')}</Card>
      </>
    )
  }

  if (failed || !user) {
    return (
      <>
        {backLink}
        <Card className={styles.error}>
          <p>{t('people.user.error')}</p>
          <Button onClick={reload}>{t('people.users.retry')}</Button>
        </Card>
      </>
    )
  }

  const status = userStatus(user)
  const locked = isLocked(user.privileges)

  // Кого трогать нельзя: себя (бэкенд запрещает) и master — singleton-роль
  // вендора, её не блокируют, не удаляют и не переназначают (docs/06 §3).
  const isSelf = me?.un === user.un
  const isTargetMaster = activeRole(user.privileges) === 'master'
  const canManage = !isSelf && !isTargetMaster

  // Названия компаний есть только у master. Остальным ролям бэкенд отдаёт
  // пользователей только их компании — значит, это компания вошедшего.
  const companyName = isMaster
    ? (companies.find((company) => company.id === user.companyid)?.name ?? null)
    : (myCompany?.name ?? null)

  const handleSaveProfile = async (
    values: ProfileValues,
  ): Promise<string | null> => {
    // `un` говорит, кого меняем; остальные поля кладём только изменившиеся.
    const payload: UserUpdatePayload = { un: user.un }
    const nextName = values.name.trim()
    const nextUn = values.un.trim()
    const nextEmail = values.email.trim()

    if (nextName !== user.name) {
      payload.name = nextName
    }
    if (nextUn !== user.un) {
      payload.new_un = nextUn
    }
    if (nextEmail !== (user.email ?? '')) {
      // Пустая строка = стереть email, поэтому именно null, а не ''.
      payload.email = nextEmail === '' ? null : nextEmail
    }

    // В payload остался один `un` — значит, ничего не поменяли.
    if (Object.keys(payload).length === 1) {
      return null
    }

    try {
      await updateUser(payload)

      if (payload.new_un) {
        // Логин стоит в адресе страницы — после переименования уходим на новый.
        navigate(userPath(payload.new_un), { replace: true })
      } else {
        reload()
      }

      return null
    } catch (error) {
      return apiErrorText(error, t('people.user.saveError'))
    }
  }

  const handleSaveRole = async (roleKey: string): Promise<string | null> => {
    try {
      await updateUser({ un: user.un, role: roleKey })
      reload()
      return null
    } catch (error) {
      return apiErrorText(error, t('people.user.saveError'))
    }
  }

  const handleToggleLock = (nextLocked: boolean) => {
    setAccessBusy(true)
    setAccessError(null)

    void lockUser(user.un, nextLocked)
      .then(() => reload())
      .catch((error: unknown) =>
        setAccessError(apiErrorText(error, t('people.users.lockError'))),
      )
      .finally(() => setAccessBusy(false))
  }

  const handleIssueResetCode = () => {
    setAccessBusy(true)
    setAccessError(null)

    void createResetCode(user.un)
      .then((code) => setResetCode(code))
      .catch((error: unknown) =>
        setAccessError(apiErrorText(error, t('people.user.resetCodeError'))),
      )
      .finally(() => setAccessBusy(false))
  }

  const handleDelete = () => {
    setDeleteBusy(true)
    setDeleteError(null)

    void deleteUser(user.un)
      .then(() => navigate(PEOPLE_PATHS.users, { replace: true }))
      .catch((error: unknown) =>
        setDeleteError(apiErrorText(error, t('people.user.deleteError'))),
      )
      .finally(() => {
        setDeleteBusy(false)
        setConfirmDelete(false)
      })
  }

  return (
    <>
      {backLink}

      <div className={styles.head}>
        <Avatar name={user.name} size="lg" />
        <div className={styles.headText}>
          <h1>{user.name}</h1>
          <p className={styles.meta}>
            {[user.un, companyName]
              .filter(Boolean)
              .join(` ${t('common.dot')} `)}
          </p>
        </div>
        <StatusBadge variant={status} label={t(STATUS_LABEL_KEYS[status])} />
      </div>

      <div className={styles.columns}>
        <UserProfileCard
          user={user}
          roles={roles}
          companyName={companyName}
          canChangeRole={canManage}
          onSaveProfile={handleSaveProfile}
          onSaveRole={handleSaveRole}
        />

        <div className={styles.side}>
          <UserAccessCard
            locked={locked}
            canLock={canManage}
            busy={accessBusy}
            error={accessError}
            onToggleLock={handleToggleLock}
            onIssueResetCode={handleIssueResetCode}
          />
          <UserDangerZone
            canDelete={canManage}
            busy={deleteBusy}
            error={deleteError}
            onDelete={() => setConfirmDelete(true)}
          />
        </div>
      </div>

      {confirmDelete ? (
        <Modal
          title={t('people.user.deleteConfirmTitle', { name: user.name })}
          onClose={() => setConfirmDelete(false)}
          actions={
            <>
              <Button
                variant="ghost"
                disabled={deleteBusy}
                onClick={() => setConfirmDelete(false)}
              >
                {t('common.cancel')}
              </Button>
              <Button
                variant="danger"
                disabled={deleteBusy}
                onClick={handleDelete}
              >
                {t('people.user.deleteConfirm')}
              </Button>
            </>
          }
        >
          <p className={styles.confirmText}>
            {t('people.user.deleteConfirmText')}
          </p>
        </Modal>
      ) : null}

      {resetCode ? (
        <ResetCodeModal
          resetCode={resetCode}
          userName={user.name}
          onClose={() => setResetCode(null)}
        />
      ) : null}
    </>
  )
}
