import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { lockUser } from '../../api/users'
import { PageShell } from '../../components/master/PageShell'
import { UsersTable } from '../../components/master/UsersTable'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import {
  SegmentedTabs,
  type SegmentedTabItem,
} from '../../components/ui/SegmentedTabs'
import { Select } from '../../components/ui/Select'
import { PEOPLE_PATHS } from '../../constants/routes'
import { useAuth } from '../../hooks/useAuth'
import { useUsersList } from '../../hooks/useUsersList'
import { activeRole, type UserOut } from '../../types/api'
import { userStatus } from '../../utils/users'
import styles from './UsersPage.module.css'

/** Фильтр по состоянию аккаунта. Считается на уже загруженном списке. */
type UsersTab = 'all' | 'pending' | 'locked'

/** Значение «все компании» в селекте: у <option> значение всегда строка. */
const ALL_COMPANIES = ''

export function UsersPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { user } = useAuth()

  // Фильтр по компании доступен только master: остальным бэкенд и так отдаёт
  // одну их компанию, а справочник компаний им закрыт.
  const isMaster = user ? activeRole(user.privileges) === 'master' : false

  const [companyId, setCompanyId] = useState<number | null>(null)
  const [tab, setTab] = useState<UsersTab>('all')
  // Логин строки, по которой идёт запрос блокировки: её переключатель замирает.
  const [busyUn, setBusyUn] = useState<string | null>(null)
  const [lockFailed, setLockFailed] = useState(false)

  const { users, roles, companies, loading, failed, reload } = useUsersList({
    companyId,
    withCompanies: isMaster,
  })

  // Ключ роли → её название с бэкенда.
  const roleNames = useMemo(
    () => Object.fromEntries(roles.map((role) => [role.key, role.name])),
    [roles],
  )

  // id компании → название. Без справочника колонку не показываем вовсе.
  const companyNames = useMemo(
    () =>
      isMaster
        ? new Map(companies.map((company) => [company.id, company.name]))
        : null,
    [companies, isMaster],
  )

  const counts = useMemo(() => {
    const statuses = users.map(userStatus)

    return {
      all: statuses.length,
      pending: statuses.filter((status) => status === 'pending').length,
      locked: statuses.filter((status) => status === 'locked').length,
    }
  }, [users])

  const visibleUsers = useMemo(
    () => (tab === 'all' ? users : users.filter((u) => userStatus(u) === tab)),
    [users, tab],
  )

  const tabs: SegmentedTabItem<UsersTab>[] = [
    { value: 'all', label: t('people.users.tabAll', { n: counts.all }) },
    {
      value: 'pending',
      label: t('people.users.tabPending', { n: counts.pending }),
    },
    {
      value: 'locked',
      label: t('people.users.tabLocked', { n: counts.locked }),
    },
  ]

  const handleToggleLock = (target: UserOut, nextLocked: boolean) => {
    setBusyUn(target.un)
    setLockFailed(false)

    void (async () => {
      try {
        await lockUser(target.un, nextLocked)
        // Перечитываем список: блокировка меняет privileges пользователя.
        reload()
      } catch {
        // Состояние переключателя не трогаем — оно и так рисуется по данным
        // с бэкенда, которые не изменились.
        setLockFailed(true)
      } finally {
        setBusyUn(null)
      }
    })()
  }

  return (
    <PageShell
      eyebrow={t('people.users.eyebrow')}
      title={t('people.users.title')}
      actions={
        <Button onClick={() => navigate(PEOPLE_PATHS.newUser)}>
          {t('people.users.addUser')}
        </Button>
      }
    >
      <div className={styles.toolbar}>
        <SegmentedTabs
          items={tabs}
          value={tab}
          onChange={setTab}
          label={t('people.users.tabsLabel')}
        />

        {isMaster ? (
          <Select
            aria-label={t('people.users.companyFilter')}
            value={companyId === null ? ALL_COMPANIES : String(companyId)}
            onChange={(event) =>
              setCompanyId(
                event.target.value === ALL_COMPANIES
                  ? null
                  : Number(event.target.value),
              )
            }
          >
            <option value={ALL_COMPANIES}>
              {t('people.users.allCompanies')}
            </option>
            {companies.map((company) => (
              <option key={company.id} value={company.id}>
                {company.name}
              </option>
            ))}
          </Select>
        ) : null}
      </div>

      {lockFailed ? (
        <p className={styles.lockError} role="alert">
          {t('people.users.lockError')}
        </p>
      ) : null}

      {/* Три состояния взаимоисключающие: грузим → ошибка → данные. */}
      {loading ? <Card>{t('common.loading')}</Card> : null}

      {failed ? (
        <Card className={styles.error}>
          <p>{t('people.users.error')}</p>
          <Button onClick={reload}>{t('people.users.retry')}</Button>
        </Card>
      ) : null}

      {!loading && !failed ? (
        <Card>
          <UsersTable
            users={visibleUsers}
            roleNames={roleNames}
            companyNames={companyNames}
            currentUn={user?.un ?? null}
            busyUn={busyUn}
            onToggleLock={handleToggleLock}
            emptyText={t('people.users.empty')}
          />
        </Card>
      ) : null}
    </PageShell>
  )
}
