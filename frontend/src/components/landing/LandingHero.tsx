import { Link } from 'react-router-dom'
// TODO(assets): по макету сцена лежит в `assets/landing/hero-scene.png`.
// Сейчас файл в `assets/` — при переносе поправить путь.
import heroScene from '../../assets/hero-scene.png'
import styles from './LandingHero.module.css'

/**
 * Главный блок: одна мятная карточка.
 *
 * Порядок в разметке — сначала текст, потом картинка. Так на мобильном
 * сцена сама встаёт ПОД текстом без лишних правил, а на десктопе мы её
 * вырываем из потока (position: absolute) и прижимаем вправо.
 */
export function LandingHero() {
  return (
    <section className={styles.hero}>
      <div className={styles.content}>
        <p className={styles.label}>
          <span aria-hidden="true">●</span> USER ONBOARDING FOR INDUSTRIAL TEAMS
        </p>
        <h1 className={styles.title}>
          Find the instruction in five minutes.{' '}
          <span className={styles.titleAccent}>Continue your work.</span>
        </h1>
        <Link className={styles.cta} to="/login">
          Start onboarding <span aria-hidden="true">→</span>
        </Link>
        <p className={styles.note}>Access granted by your company manager</p>
      </div>
      <img
        className={styles.scene}
        src={heroScene}
        alt="Onboarding presentation on a digital board"
      />
    </section>
  )
}
