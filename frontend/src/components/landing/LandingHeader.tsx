import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
// TODO(assets): по макету знак лежит в `assets/landing/`. Сейчас файл в
// `assets/` — при переносе поправить путь здесь и в LandingFooter.
import logoMark from '../../assets/logo-mark-light.png'
import styles from './LandingHeader.module.css'

/** Шапка лендинга: знак + название слева, кнопка «Sign in» справа. */
export function LandingHeader() {
  const { t } = useTranslation()

  return (
    <header className={styles.header}>
      <div className={styles.brand}>
        {/* alt="" — знак декоративный, название написано текстом рядом. */}
        <img className={styles.logo} src={logoMark} alt="" aria-hidden="true" />
        <span className={styles.brandName}>{t('brand.name')}</span>
      </div>
      <Link className={styles.signIn} to="/login">
        {t('common.signIn')}
      </Link>
    </header>
  )
}
