import { useTranslation } from 'react-i18next'
import { DashboardCard } from './DashboardCard'
import { Chip } from '../ui/Chip'
import { DataTable, type DataTableColumn } from '../ui/DataTable'
import type { MasterRecentUser } from '../../types/api'
import styles from './RecentTable.module.css'

type RecentUsersProps = {
  users: MasterRecentUser[]
}

/** «Recent users»: последние заведённые пользователи платформы. */
export function RecentUsers({ users }: RecentUsersProps) {
  const { t } = useTranslation()

  const columns: DataTableColumn<MasterRecentUser>[] = [
    {
      key: 'user',
      header: t('masterDashboard.recentUsers.colUser'),
      cell: (user) => (
        <>
          <span className={styles.main}>{user.name}</span>
          <span className={styles.dim}>{user.un}</span>
        </>
      ),
    },
    {
      key: 'company',
      header: t('masterDashboard.recentUsers.colCompany'),
      cell: (user) => <span className={styles.dim}>{user.company_name}</span>,
    },
    {
      key: 'role',
      // role_key приходит с бэкенда как есть («user», «inspector») — это
      // данные, а не строка интерфейса, поэтому через словарь не проводим.
      header: t('masterDashboard.recentUsers.colRole'),
      cell: (user) => <Chip>{user.role_key}</Chip>,
    },
  ]

  return (
    <DashboardCard
      title={t('masterDashboard.recentUsers.title')}
      meta={
        users.length > 0
          ? t('masterDashboard.last', { n: users.length })
          : undefined
      }
    >
      <DataTable
        columns={columns}
        rows={users}
        rowKey={(user) => user.id}
        emptyText={t('masterDashboard.recentUsers.empty')}
      />
    </DashboardCard>
  )
}
