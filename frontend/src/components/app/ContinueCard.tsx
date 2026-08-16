import { useTranslation } from 'react-i18next'
import { LinkButton } from '../ui/LinkButton'
import type { LessonWithStatus } from '../../types/api'
import { formatDuration } from '../../utils/lessons'
import { LessonThumb } from './LessonThumb'
import styles from './ContinueCard.module.css'

interface ContinueCardProps {
  lesson: LessonWithStatus
  /** Куда ведёт кнопка. */
  to: string
}

/**
 * «Continue learning» — мятная карточка недосмотренного урока: превью,
 * название, длительность, полоса прогресса и кнопка перехода.
 *
 * Показывается только когда бэкенд вернул такой урок: пустой блок «вы ничего
 * не начинали» ничего не сообщает — для новичка есть отдельное состояние.
 */
export function ContinueCard({ lesson, to }: ContinueCardProps) {
  const { t } = useTranslation()

  // Процент приходит с бэкенда; на всякий случай держим его в 0…100 —
  // иначе полоса вылезла бы за дорожку.
  const percent = Math.min(100, Math.max(0, Math.round(lesson.watch_percent)))

  return (
    <section className={styles.card}>
      <LessonThumb size="hero" />

      <div className={styles.body}>
        <p className={styles.eyebrow}>{t('app.dashboard.continue.eyebrow')}</p>
        <h2 className={styles.title}>{lesson.title}</h2>
        <p className={styles.meta}>{formatDuration(lesson.duration_seconds)}</p>

        <div className={styles.progressRow}>
          {/* Полоса дублирует число справа, поэтому для скринридера скрыта
              (тот же приём, что у master в PopularLessons). */}
          <span className={styles.track} aria-hidden="true">
            <span className={styles.fill} style={{ width: `${percent}%` }} />
          </span>
          <span className={styles.percent}>
            {t('app.dashboard.percent', { value: percent })}
          </span>
        </div>
      </div>

      {/* Кнопка ведёт в каталог: страницы урока в приложении ещё нет —
          см. TODO на странице дашборда. */}
      <LinkButton to={to} className={styles.cta}>
        {t('app.dashboard.continue.action')}
        <span aria-hidden="true">{t('common.arrow')}</span>
      </LinkButton>
    </section>
  )
}
