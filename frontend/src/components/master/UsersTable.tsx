import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { RoleChip } from './RoleChip'
import { DataTable, type DataTableColumn } from '../ui/DataTable'
import { StatusBadge } from '../ui/StatusBadge'
import { Switch } from '../ui/Switch'
import { userPath } from '../../constants/routes'
import { activeRole, isLocked, type UserOut } from '../../types/api'
import { userStatus, type UserStatus } from '../../utils/users'
import styles from './UsersTable.module.css'

/** Ключ i18n для подписи статуса. Явная таблица — чтобы ключи проверялись. */
const STATUS_LABEL_KEYS = {
  active: 'people.users.statusActive',
  pending: 'people.users.statusPending',
  locked: 'people.users.statusLocked',
} as const satisfies Record<UserStatus, string>

type UsersTableProps = {
  users: UserOut[]
  /** Ключ роли → её название с бэкенда. Нет названия — покажем сам ключ. */
  roleNames: Record<string, string>
  /**
   * id компании → название. `null` = колонку Company не показываем: названий
   * взять неоткуда (справочник компаний доступен только master), а у всех
   * остальных ролей список и так состоит из одной их компании.
   */
  companyNames: ReadonlyMap<number, string> | null
  /** Логин текущего пользователя: свой доступ закрыть нельзя (запрет бэка). */
  currentUn: string | null
  /** Логин строки, по которой прямо сейчас идёт запрос блокировки. */
  busyUn: string | null
  onToggleLock: (user: UserOut, nextLocked: boolean) => void
  emptyText: string
}

/** Таблица пользователей: кто, где, кем работает и открыт ли ему вход. */
export function UsersTable({
  users,
  roleNames,
  companyNames,
  currentUn,
  busyUn,
  onToggleLock,
  emptyText,
}: UsersTableProps) {
  const { t } = useTranslation()

  const columns: DataTableColumn<UserOut>[] = [
    {
      key: 'user',
      header: t('people.users.colUser'),
      cell: (user) => (
        <>
          <Link className={styles.name} to={userPath(user.un)}>
            {user.name}
          </Link>
          <span className={styles.dim}>{user.un}</span>
        </>
      ),
    },
    {
      key: 'role',
      header: t('people.users.colRole'),
      cell: (user) => {
        const role = activeRole(user.privileges)

        return (
          <RoleChip
            role={role}
            name={role ? (roleNames[role] ?? role) : t('people.users.noValue')}
          />
        )
      },
    },
    {
      key: 'status',
      header: t('people.users.colStatus'),
      cell: (user) => {
        const status = userStatus(user)

        return (
          <StatusBadge variant={status} label={t(STATUS_LABEL_KEYS[status])} />
        )
      },
    },
    {
      key: 'created',
      header: t('people.users.colCreated'),
      // Даты создания в UserOut пока нет — колонку держим пустой, чтобы
      // добавить значение одной строкой, когда поле появится у бэкенда.
      cell: () => (
        <span className={styles.dim}>{t('people.users.noValue')}</span>
      ),
      hideOnNarrow: true,
    },
    {
      key: 'access',
      header: t('people.users.colAccess'),
      align: 'right',
      cell: (user) => {
        const locked = isLocked(user.privileges)
        // master — singleton-роль вендора, его не блокируют (docs/06 §3);
        // себя тоже нельзя. В обоих случаях бэкенд откажет, поэтому
        // переключатель выключаем заранее.
        const isProtected =
          activeRole(user.privileges) === 'master' || user.un === currentUn

        return (
          <Switch
            checked={!locked}
            disabled={isProtected || busyUn === user.un}
            label={t(
              locked ? 'people.users.unlockAction' : 'people.users.lockAction',
              { name: user.name },
            )}
            onChange={(nextActive) => onToggleLock(user, !nextActive)}
          />
        )
      },
    },
  ]

  if (companyNames) {
    // Компания идёт сразу после пользователя — как в макете.
    columns.splice(1, 0, {
      key: 'company',
      header: t('people.users.colCompany'),
      cell: (user) => (
        <span className={styles.dim}>
          {companyNames.get(user.companyid) ?? t('people.users.noValue')}
        </span>
      ),
    })
  }

  return (
    <>
      <DataTable
        columns={columns}
        rows={users}
        rowKey={(user) => user.id}
        emptyText={emptyText}
      />
      {users.length > 0 ? (
        <p className={styles.foot}>
          {t('people.users.total', { n: users.length })}
        </p>
      ) : null}
    </>
  )
}
