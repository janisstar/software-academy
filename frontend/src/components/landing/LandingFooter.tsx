import { useTranslation } from 'react-i18next'
// TODO(assets): по макету знак лежит в `assets/landing/` — см. LandingHeader.
import logoMark from '../../assets/logo-mark-light.png'
import styles from './LandingFooter.module.css'

/**
 * Подвал лендинга. «Privacy» и «Terms» — пока span-заглушки:
 * страниц ещё нет, а неработающая ссылка сбивает с толку.
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
        <span>{t('landing.footer.privacy')}</span>{' '}
        <span aria-hidden="true">·</span>{' '}
        <span>{t('landing.footer.terms')}</span>
      </p>
    </footer>
  )
}
