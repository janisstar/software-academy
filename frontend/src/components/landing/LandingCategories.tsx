import type { ComponentType } from 'react'
import { Link } from 'react-router-dom'
import {
  InspectionIcon,
  InstallationIcon,
  ManagementIcon,
  WeldingIcon,
} from './LandingIcons'
import styles from './LandingCategories.module.css'

interface Category {
  title: string
  text: string
  Icon: ComponentType<{ size?: number; className?: string }>
}

const CATEGORIES: Category[] = [
  {
    title: 'Welding',
    text: 'Daily reports, logs, and sign-offs.',
    Icon: WeldingIcon,
  },
  {
    title: 'Inspection',
    text: 'Reports, checklists, and approvals.',
    Icon: InspectionIcon,
  },
  {
    title: 'Installation',
    text: 'Hours, tasks, and site workflows.',
    Icon: InstallationIcon,
  },
  {
    title: 'Management & analytics',
    text: 'Team reports, completion, and oversight.',
    Icon: ManagementIcon,
  },
]

/**
 * Секция «CATEGORIES» — один залитый блок с подсветкой.
 *
 * Карточки НЕ ссылки: все четыре всё равно вели на /login, поэтому переход
 * один — кнопка под сеткой. Карточки остались витриной направлений.
 */
export function LandingCategories() {
  return (
    <section className={styles.panel} aria-labelledby="categories-heading">
      {/* Декоративная подсветка блока — отдельный слой под контентом. */}
      <span className={styles.glow} aria-hidden="true" />

      <div className={styles.content}>
        <p className={styles.label}>CATEGORIES</p>
        <h2 id="categories-heading" className={styles.heading}>
          Pick a topic. Find your guide.
        </h2>

        <ul className={styles.grid}>
          {CATEGORIES.map(({ title, text, Icon }) => (
            <li key={title} className={styles.card}>
              <span className={styles.iconBox}>
                <Icon className={styles.icon} />
              </span>
              <h3 className={styles.title}>{title}</h3>
              <p className={styles.text}>{text}</p>
            </li>
          ))}
        </ul>

        <Link className={styles.cta} to="/login">
          Peek inside <span aria-hidden="true">→</span>
        </Link>
      </div>
    </section>
  )
}
