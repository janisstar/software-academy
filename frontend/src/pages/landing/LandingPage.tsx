import { Link } from 'react-router-dom'
import styles from './LandingPage.module.css'

/**
 * Публичная витрина. Пока только каркас: дизайн и секции (Header, Hero…)
 * появятся в `components/landing/` на этапе дизайна.
 */
export function LandingPage() {
  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <h1>Software Academy</h1>
        <p className={styles.tagline}>
          Короткие видеоуроки для команд на производстве — нужный ответ за пару
          минут.
        </p>
        <Link className={styles.cta} to="/login">
          Войти
        </Link>
      </section>
    </div>
  )
}
