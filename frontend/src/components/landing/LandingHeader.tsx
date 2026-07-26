import { Link } from 'react-router-dom'
// TODO(assets): по макету знак лежит в `assets/landing/`. Сейчас файл в
// `assets/` — при переносе поправить путь здесь и в LandingFooter.
import logoMark from '../../assets/logo-mark-light.png'
import styles from './LandingHeader.module.css'

/** Шапка лендинга: знак + название слева, кнопка «Sign in» справа. */
export function LandingHeader() {
  return (
    <header className={styles.header}>
      <div className={styles.brand}>
        {/* alt="" — знак декоративный, название написано текстом рядом. */}
        <img className={styles.logo} src={logoMark} alt="" aria-hidden="true" />
        <span className={styles.brandName}>Software Academy</span>
      </div>
      <Link className={styles.signIn} to="/login">
        Sign in
      </Link>
    </header>
  )
}
