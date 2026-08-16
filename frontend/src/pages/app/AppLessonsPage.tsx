import { useTranslation } from 'react-i18next'
import { AppStub } from '../../components/app/AppStub'

/** Каталог уроков ученика. Содержимое — отдельная задача. */
export function AppLessonsPage() {
  const { t } = useTranslation()

  return <AppStub title={t('app.stub.lessons')} />
}
