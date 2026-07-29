import { useTranslation } from 'react-i18next'
import styles from './LandingValues.module.css'

/* Порядок карточек = нумерация. Тексты живут в словаре, здесь только ключи;
   `as const` нужен, чтобы TypeScript проверил ключи по словарю. */
const VALUES = [
  {
    number: '01',
    titleKey: 'landing.values.duration.title',
    textKey: 'landing.values.duration.text',
  },
  {
    number: '02',
    titleKey: 'landing.values.role.title',
    textKey: 'landing.values.role.text',
  },
  {
    number: '03',
    titleKey: 'landing.values.progress.title',
    textKey: 'landing.values.progress.text',
  },
] as const

/** Три нумерованные карточки: чем полезна Академия. */
export function LandingValues() {
  const { t } = useTranslation()

  return (
    <section className={styles.values} aria-labelledby="values-heading">
      <h2 id="values-heading" className="sr-only">
        {t('landing.values.heading')}
      </h2>

      <div className={styles.grid}>
        {VALUES.map((value) => (
          <div key={value.number} className={styles.card}>
            {/* Номер декоративный: смысл несёт заголовок карточки. */}
            <span className={styles.number} aria-hidden="true">
              {value.number}
            </span>
            <h3 className={styles.title}>{t(value.titleKey)}</h3>
            <p className={styles.text}>{t(value.textKey)}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
