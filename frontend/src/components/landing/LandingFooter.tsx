// TODO(assets): по макету знак лежит в `assets/landing/` — см. LandingHeader.
import logoMark from '../../assets/logo-mark-light.png'
import styles from './LandingFooter.module.css'

/**
 * Подвал лендинга. «Privacy» и «Terms» — пока span-заглушки:
 * страниц ещё нет, а неработающая ссылка сбивает с толку.
 */
export function LandingFooter() {
  return (
    <footer className={styles.footer}>
      <div className={styles.brand}>
        <img className={styles.logo} src={logoMark} alt="" aria-hidden="true" />
        <span className={styles.copy}>© SevenHeaven AI · Software Academy</span>
      </div>
      <p className={styles.legal}>
        <span>Privacy</span> <span aria-hidden="true">·</span> <span>Terms</span>
      </p>
    </footer>
  )
}
