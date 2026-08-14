import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { PageShell } from '../../components/master/PageShell'
import { Card } from '../../components/ui/Card'
import { CONTENT_PATHS } from '../../constants/routes'
import styles from './LessonFormPage.module.css'

type LessonFormPageProps = {
  /** `new` — создание урока, `edit` — открытый из таблицы урок. */
  mode: 'new' | 'edit'
}

/**
 * Заглушка формы урока: сама форма — следующая задача. Страница нужна уже
 * сейчас, чтобы работали переходы из таблицы («Add lesson» и клик по строке).
 *
 * Один компонент на оба роута: пока они отличаются только заголовком.
 */
export function LessonFormPage({ mode }: LessonFormPageProps) {
  const { t } = useTranslation()

  return (
    <>
      <Link className={styles.backlink} to={CONTENT_PATHS.lessons}>
        {t('common.arrowBack')} {t('content.lessons.backToLessons')}
      </Link>

      <PageShell
        eyebrow={t('content.lessons.eyebrow')}
        title={t(
          mode === 'new'
            ? 'content.lessons.newTitle'
            : 'content.lessons.editTitle',
        )}
      >
        <Card>{t('common.inDevelopment')}</Card>
      </PageShell>
    </>
  )
}
