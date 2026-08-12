import { useTranslation } from 'react-i18next'
import { DashboardStats } from '../../components/master/DashboardStats'
import { PageShell } from '../../components/master/PageShell'
import { PopularLessons } from '../../components/master/PopularLessons'
import { RecentCompanies } from '../../components/master/RecentCompanies'
import { RecentUsers } from '../../components/master/RecentUsers'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { useAuth } from '../../hooks/useAuth'
import { useMasterDashboard } from '../../hooks/useMasterDashboard'
import { activeRole } from '../../types/api'
import styles from './DashboardPage.module.css'

export function DashboardPage() {
  const { t } = useTranslation()
  const { user } = useAuth()

  const name = user?.name || user?.un || t('master.unknownUser')

  // Сводку платформы отдаёт только master. Остальным ролям запрос не шлём
  // вовсе — их личный дашборд будет отдельной задачей.
  const isMaster = user ? activeRole(user.privileges) === 'master' : false

  const { data, loading, failed, retry } = useMasterDashboard(isMaster)

  if (!isMaster) {
    return (
      <PageShell
        eyebrow={t('master.pages.eyebrow')}
        title={t('master.pages.greeting', { name })}
      >
        <Card>{t('common.inDevelopment')}</Card>
      </PageShell>
    )
  }

  return (
    <PageShell
      eyebrow={t('master.pages.eyebrow')}
      title={t('master.pages.greeting', { name })}
    >
      <p className={styles.caption}>{t('masterDashboard.caption')}</p>

      {/* Три состояния взаимоисключающие: грузим → ошибка → данные. */}
      {loading ? <Card>{t('common.loading')}</Card> : null}

      {failed ? (
        <Card className={styles.error}>
          <p>{t('masterDashboard.error')}</p>
          <Button onClick={retry}>{t('masterDashboard.retry')}</Button>
        </Card>
      ) : null}

      {!loading && !failed && data ? (
        <>
          <DashboardStats dashboard={data} />

          <div className={styles.row}>
            <PopularLessons
              lessons={data.activity.top_lessons}
              completionsTotal={data.activity.completions_total}
            />
            <RecentUsers users={data.recent.users} />
          </div>

          <RecentCompanies companies={data.recent.companies} />
        </>
      ) : null}
    </PageShell>
  )
}
