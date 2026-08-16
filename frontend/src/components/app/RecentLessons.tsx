import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { StatusBadge, type StatusVariant } from '../ui/StatusBadge'
import type { LessonWithStatus } from '../../types/api'
import { toLessonStatus, type LessonStatus } from '../../utils/lessons'
import { AppSection } from './AppSection'
import { LessonThumb } from './LessonThumb'
import styles from './RecentLessons.module.css'

interface RecentLessonsProps {
  lessons: LessonWithStatus[]
  /** Куда ведёт строка списка. */
  lessonTo: string
}

/**
 * Как показать статус урока: точка нужного цвета (общий `ui/StatusBadge`)
 * и подпись из словаря. Таблицей, а не ветвлениями — новый статус потребует
 * одной строки, и TypeScript сразу потребует его сюда добавить.
 */
const STATUS_VIEW = {
  not_started: {
    variant: 'notStarted',
    labelKey: 'app.dashboard.status.notStarted',
  },
  in_progress: {
    variant: 'inProgress',
    labelKey: 'app.dashboard.status.inProgress',
  },
  completed: {
    variant: 'completed',
    labelKey: 'app.dashboard.status.completed',
  },
  // `as const` обязателен: без него ключи словаря стали бы просто `string`
  // и проверка ключей i18n потерялась бы (см. frontend/CLAUDE.md).
} as const satisfies Record<
  LessonStatus,
  { variant: StatusVariant; labelKey: string }
>

/** «Recently watched» — компактный список последних открытых уроков. */
export function RecentLessons({ lessons, lessonTo }: RecentLessonsProps) {
  const { t } = useTranslation()

  return (
    <AppSection title={t('app.dashboard.recent.title')}>
      <ul className={styles.list}>
        {lessons.map((lesson) => {
          const view = STATUS_VIEW[toLessonStatus(lesson.status)]

          return (
            <li key={lesson.id}>
              <Link className={styles.row} to={lessonTo}>
                <LessonThumb size="small" />
                <span className={styles.title}>{lesson.title}</span>
                <StatusBadge variant={view.variant} label={t(view.labelKey)} />
              </Link>
            </li>
          )
        })}
      </ul>
    </AppSection>
  )
}
