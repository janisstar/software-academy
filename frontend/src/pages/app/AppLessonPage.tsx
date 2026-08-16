import { useTranslation } from 'react-i18next'
import { AppStub } from '../../components/app/AppStub'

/**
 * Страница одного урока (плеер, описание, транскрипт) — отдельная задача.
 *
 * Заглушка стоит здесь, чтобы карточки каталога уже вели куда-то осмысленное:
 * без роута клик по карточке уводил бы человека на общий «*» и выкидывал
 * из портала.
 */
export function AppLessonPage() {
  const { t } = useTranslation()

  return <AppStub title={t('app.stub.lesson')} />
}
