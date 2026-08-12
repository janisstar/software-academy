import { useTranslation } from 'react-i18next'
import { Button } from '../ui/Button'
import { CodePanel } from '../ui/CodePanel'
import { Modal } from '../ui/Modal'
import type { ResetCode } from '../../types/api'
import styles from './ResetCodeModal.module.css'

type ResetCodeModalProps = {
  /** Ответ бэкенда: сам код и сколько минут он живёт. */
  resetCode: ResetCode
  /** Имя человека, которому код предназначен. */
  userName: string
  onClose: () => void
}

/**
 * Одноразовый код сброса пароля.
 *
 * Код показывается ОДИН раз: закрыли окно — второй раз его уже не увидеть,
 * нужно будет выпустить новый. Поэтому кнопка закрытия одна и явная.
 */
export function ResetCodeModal({
  resetCode,
  userName,
  onClose,
}: ResetCodeModalProps) {
  const { t } = useTranslation()

  return (
    <Modal
      title={t('people.user.resetCodeTitle')}
      onClose={onClose}
      actions={<Button onClick={onClose}>{t('people.user.done')}</Button>}
    >
      <p className={styles.intro}>
        {t('people.user.resetCodeIntro', {
          name: userName,
          minutes: resetCode.expires_minutes,
        })}
      </p>

      <div className={styles.panel}>
        <CodePanel
          code={resetCode.code}
          copyLabel={t('people.user.copyCode')}
          copiedLabel={t('people.user.copied')}
        />
      </div>

      <p className={styles.howto}>{t('people.user.resetCodeHowTo')}</p>
    </Modal>
  )
}
