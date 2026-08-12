import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
// TODO(assets): по макету знак лежит в `assets/landing/` — см. LandingHeader.
import logoMark from '../../assets/logo-mark-light.png'
import { LEGAL_PATHS } from '../../constants/routes'
import styles from './LandingFooter.module.css'

/**
 * Подвал лендинга. «Privacy» и «Terms» ведут на публичные страницы текстов —
 * те же, что открываются с экрана согласий при первом входе.
 */
export function LandingFooter() {
  const { t } = useTranslation()

  return (
    <footer className={styles.footer}>
      <div className={styles.brand}>
        <img className={styles.logo} src={logoMark} alt="" aria-hidden="true" />
        <span className={styles.copy}>{t('brand.copyright')}</span>
      </div>
      <p className={styles.legal}>
        <Link className={styles.link} to={LEGAL_PATHS.privacy}>
          {t('landing.footer.privacy')}
        </Link>{' '}
        <span aria-hidden="true">·</span>{' '}
        <Link className={styles.link} to={LEGAL_PATHS.terms}>
          {t('landing.footer.terms')}
        </Link>
      </p>
    </footer>
  )
}
