import { useTranslation } from 'react-i18next'
import { Button } from '../ui/Button'
import styles from './UserDangerZone.module.css'

type UserDangerZoneProps = {
  /** Можно ли удалять: себя и master удалить нельзя. */
  canDelete: boolean
  busy: boolean
  error: string | null
  onDelete: () => void
}

/** Необратимые действия: удаление пользователя вместе с его данными (GDPR). */
export function UserDangerZone({
  canDelete,
  busy,
  error,
  onDelete,
}: UserDangerZoneProps) {
  const { t } = useTranslation()

  return (
    <section className={styles.zone}>
      <h2 className={styles.title}>{t('people.user.dangerTitle')}</h2>

      <Button variant="danger" disabled={!canDelete || busy} onClick={onDelete}>
        {t('people.user.deleteUser')}
      </Button>
      <p className={styles.note}>{t('people.user.deleteNote')}</p>

      {error ? <p className={styles.error}>{error}</p> : null}
    </section>
  )
}
