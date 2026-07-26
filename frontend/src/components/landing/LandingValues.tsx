import styles from './LandingValues.module.css'

/** Данные карточек рядом с разметкой: три пункта, порядок = нумерация. */
const VALUES = [
  {
    number: '01',
    title: '3–5 minutes per guide',
    text: 'One task, one short guide. No extra theory.',
  },
  {
    number: '02',
    title: 'Onboarding for your role',
    text: 'Manager, welder, inspector, fitter — only what you need.',
  },
  {
    number: '03',
    title: 'Personal progress',
    text: 'Continue right where you left off.',
  },
]

/** Три нумерованные карточки: чем полезна Академия. */
export function LandingValues() {
  return (
    <section className={styles.values} aria-labelledby="values-heading">
      <h2 id="values-heading" className="sr-only">
        How it works
      </h2>

      <div className={styles.grid}>
        {VALUES.map((value) => (
          <div key={value.number} className={styles.card}>
            {/* Номер декоративный: смысл несёт заголовок карточки. */}
            <span className={styles.number} aria-hidden="true">
              {value.number}
            </span>
            <h3 className={styles.title}>{value.title}</h3>
            <p className={styles.text}>{value.text}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
