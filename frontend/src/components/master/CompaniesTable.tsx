import { useTranslation } from 'react-i18next'
import { DataTable, type DataTableColumn } from '../ui/DataTable'
import { StatusBadge } from '../ui/StatusBadge'
import type { CompanyOut } from '../../types/api'
import styles from './CompaniesTable.module.css'

type CompaniesTableProps = {
  companies: CompanyOut[]
  emptyText: string
}

/**
 * Таблица компаний-клиентов.
 *
 * Переключателя доступа здесь нет намеренно: блокировать компанию API пока
 * не умеет, `is_locked` можно только показать (docs/07-api-reference.md).
 */
export function CompaniesTable({ companies, emptyText }: CompaniesTableProps) {
  const { t } = useTranslation()
  // Прочерк вместо значений, которых бэкенд пока не отдаёт.
  const noValue = t('people.users.noValue')

  const columns: DataTableColumn<CompanyOut>[] = [
    {
      key: 'company',
      header: t('people.companies.colCompany'),
      cell: (company) => <span className={styles.main}>{company.name}</span>,
    },
    {
      key: 'businessid',
      header: t('people.companies.colBusinessId'),
      cell: (company) => (
        <span className={styles.dim}>{company.businessid ?? noValue}</span>
      ),
      hideOnNarrow: true,
    },
    {
      key: 'users',
      header: t('people.companies.colUsers'),
      // Числа людей в компании в ответе бэкенда нет — колонка ждёт поле.
      cell: () => <span className={styles.dim}>{noValue}</span>,
    },
    {
      key: 'status',
      header: t('people.companies.colStatus'),
      cell: (company) => (
        <StatusBadge
          variant={company.is_locked ? 'locked' : 'active'}
          label={t(
            company.is_locked
              ? 'people.users.statusLocked'
              : 'people.users.statusActive',
          )}
        />
      ),
    },
    {
      key: 'created',
      header: t('people.companies.colCreated'),
      // Даты создания в ответе бэкенда тоже пока нет.
      cell: () => <span className={styles.dim}>{noValue}</span>,
      hideOnNarrow: true,
    },
  ]

  return (
    <>
      <DataTable
        columns={columns}
        rows={companies}
        rowKey={(company) => company.id}
        emptyText={emptyText}
      />
      {companies.length > 0 ? (
        <p className={styles.foot}>
          {t('people.companies.total', { n: companies.length })}
        </p>
      ) : null}
    </>
  )
}
