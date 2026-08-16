import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { StatusBadge, type StatusVariant } from '../ui/StatusBadge'
import type { LessonWithStatus } from '../../types/api'
import {
  formatDuration,
  toLessonStatus,
  type LessonStatus,
} from '../../utils/lessons'
import { ClockGlyph } from './AppIcons'
import styles from './LessonCard.module.css'

interface LessonCardProps {
  lesson: LessonWithStatus
  /** Куда ведёт карточка — страница этого урока. */
  to: string
}

/**
 * Как показать статус урока: точка нужного цвета (общий `ui/StatusBadge`)
 * и подпись из словаря. Таблицей, а не ветвлениями — новый статус потребует
 * одной строки, и TypeScript сразу потребует его сюда добавить.
 */
const STATUS_VIEW = {
  not_started: {
    variant: 'notStarted',
    labelKey: 'app.lessons.status.notStarted',
  },
  in_progress: {
    variant: 'inProgress',
    labelKey: 'app.lessons.status.inProgress',
  },
  completed: {
    variant: 'completed',
    labelKey: 'app.lessons.status.completed',
  },
  // `as const` обязателен: без него ключи словаря стали бы просто `string`
  // и проверка ключей i18n потерялась бы (см. frontend/CLAUDE.md).
} as const satisfies Record<
  LessonStatus,
  { variant: StatusVariant; labelKey: string }
>

/**
 * Карточка урока в учебном каталоге: название, описание одной строкой,
 * длительность и статус. Кликабельна целиком — крупная цель для пальца.
 *
 * Почему карточка, а не строка таблицы (как у master в Content): там
 * инструмент управления с колонками, здесь витрина, которую открывают
 * с телефона в цеху.
 */
export function LessonCard({ lesson, to }: LessonCardProps) {
  const { t } = useTranslation()

  const status = toLessonStatus(lesson.status)
  const view = STATUS_VIEW[status]

  // Полоску прогресса показываем ТОЛЬКО у начатых уроков: у остальных её
  // нет вовсе — пустая дорожка была бы шумом на каждой карточке.
  const showProgress = status === 'in_progress'
  const percent = Math.min(100, Math.max(0, Math.round(lesson.watch_percent)))

  return (
    <Link className={styles.card} to={to}>
      <div className={styles.head}>
        <h3 className={styles.title}>{lesson.title}</h3>
        {/* Шеврон — украшение: о том, что карточка ведёт на урок, уже
            сообщает сама ссылка. */}
        <span className={styles.chevron} aria-hidden="true">
          {t('common.chevron')}
        </span>
      </div>

      {lesson.description ? (
        <p className={styles.description}>{lesson.description}</p>
      ) : null}

      <div className={styles.meta}>
        <span className={styles.duration}>
          <ClockGlyph />
          {formatDuration(lesson.duration_seconds)}
        </span>
        <StatusBadge variant={view.variant} label={t(view.labelKey)} strong />
      </div>

      {showProgress ? (
        // Процент уже сказан словами в статусе рядом, поэтому полоса —
        // декоративная (тот же приём, что у master в PopularLessons).
        <span className={styles.progress} aria-hidden="true">
          <span
            className={styles.progressFill}
            style={{ width: `${percent}%` }}
          />
        </span>
      ) : null}
    </Link>
  )
}
