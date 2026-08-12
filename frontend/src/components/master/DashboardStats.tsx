import { useTranslation } from 'react-i18next'
import { StatCard } from '../ui/StatCard'
import type { MasterDashboard } from '../../types/api'
import styles from './DashboardStats.module.css'

type DashboardStatsProps = {
  dashboard: MasterDashboard
}

/** Ряд из четырёх счётчиков в шапке дашборда. */
export function DashboardStats({ dashboard }: DashboardStatsProps) {
  const { t } = useTranslation()
  const { companies, users, content, activity } = dashboard

  return (
    <section className={styles.stats}>
      <StatCard
        label={t('masterDashboard.stats.companies')}
        value={companies.total}
        sub={
          // Заблокированных нет — уточнение не нужно, карточка чище.
          companies.locked > 0 ? (
            <span className={styles.warn}>
              {t('masterDashboard.stats.locked', { n: companies.locked })}
            </span>
          ) : null
        }
      />

      <StatCard
        label={t('masterDashboard.stats.users')}
        value={users.total}
        sub={
          <>
            {t('masterDashboard.stats.pendingFirstLogin', {
              n: users.pending_first_login,
            })}
            {users.locked > 0 ? (
              <>
                {` ${t('common.dot')} `}
                <span className={styles.warn}>
                  {t('masterDashboard.stats.locked', { n: users.locked })}
                </span>
              </>
            ) : null}
          </>
        }
      />

      <StatCard
        label={t('masterDashboard.stats.lessons')}
        value={content.lessons}
        sub={t('masterDashboard.stats.lessonsSub', {
          categories: content.categories,
          publicLessons: content.public_lessons,
        })}
      />

      <StatCard
        accent
        label={
          <>
            {/* Точка — украшение: смысл несёт подпись рядом с ней. */}
            <span className={styles.pulse} aria-hidden="true" />
            {t('masterDashboard.stats.online')}
          </>
        }
        value={activity.online_now}
        sub={t('masterDashboard.stats.onlineSub')}
      />
    </section>
  )
}
