import { useTranslation } from 'react-i18next'
import { DashboardCard } from './DashboardCard'
import type { MasterTopLesson } from '../../types/api'
import styles from './PopularLessons.module.css'

type PopularLessonsProps = {
  lessons: MasterTopLesson[]
  /** Всего завершений по платформе — приписка в шапке карточки. */
  completionsTotal: number
}

/** «Popular lessons»: топ уроков по числу завершений, с полосой-баром. */
export function PopularLessons({
  lessons,
  completionsTotal,
}: PopularLessonsProps) {
  const { t } = useTranslation()

  // Длину полосы считаем от самого популярного урока, а не от общего числа
  // завершений: иначе при большом total все полосы были бы почти пустыми.
  const maxCompletions = Math.max(
    0,
    ...lessons.map((lesson) => lesson.completions),
  )

  return (
    <DashboardCard
      title={t('masterDashboard.popular.title')}
      meta={t('masterDashboard.popular.total', { n: completionsTotal })}
    >
      {lessons.length === 0 ? (
        <p className={styles.empty}>{t('masterDashboard.popular.empty')}</p>
      ) : (
        <ul className={styles.list}>
          {lessons.map((lesson) => (
            <li key={lesson.id} className={styles.row}>
              <span className={styles.title}>{lesson.title}</span>
              <span className={styles.count}>{lesson.completions}</span>
              {/* Полоса дублирует число рядом, поэтому для скринридера скрыта. */}
              <span className={styles.bar} aria-hidden="true">
                <span
                  className={styles.barFill}
                  style={{
                    // maxCompletions = 0 бывает, когда уроки есть, а завершений
                    // ещё нет: делить на ноль нельзя.
                    width:
                      maxCompletions > 0
                        ? `${(lesson.completions / maxCompletions) * 100}%`
                        : '0%',
                  }}
                />
              </span>
            </li>
          ))}
        </ul>
      )}
    </DashboardCard>
  )
}
