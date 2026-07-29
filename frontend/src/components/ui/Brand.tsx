import { useTranslation } from 'react-i18next'
// TODO(assets): по макету знак лежит в `assets/landing/`. Сейчас файл в
// `assets/` — при переносе поправить путь здесь, в LandingHeader и LandingFooter.
import logoMark from '../../assets/logo-mark-light.png'
import styles from './Brand.module.css'

interface BrandProps {
  className?: string
}

/** Логотип продукта: знак + название. Общий для всех областей интерфейса. */
export function Brand({ className }: BrandProps) {
  const { t } = useTranslation()

  return (
    <span className={[styles.brand, className].filter(Boolean).join(' ')}>
      {/* alt="" — знак декоративный, название написано текстом рядом. */}
      <img className={styles.logo} src={logoMark} alt="" aria-hidden="true" />
      <span className={styles.name}>{t('brand.name')}</span>
    </span>
  )
}
