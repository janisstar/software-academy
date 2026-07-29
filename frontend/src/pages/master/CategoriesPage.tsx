import { useTranslation } from 'react-i18next'
import { PageShell } from '../../components/master/PageShell'
import { Card } from '../../components/ui/Card'

export function CategoriesPage() {
  const { t } = useTranslation()

  return (
    <PageShell
      eyebrow={t('master.pages.eyebrow')}
      title={t('master.pages.categories')}
    >
      <Card>{t('common.inDevelopment')}</Card>
    </PageShell>
  )
}
