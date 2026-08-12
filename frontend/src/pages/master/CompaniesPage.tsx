import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { CompaniesTable } from '../../components/master/CompaniesTable'
import { PageShell } from '../../components/master/PageShell'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { PEOPLE_PATHS } from '../../constants/routes'
import { useCompaniesList } from '../../hooks/useCompaniesList'
import styles from './CompaniesPage.module.css'

export function CompaniesPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const { companies, loading, failed, reload } = useCompaniesList()

  return (
    <PageShell
      eyebrow={t('people.users.eyebrow')}
      title={t('people.companies.title')}
      actions={
        <Button onClick={() => navigate(PEOPLE_PATHS.newCompany)}>
          {t('people.companies.addCompany')}
        </Button>
      }
    >
      {/* Три состояния взаимоисключающие: грузим → ошибка → данные. */}
      {loading ? <Card>{t('common.loading')}</Card> : null}

      {failed ? (
        <Card className={styles.error}>
          <p>{t('people.companies.error')}</p>
          <Button onClick={reload}>{t('people.users.retry')}</Button>
        </Card>
      ) : null}

      {!loading && !failed ? (
        <Card>
          <CompaniesTable
            companies={companies}
            emptyText={t('people.companies.empty')}
          />
        </Card>
      ) : null}
    </PageShell>
  )
}
