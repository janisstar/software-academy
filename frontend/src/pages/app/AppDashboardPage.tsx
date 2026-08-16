import { useTranslation } from 'react-i18next'
import { AppStub } from '../../components/app/AppStub'

/** Личный дашборд ученика. Содержимое — отдельная задача. */
export function AppDashboardPage() {
  const { t } = useTranslation()

  return <AppStub title={t('app.stub.dashboard')} />
}
