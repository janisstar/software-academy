import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '../ui/Button'
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
  const [copied, setCopied] = useState(false)

  const copy = () => {
    void navigator.clipboard
      .writeText(resetCode.code)
      .then(() => setCopied(true))
      // Буфер обмена может быть недоступен (нет https, отказ в правах) —
      // тогда код всё равно виден на экране и его можно выделить руками.
      .catch(() => setCopied(false))
  }

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
        <p className={styles.code}>{resetCode.code}</p>
        <Button variant="outline" onClick={copy}>
          {copied ? t('people.user.copied') : t('people.user.copyCode')}
        </Button>
      </div>

      <p className={styles.howto}>{t('people.user.resetCodeHowTo')}</p>
    </Modal>
  )
}
