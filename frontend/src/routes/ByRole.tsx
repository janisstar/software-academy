import { useAuth } from '../hooks/useAuth'
import { activeRole } from '../types/api'

interface ByRoleProps {
  /** Что показать роли master. */
  master: React.ReactNode
  /** Что показать всем остальным ролям (учебная область). */
  app: React.ReactNode
}

/**
 * Выбор по роли для адресов, ОБЩИХ у двух интерфейсов (`/reports`,
 * `/settings`).
 *
 * Один и тот же путь нельзя объявить в роутере дважды — победит первый, и
 * вторая роль до своей страницы уже не дошла бы. Поэтому такие адреса
 * объявлены один раз, а роль выбирает и каркас (MasterLayout / AppLayout),
 * и саму страницу.
 */
export function ByRole({ master, app }: ByRoleProps) {
  const { user } = useAuth()

  const role = user ? activeRole(user.privileges) : null

  return <>{role === 'master' ? master : app}</>
}
