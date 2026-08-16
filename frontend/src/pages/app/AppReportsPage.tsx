import { useTranslation } from 'react-i18next'
import { AppStub } from '../../components/app/AppStub'

/** Личные отчёты по прогрессу. Содержимое — отдельная задача. */
export function AppReportsPage() {
  const { t } = useTranslation()

  return <AppStub title={t('app.stub.reports')} />
}
