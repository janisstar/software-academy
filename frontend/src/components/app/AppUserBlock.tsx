import { useTranslation } from 'react-i18next'
import { Avatar } from '../ui/Avatar'
import { Button } from '../ui/Button'
import { useAuth } from '../../hooks/useAuth'
import { useDirectories } from '../../hooks/useDirectories'
import { activeRole } from '../../types/api'
import { useLogout } from '../../hooks/useLogout'
import styles from './AppUserBlock.module.css'

/**
 * Кто вошёл — правый край шапки: инициалы, имя, «Роль · Компания» и выход.
 *
 * Почему не master-овский `UserIdentity`: там аватар — одна буква, а название
 * роли берётся из словаря i18n. Учебной области по мокапу нужны инициалы
 * (общий `ui/Avatar`) и название роли С БЭКЕНДА (`GET /api/roles/`, как в
 * разделе People) — список ролей задаёт бэкенд. Общее у двух блоков только
 * взаимное расположение строк, поэтому это отдельный компонент области.
 *
 * `useDirectories(false)` — без компаний: их список отдаёт только master, а
 * название СВОЕЙ компании и так приходит в `useAuth`.
 */
export function AppUserBlock() {
  const { t } = useTranslation()
  const { user, company } = useAuth()
  const { roles } = useDirectories(false)
  const handleLogout = useLogout()

  const displayName = user?.name || user?.un || t('app.user.unknown')

  const role = user ? activeRole(user.privileges) : null
  // Пока справочник не приехал, показываем ключ роли — строка не «прыгает»
  // из пустоты, а лишь уточняется.
  const roleName = roles.find((item) => item.key === role)?.name ?? role

  // «Welder · Acme Oy». Любой из кусков может отсутствовать — тогда остаётся
  // второй, а разделитель не рисуем.
  const meta = [roleName, company?.name].filter(Boolean).join(' · ')

  return (
    <div className={styles.user}>
      <Avatar name={displayName} />

      <span className={styles.text}>
        <span className={styles.name}>{displayName}</span>
        {meta ? <small className={styles.meta}>{meta}</small> : null}
      </span>

      <Button variant="ghost" onClick={handleLogout}>
        {t('common.logOut')}
      </Button>
    </div>
  )
}
