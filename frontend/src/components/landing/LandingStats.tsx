import { ChartIcon, PlayIcon, UsersIcon } from './LandingIcons'
import styles from './LandingStats.module.css'

/** Три одинаковые карточки-факта под hero. */
export function LandingStats() {
  return (
    <section className={styles.stats} aria-labelledby="stats-heading">
      {/* Заголовок в макете не нарисован, но секции нужен h2 — прячем его
          от глаз и оставляем для скринридера. */}
      <h2 id="stats-heading" className="sr-only">
        What you get
      </h2>

      <div className={styles.grid}>
        <div className={styles.card}>
          <PlayIcon className={styles.icon} />
          <p className={styles.value}>3–5 min</p>
          <p className={styles.caption}>per onboarding guide</p>
        </div>

        <div className={styles.card}>
          <UsersIcon className={styles.icon} />
          <p className={styles.value}>By role</p>
          <p className={styles.caption}>tailored guide sets</p>
        </div>

        <div className={styles.card}>
          <ChartIcon className={styles.icon} />
          <p className={styles.value}>Personal progress</p>
          <p className={styles.caption}>Continue right where you left off.</p>
        </div>
      </div>
    </section>
  )
}
