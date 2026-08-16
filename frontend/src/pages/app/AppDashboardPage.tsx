import { useTranslation } from 'react-i18next'
import { ContinueCard } from '../../components/app/ContinueCard'
import { RecentLessons } from '../../components/app/RecentLessons'
import { RecommendedLessons } from '../../components/app/RecommendedLessons'
import { StartLearningCard } from '../../components/app/StartLearningCard'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { StatCard } from '../../components/ui/StatCard'
import { APP_PATHS } from '../../constants/routes'
import { useAuth } from '../../hooks/useAuth'
import { useDashboard } from '../../hooks/useDashboard'
import { apiErrorText } from '../../utils/apiError'
import styles from './AppDashboardPage.module.css'

// TODO: → страница урока, когда появится роут. Пока её нет, ВСЕ переходы
// к урокам (кнопка Continue, карточки Recommended, строки Recently, кнопка
// новичка) ведут в каталог.
const LESSON_LINK = APP_PATHS.lessons

/**
 * Личный дашборд ученика: сводка прогресса, недосмотренный урок,
 * рекомендации и недавно открытые уроки.
 *
 * Данные грузятся ОДИН раз (`useDashboard`), автообновления нет. Своей
 * проверки роли на странице нет намеренно: в учебную область master не
 * попадает — его разворачивает `AreaGate area="app"` в маршрутах.
 */
export function AppDashboardPage() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const { data, loading, error, retry } = useDashboard()

  const name = user?.name || user?.un || t('app.user.unknown')

  // Бэкенд отдаёт все начатые уроки, а в hero-карточке место одному —
  // берём первый: список уже отсортирован сервером.
  const continueLesson = data?.continue_learning[0] ?? null

  return (
    <>
      <div className={styles.greeting}>
        <h1>{t('app.dashboard.greeting', { name })}</h1>
        <p className={styles.caption}>{t('app.dashboard.caption')}</p>
      </div>

      {/* Три состояния взаимоисключающие: грузим → ошибка → данные. */}
      {loading ? <Card>{t('common.loading')}</Card> : null}

      {error !== null ? (
        <Card className={styles.error}>
          {/* Текст ошибки — с бэкенда; свой только на случай обрыва сети. */}
          <p>{apiErrorText(error, t('app.dashboard.error'))}</p>
          <Button onClick={retry}>{t('app.dashboard.retry')}</Button>
        </Card>
      ) : null}

      {data && !loading && error === null ? (
        <div className={styles.blocks}>
          {data.is_new_user ? (
            // Новичок: вместо Continue и сводки — приглашение начать.
            <StartLearningCard to={LESSON_LINK} />
          ) : (
            <div className={styles.summary}>
              {/* Начатых уроков может не быть — тогда блока просто нет. */}
              {continueLesson ? (
                <ContinueCard lesson={continueLesson} to={LESSON_LINK} />
              ) : null}

              <div className={styles.stats}>
                <StatCard
                  label={t('app.dashboard.stats.completion')}
                  value={t('app.dashboard.percent', {
                    value: data.summary.completion_percent,
                  })}
                />
                <StatCard
                  label={t('app.dashboard.stats.completed')}
                  value={data.summary.completed}
                />
                <StatCard
                  label={t('app.dashboard.stats.inProgress')}
                  value={data.summary.in_progress}
                />
              </div>
            </div>
          )}

          {/* Пустые ряды не показываем: заголовок без карточек ничего
              не сообщает. Recommended виден и новичку — бэкенд отдаёт
              рекомендации по роли. */}
          {data.recommended.length > 0 ? (
            <RecommendedLessons
              lessons={data.recommended}
              lessonTo={LESSON_LINK}
              allTo={APP_PATHS.lessons}
            />
          ) : null}

          {!data.is_new_user && data.recently_watched.length > 0 ? (
            <RecentLessons
              lessons={data.recently_watched}
              lessonTo={LESSON_LINK}
            />
          ) : null}
        </div>
      ) : null}
    </>
  )
}
