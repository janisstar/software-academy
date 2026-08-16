import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import type { LessonWithStatus } from '../../types/api'
import { formatDuration } from '../../utils/lessons'
import { AppSection } from './AppSection'
import { LessonThumb } from './LessonThumb'
import styles from './RecommendedLessons.module.css'

interface RecommendedLessonsProps {
  lessons: LessonWithStatus[]
  /** Куда ведёт карточка урока. */
  lessonTo: string
  /** Куда ведёт ссылка «All lessons →» — каталог уроков. */
  allTo: string
}

/** «Recommended for you» — сетка карточек уроков, которые человек ещё не начал. */
export function RecommendedLessons({
  lessons,
  lessonTo,
  allTo,
}: RecommendedLessonsProps) {
  const { t } = useTranslation()

  return (
    <AppSection
      title={t('app.dashboard.recommended.title')}
      action={
        <Link className={styles.all} to={allTo}>
          {t('app.dashboard.recommended.all')}{' '}
          <span aria-hidden="true">{t('common.arrow')}</span>
        </Link>
      }
    >
      <div className={styles.grid}>
        {lessons.map((lesson) => (
          // Ссылкой сделана вся карточка: попасть в неё пальцем проще, чем
          // в одно название.
          <Link key={lesson.id} className={styles.card} to={lessonTo}>
            <LessonThumb />
            <div className={styles.body}>
              <h3>{lesson.title}</h3>
              <p className={styles.meta}>
                {formatDuration(lesson.duration_seconds)}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </AppSection>
  )
}
