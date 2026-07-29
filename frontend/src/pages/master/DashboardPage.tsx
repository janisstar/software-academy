import { useTranslation } from 'react-i18next'
import { PageShell } from '../../components/master/PageShell'
import { Card } from '../../components/ui/Card'
import { useAuth } from '../../hooks/useAuth'

export function DashboardPage() {
  const { t } = useTranslation()
  const { user } = useAuth()

  const name = user?.name || user?.un || t('master.unknownUser')

  return (
    <PageShell
      eyebrow={t('master.pages.eyebrow')}
      title={t('master.pages.greeting', { name })}
    >
      <Card>{t('common.inDevelopment')}</Card>
    </PageShell>
  )
}
