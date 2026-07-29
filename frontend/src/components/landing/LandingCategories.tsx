import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import {
  InspectionIcon,
  InstallationIcon,
  ManagementIcon,
  WeldingIcon,
} from './LandingIcons'
import styles from './LandingCategories.module.css'

/* Тексты живут в словаре, здесь — только ключи и иконки. `as const` нужен,
   чтобы TypeScript проверил ключи по словарю, а не принял любую строку. */
const CATEGORIES = [
  {
    titleKey: 'landing.categories.welding.title',
    textKey: 'landing.categories.welding.text',
    Icon: WeldingIcon,
  },
  {
    titleKey: 'landing.categories.inspection.title',
    textKey: 'landing.categories.inspection.text',
    Icon: InspectionIcon,
  },
  {
    titleKey: 'landing.categories.installation.title',
    textKey: 'landing.categories.installation.text',
    Icon: InstallationIcon,
  },
  {
    titleKey: 'landing.categories.management.title',
    textKey: 'landing.categories.management.text',
    Icon: ManagementIcon,
  },
] as const

/**
 * Секция «CATEGORIES» — один залитый блок с подсветкой.
 *
 * Карточки НЕ ссылки: все четыре всё равно вели на /login, поэтому переход
 * один — кнопка под сеткой. Карточки остались витриной направлений.
 */
export function LandingCategories() {
  const { t } = useTranslation()

  return (
    <section className={styles.panel} aria-labelledby="categories-heading">
      {/* Декоративная подсветка блока — отдельный слой под контентом. */}
      <span className={styles.glow} aria-hidden="true" />

      <div className={styles.content}>
        <p className={styles.label}>{t('landing.categories.label')}</p>
        <h2 id="categories-heading" className={styles.heading}>
          {t('landing.categories.heading')}
        </h2>

        <ul className={styles.grid}>
          {CATEGORIES.map(({ titleKey, textKey, Icon }) => (
            <li key={titleKey} className={styles.card}>
              <span className={styles.iconBox}>
                <Icon className={styles.icon} />
              </span>
              <h3 className={styles.title}>{t(titleKey)}</h3>
              <p className={styles.text}>{t(textKey)}</p>
            </li>
          ))}
        </ul>

        <Link className={styles.cta} to="/login">
          {t('landing.categories.cta')}{' '}
          <span aria-hidden="true">{t('common.arrow')}</span>
        </Link>
      </div>
    </section>
  )
}
