import { useTranslation } from 'react-i18next'
import { PageShell } from '../../components/master/PageShell'
import { Card } from '../../components/ui/Card'

/**
 * Заглушка формы создания пользователя: нужна, чтобы кнопка «+ Add user»
 * вела на живую страницу. Содержимое появится в следующей части раздела.
 */
export function NewUserPage() {
  const { t } = useTranslation()

  return (
    <PageShell
      eyebrow={t('people.users.eyebrow')}
      title={t('people.users.newTitle')}
    >
      <Card>{t('common.inDevelopment')}</Card>
    </PageShell>
  )
}
