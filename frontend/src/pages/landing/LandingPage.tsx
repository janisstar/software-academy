import { LandingCategories } from '../../components/landing/LandingCategories'
import { LandingFooter } from '../../components/landing/LandingFooter'
import { LandingHeader } from '../../components/landing/LandingHeader'
import { LandingHero } from '../../components/landing/LandingHero'
import { LandingStats } from '../../components/landing/LandingStats'
import styles from './LandingPage.module.css'

/**
 * Публичная витрина (маршрут «/»). Сама страница только собирает секции
 * из `components/landing/` — вся вёрстка живёт в них.
 *
 * Единственный h1 — в hero; у остальных секций h2.
 */
export function LandingPage() {
  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <LandingHeader />
        <LandingHero />
        <LandingStats />
        <LandingCategories />
        <LandingFooter />
      </div>
    </div>
  )
}
