import { useTranslation } from 'react-i18next'
import { DashboardCard } from './DashboardCard'
import { DataTable, type DataTableColumn } from '../ui/DataTable'
import type { MasterRecentCompany } from '../../types/api'
import { formatShortDate } from '../../utils/date'
import styles from './RecentTable.module.css'

type RecentCompaniesProps = {
  companies: MasterRecentCompany[]
}

/** «Recent companies»: последние заведённые компании. */
export function RecentCompanies({ companies }: RecentCompaniesProps) {
  const { t } = useTranslation()

  const columns: DataTableColumn<MasterRecentCompany>[] = [
    {
      key: 'company',
      header: t('masterDashboard.recentCompanies.colCompany'),
      cell: (company) => <span className={styles.main}>{company.name}</span>,
    },
    {
      key: 'created',
      header: t('masterDashboard.recentCompanies.colCreated'),
      cell: (company) => (
        <span className={styles.dim}>
          {formatShortDate(company.created_at)}
        </span>
      ),
    },
  ]

  return (
    <DashboardCard
      title={t('masterDashboard.recentCompanies.title')}
      meta={
        companies.length > 0
          ? t('masterDashboard.last', { n: companies.length })
          : undefined
      }
    >
      <DataTable
        columns={columns}
        rows={companies}
        rowKey={(company) => company.id}
        emptyText={t('masterDashboard.recentCompanies.empty')}
      />
    </DashboardCard>
  )
}
