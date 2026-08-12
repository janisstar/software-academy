import { useTranslation } from 'react-i18next'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'
import { Switch } from '../ui/Switch'
import styles from './UserAccessCard.module.css'

type UserAccessCardProps = {
  locked: boolean
  /** Можно ли закрывать доступ: себе и master — нельзя. */
  canLock: boolean
  /** Идёт запрос: кнопки замирают, чтобы не отправить его дважды. */
  busy: boolean
  error: string | null
  onToggleLock: (nextLocked: boolean) => void
  onIssueResetCode: () => void
}

/** Правая карточка: вход в систему и восстановление пароля. */
export function UserAccessCard({
  locked,
  canLock,
  busy,
  error,
  onToggleLock,
  onIssueResetCode,
}: UserAccessCardProps) {
  const { t } = useTranslation()

  return (
    <Card>
      <h2 className={styles.title}>{t('people.user.accessTitle')}</h2>

      <div className={styles.toggleRow}>
        <span>{t('people.user.accountActive')}</span>
        <Switch
          checked={!locked}
          disabled={!canLock || busy}
          label={t(
            locked ? 'people.user.unlockAction' : 'people.user.lockAction',
          )}
          onChange={(nextActive) => onToggleLock(!nextActive)}
        />
      </div>
      <p className={styles.note}>{t('people.user.accessNote')}</p>

      <div className={styles.action}>
        <Button variant="outline" disabled={busy} onClick={onIssueResetCode}>
          {t('people.user.issueResetCode')}
        </Button>
        <p className={styles.note}>{t('people.user.issueResetCodeNote')}</p>
      </div>

      {error ? <p className={styles.error}>{error}</p> : null}
    </Card>
  )
}
