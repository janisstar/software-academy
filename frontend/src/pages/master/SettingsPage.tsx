import { useTranslation } from 'react-i18next'
import { PageShell } from '../../components/master/PageShell'
import { UserIdentity } from '../../components/master/UserIdentity'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { useLogout } from '../../hooks/useLogout'
import styles from './SettingsPage.module.css'

export function SettingsPage() {
  const { t } = useTranslation()
  const handleLogout = useLogout()

  return (
    <PageShell
      eyebrow={t('master.pages.eyebrow')}
      title={t('master.pages.settings')}
    >
      {/* Профиль и выход. На мобильном бокового меню нет, и это единственное
          место, откуда можно выйти из аккаунта. */}
      <Card className={styles.profile}>
        <UserIdentity />
        <Button variant="ghost" onClick={handleLogout}>
          {t('common.logOut')}
        </Button>
      </Card>

      <Card>{t('common.inDevelopment')}</Card>
    </PageShell>
  )
}
