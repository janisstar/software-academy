import { useTranslation } from 'react-i18next'
import { AppStub } from '../../components/app/AppStub'

/** Настройки ученика (профиль, язык, плеер). Содержимое — отдельная задача. */
export function AppSettingsPage() {
  const { t } = useTranslation()

  return <AppStub title={t('app.stub.settings')} />
}
