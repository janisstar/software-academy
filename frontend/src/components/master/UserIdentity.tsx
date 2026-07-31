import { useTranslation } from 'react-i18next'
import { useAuth } from '../../hooks/useAuth'
import { activeRole } from '../../types/api'
import { ROLE_LABEL_KEYS } from './navConfig'
import styles from './UserIdentity.module.css'

interface UserIdentityProps {
  className?: string
}

/**
 * Кто вошёл: аватар-буква, имя и строка «роль · компания».
 * Используется в подвале бокового меню и в блоке профиля на Settings.
 */
export function UserIdentity({ className }: UserIdentityProps) {
  const { t } = useTranslation()
  const { user, company } = useAuth()

  const role = user ? activeRole(user.privileges) : null
  const displayName = user?.name || user?.un || t('master.unknownUser')

  // «Master · SevenHeaven». Название компании приезжает отдельным запросом,
  // поэтому его может не быть — тогда остаётся одна роль.
  const meta = [role ? t(ROLE_LABEL_KEYS[role]) : null, company?.name]
    .filter(Boolean)
    .join(' · ')

  return (
    <div className={[styles.identity, className].filter(Boolean).join(' ')}>
      <span className={styles.avatar} aria-hidden="true">
        {displayName.charAt(0).toUpperCase()}
      </span>
      <span className={styles.text}>
        <span className={styles.name}>{displayName}</span>
        {meta ? <small className={styles.meta}>{meta}</small> : null}
      </span>
    </div>
  )
}
