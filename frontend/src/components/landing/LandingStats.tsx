import { useTranslation } from 'react-i18next'
import { ChartIcon, PlayIcon, UsersIcon } from './LandingIcons'
import styles from './LandingStats.module.css'

/** Три одинаковые карточки-факта под hero. */
export function LandingStats() {
  const { t } = useTranslation()

  return (
    <section className={styles.stats} aria-labelledby="stats-heading">
      {/* Заголовок в макете не нарисован, но секции нужен h2 — прячем его
          от глаз и оставляем для скринридера. */}
      <h2 id="stats-heading" className="sr-only">
        {t('landing.stats.heading')}
      </h2>

      <div className={styles.grid}>
        <div className={styles.card}>
          <PlayIcon className={styles.icon} />
          <p className={styles.value}>{t('landing.stats.durationValue')}</p>
          <p className={styles.caption}>{t('landing.stats.durationCaption')}</p>
        </div>

        <div className={styles.card}>
          <UsersIcon className={styles.icon} />
          <p className={styles.value}>{t('landing.stats.roleValue')}</p>
          <p className={styles.caption}>{t('landing.stats.roleCaption')}</p>
        </div>

        <div className={styles.card}>
          <ChartIcon className={styles.icon} />
          <p className={styles.value}>{t('landing.stats.progressValue')}</p>
          <p className={styles.caption}>{t('landing.stats.progressCaption')}</p>
        </div>
      </div>
    </section>
  )
}
